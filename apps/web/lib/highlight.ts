import { cacheLife } from 'next/cache';
import { createHighlighter, type Highlighter } from 'shiki';

const languages = ['typescript', 'tsx', 'javascript', 'jsx', 'css', 'html', 'json', 'bash'] as const;
const theme = 'github-dark';

let highlighter: Promise<Highlighter> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighter({ themes: [theme], langs: [...languages] });
  return highlighter;
}

export async function highlight(code: string, language: string) {
  'use cache';
  cacheLife('max');

  const lang = (languages as readonly string[]).includes(language) ? language : 'text';
  const shiki = await getHighlighter();

  return shiki.codeToHtml(code, {
    lang,
    theme,
    transformers: [
      {
        pre(node) {
          node.properties.tabindex = '0';
        },
      },
    ],
  });
}