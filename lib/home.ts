export const HOME_PROJECTS = 3;
export const HOME_SERVICES = 6;

export function pickHome<T extends { featured?: boolean }>(items: T[], limit: number): T[] {
  const featured = items.filter((item) => item.featured);
  return (featured.length ? featured : items).slice(0, limit);
}
