import { highlight } from '@/lib/highlight';

export default async function CodeBlock({ code, language }: { code: string; language: string }) {
  const html = await highlight(code, language);
  return <div className="code-block" dangerouslySetInnerHTML={{ __html: html }} />;
}