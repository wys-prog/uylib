type Manifest = {
  meta: Record<string, string>,
  pagePaths: string[]
};

export function parseManifest(manifestContent: string): Manifest {
  const meta: Record<string, string> = {};
  const pagePaths: string[] = [];

  const lines = manifestContent.split('\n');
  for (let rawLine of lines) {
    const line = rawLine.trim();

    if (!line.startsWith('@')) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(1, colonIndex).trim(); // Enlève le "@"
    const value = line.slice(colonIndex + 1).trim();

    if (key.toLowerCase() === 'page') {
      pagePaths.push(value);
    } else {
      meta[key] = value;
    }
  }

  return { meta, pagePaths };
}
