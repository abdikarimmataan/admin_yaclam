export type FooterLinkItem = {
  label: string;
  url: string;
  isVisible: boolean;
};

export type FooterColumnItem = {
  title: string;
  isVisible: boolean;
  links: FooterLinkItem[];
};

export function emptyFooterLink(): FooterLinkItem {
  return { label: "", url: "", isVisible: true };
}

export function emptyFooterColumn(): FooterColumnItem {
  return { title: "", isVisible: true, links: [emptyFooterLink()] };
}

export function normalizeFooterLink(value: unknown): FooterLinkItem {
  const r = value as { label?: string; url?: string; isVisible?: boolean };
  return {
    label: String(r?.label ?? ""),
    url: String(r?.url ?? ""),
    isVisible: r?.isVisible !== false,
  };
}

export function normalizeFooterColumns(value: unknown): FooterColumnItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((col) => {
    const c = col as {
      title?: string;
      isVisible?: boolean;
      links?: unknown[];
    };
    const links = Array.isArray(c.links)
      ? c.links.map(normalizeFooterLink)
      : [emptyFooterLink()];
    return {
      title: String(c.title ?? ""),
      isVisible: c.isVisible !== false,
      links: links.length ? links : [emptyFooterLink()],
    };
  });
}

export function footerColumnsToPayload(items: FooterColumnItem[]): FooterColumnItem[] {
  return items
    .map((col) => ({
      title: col.title.trim(),
      isVisible: col.isVisible,
      links: col.links
        .map((link) => ({
          label: link.label.trim(),
          url: link.url.trim(),
          isVisible: link.isVisible,
        }))
        .filter((link) => link.label || link.url),
    }))
    .filter((col) => col.title || col.links.length);
}
