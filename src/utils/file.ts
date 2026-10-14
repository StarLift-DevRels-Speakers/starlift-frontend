const megabyte = 1024 * 1024;

/** File size in megabytes with one decimal, e.g. "2,1 МБ". */
export function formatFileSize(bytes: number): string {
  const value = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(bytes / megabyte);
  return `${value} МБ`;
}
