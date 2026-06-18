/** Full-site homepage while public `/` shows Coming Soon. */
export const FULL_SITE_HOME = "/preview";

export function homeSectionLink(sectionId: string) {
  return `${FULL_SITE_HOME}#${sectionId}`;
}

export function mapNavLinks(
  links: readonly { href: string; label: string }[],
) {
  return links.map((link) => ({
    ...link,
    href: link.href.replace("/#", `${FULL_SITE_HOME}#`),
  }));
}
