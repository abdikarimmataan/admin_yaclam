/** Build a WhatsApp chat URL from a phone number or existing link. */
export function toWhatsAppUrl(value: string | undefined | null): string | null {
  const v = value?.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const digits = v.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}
