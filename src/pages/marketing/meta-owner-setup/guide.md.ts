import { ownerMarkdown } from '../../../data/metaOwnerGuide.mjs';
export function GET() {
  return new Response(ownerMarkdown(), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
