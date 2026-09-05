const key = 'yourskinplus-meta-owner-setup-v1';
const checks = [...document.querySelectorAll('[data-owner-check]')];
let completed = {};
try {
  const stored = JSON.parse(localStorage.getItem(key) || '{}');
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) completed = stored;
} catch { document.getElementById('owner-storage').textContent = '이 브라우저에서는 완료 표시를 저장할 수 없어요. 전달 내용을 복사해 보관하세요.'; }
const message = document.getElementById('owner-message');
function render() {
  const count = checks.filter(input => input.checked).length;
  document.getElementById('owner-count').textContent = `${count} / ${checks.length} 완료`;
  document.getElementById('owner-progress').value = count;
  checks.forEach(input => { document.querySelector(`[data-nav-step="${input.dataset.ownerCheck}"]`).dataset.complete = String(input.checked); });
  const rows = checks.map((input,i) => `${input.checked ? '완료' : '미확인'} · ${i+1}번 ${document.getElementById(`title-${input.dataset.ownerCheck}`).textContent}`);
  message.value = `대표님 계정 준비 현황 (${count}/${checks.length})\n${rows.join('\n')}\n\n페이스북 브랜드 페이지 주소:\n브랜드 인스타그램 아이디(@로 시작):\n회사 관리함 이름:\n초대한 담당자 이메일:\n담당자 초대 수락 여부:\n막힌 단계 번호와 화면 문구:\n\n비밀번호·인증번호·복구 코드는 보내지 않아요.`;
}
function save() {
  try { localStorage.setItem(key, JSON.stringify(Object.fromEntries(checks.map(input => [input.dataset.ownerCheck, input.checked])))); }
  catch { document.getElementById('owner-storage').textContent = '완료 표시를 저장하지 못했어요. 전달 내용을 복사해 보관하세요.'; }
}
checks.forEach(input => {
  input.disabled = false;
  input.checked = completed[input.dataset.ownerCheck] === true;
  input.addEventListener('change', () => { save(); render(); });
});
const printButton = document.getElementById('owner-print');
const copyButton = document.getElementById('owner-copy');
const resetButton = document.getElementById('owner-reset');
[printButton,copyButton,resetButton].forEach(button => { button.disabled = false; });
printButton.addEventListener('click', () => window.print());
let printDetails = [];
window.addEventListener('beforeprint', () => {
  printDetails = [...document.querySelectorAll('.owner-guide details')].map(element => [element,element.open]);
  printDetails.forEach(([element]) => { element.open = true; });
});
window.addEventListener('afterprint', () => { printDetails.forEach(([element,open]) => { element.open = open; }); });
copyButton.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(message.value); document.getElementById('owner-feedback').textContent = '복사했어요. 카카오톡이나 이메일에 붙여 넣고 빈칸을 채워 주세요.'; }
  catch { message.focus(); message.select(); document.getElementById('owner-feedback').textContent = '내용을 선택했어요. 복사 메뉴 또는 Ctrl+C(맥은 ⌘C)를 이용해 주세요.'; }
});
resetButton.addEventListener('click', () => {
  if (!window.confirm('이 브라우저의 7개 완료 표시를 모두 지울까요? 실제 계정 설정은 바뀌지 않아요.')) return;
  checks.forEach(input => { input.checked = false; }); save(); render();
});
render();
