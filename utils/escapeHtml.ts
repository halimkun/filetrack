export function escapeHtml(
  rawHtml: string,
  options?: {
    removeDangerousTags?: boolean;
    maxLength?: number;
  }
): string {
  if (!rawHtml) {
    return '';
  }

  let sanitized = rawHtml;

  // Optional: Hapus tag berbahaya
  if (options?.removeDangerousTags) {
    sanitized = sanitized
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
      .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '');
  }

  // Escape karakter khusus
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#096;')
    .replace(/\//g, '&#047;');

  // Optional: potong jika terlalu panjang
  if (options?.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength) + '...';
  }

  return sanitized;
}

export function unescapeHtml(escapedHtml: string): string {
  if (!escapedHtml) {
    return '';
  }

  return escapedHtml
    .replace(/&#047;/g, '/')
    .replace(/&#096;/g, '`')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}