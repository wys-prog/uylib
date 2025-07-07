export function parseBookFile(content: string) {
  // Prend tout entre .meta: et le premier ;
  const metaMatch = content.match(/\.meta:([^;]+);/);
  // Prend tout entre .bytes:[ et ];
  const bytesMatch = content.match(/\.bytes:\[(.*)\];$/s);

  let meta: Record<string, string> = {};
  if (metaMatch) {
    metaMatch[1].split(',').forEach(pair => {
      const [k, v] = pair.split(':');
      if (k && v) {
        meta[k.replace(/^@/, '').trim()] = v.replace(/^'/, '').replace(/'$/, '').trim();
      }
    });
  }

  const html = bytesMatch ? bytesMatch[1].trim() : '';
  return { meta, html };
}