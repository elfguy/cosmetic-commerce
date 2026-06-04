const CHATGPT_URL_RE = /^https:\/\/chatgpt\.com\/(?:c\/|images\/?|g\/|$)/;

function tabUrl(page) {
  try { return page.url(); } catch { return ''; }
}

function tabTitle(page) {
  try { return page.title(); } catch { return Promise.resolve(''); }
}

function isChatGptImageAgentTab(url) {
  return CHATGPT_URL_RE.test(url || '');
}

async function isBusyChatGptTab(page) {
  try {
    return await page.evaluate(() => !!document.querySelector(
      '[aria-label*="중지"], [aria-label*="Stop"], button[data-testid="stop-button"]'
    ));
  } catch {
    // If the page cannot be inspected, do not close it blindly.
    return true;
  }
}

/**
 * Close stale ChatGPT/Images agent tabs in the Chrome instance connected via CDP.
 *
 * Safety rules:
 * - Only touches chatgpt.com image/chat tabs, never arbitrary personal tabs.
 * - Keeps the current/target page, optional keepUrls, and busy generating tabs.
 * - Leaves at least one ChatGPT Images workspace tab if there is no explicit keep page.
 *
 * @param {import('playwright').BrowserContext} ctx
 * @param {object} [opts]
 * @param {import('playwright').Page} [opts.keepPage] Page that must stay open.
 * @param {string[]} [opts.keepUrls] Exact or prefix URLs to keep.
 * @param {number} [opts.maxTabs] Max ChatGPT agent tabs to leave open. Default 3.
 * @param {boolean} [opts.dryRun] If true, only report what would close.
 */
export async function cleanupStaleImageAgentTabs(ctx, opts = {}) {
  const {
    keepPage = null,
    keepUrls = [],
    maxTabs = Number(process.env.IMAGE_AGENT_MAX_CHATGPT_TABS || 3),
    dryRun = process.env.IMAGE_AGENT_TAB_CLEANUP_DRY_RUN === '1',
  } = opts;

  const pages = ctx.pages();
  const keepSet = new Set();
  if (keepPage) keepSet.add(keepPage);

  const keepUrlList = keepUrls.filter(Boolean);
  const candidates = [];
  for (const page of pages) {
    const url = tabUrl(page);
    if (!isChatGptImageAgentTab(url)) continue;

    const explicitKeep = keepSet.has(page) || keepUrlList.some(k => url === k || url.startsWith(k));
    const title = await tabTitle(page).catch(() => '');
    const busy = explicitKeep ? false : await isBusyChatGptTab(page);
    candidates.push({ page, url, title, explicitKeep, busy });
  }

  // Newer Playwright pages are later in ctx.pages(); keep explicit and busy tabs, then newest tabs.
  const protectedTabs = new Set(candidates.filter(c => c.explicitKeep || c.busy).map(c => c.page));
  const closable = candidates.filter(c => !protectedTabs.has(c.page));

  const keepNewestCount = Math.max(0, maxTabs - protectedTabs.size);
  const sortedClosable = closable.slice();
  const toKeepByRecency = new Set(sortedClosable.slice(-keepNewestCount).map(c => c.page));
  let toClose = sortedClosable.filter(c => !toKeepByRecency.has(c.page));

  // If no explicit keep page exists, never close every Images workspace tab.
  if (!keepPage && candidates.length - toClose.length === 0 && toClose.length) {
    toClose = toClose.slice(0, -1);
  }

  const closed = [];
  const skipped = candidates.filter(c => !toClose.some(x => x.page === c.page)).map(c => ({
    title: c.title,
    url: c.url,
    reason: c.explicitKeep ? 'keep' : c.busy ? 'busy' : 'recent',
  }));

  for (const item of toClose) {
    if (dryRun) {
      closed.push({ title: item.title, url: item.url, dryRun: true });
      continue;
    }
    try {
      await item.page.close({ runBeforeUnload: false });
      closed.push({ title: item.title, url: item.url });
    } catch (error) {
      skipped.push({ title: item.title, url: item.url, reason: `close-failed: ${error.message}` });
    }
  }

  const result = { totalChatGptTabs: candidates.length, closed: closed.length, closedTabs: closed, skipped };
  console.log('image-agent-tab-cleanup', JSON.stringify(result, null, 2));
  return result;
}
