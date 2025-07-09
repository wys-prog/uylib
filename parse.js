function cleanHtml(html) {
  // Supprime les espaces/sauts de ligne entre les balises (ex: <div>\n  <div> → <div><div>)
  return html.replace(/>\s+</g, '><');
}

export function parseBookFile(raw) {
  const metaMatch = raw.match(/\.meta:([\s\S]*?);/);
  const bytesMatch = raw.match(/\.bytes:\[(.+?)\];/s); // note le ? pour non-greedy
  const coverMatch = raw.match(/\.cover:(.+)$/s); // capture tout le reste (base64)

  const decode = str => decodeURIComponent(str);

  if (!metaMatch || !bytesMatch) throw new Error('Format invalide');

  const metaRaw = metaMatch[1];
  const html = decode(bytesMatch[1]);

  const meta = {};
  const regex = /@([\w\d_]+):'(.*?)'(?:,|$)/gs;
  let match;
  while ((match = regex.exec(metaRaw)) !== null) {
    const key = match[1];
    let value = decode(match[2]);

    if (['highlights', 'notes'].includes(key)) {
      try {
        value = JSON.parse(value);
      } catch (e) {}
    } else if (key === 'scrollY') {
      value = parseInt(value);
    }

    meta[key] = value;
  }

  // ✅ cover (en base64)
  if (coverMatch) {
    meta.cover = coverMatch[1].trim();
  }

  return { meta, html };
}


export function buildBookRaw(meta, html) {
  const encode = str => encodeURIComponent(String(str));
  const metaEntries = Object.entries(meta)
    .filter(([key]) => !['highlights', 'notes', 'scrollY', 'cover'].includes(key))
    .map(([key, value]) => `@${key}:'${encode(value)}'`);

  if (meta.highlights?.length) {
    metaEntries.push(`@highlights:'${encode(JSON.stringify(meta.highlights))}'`);
  }
  if (meta.notes?.length) {
    metaEntries.push(`@notes:'${encode(JSON.stringify(meta.notes))}'`);
  }
  if (meta.scrollY) {
    metaEntries.push(`@scrollY:'${meta.scrollY}'`);
  }

  const metaPart = `.meta:${metaEntries.join(',')};`;
  const htmlPart = `.bytes:[${encode(cleanHtml(html))}];`;

  let raw = `${metaPart}\n${htmlPart}`;
  if (meta.cover) {
    raw += `\n.cover:${meta.cover}`;
  }

  return raw;
}
