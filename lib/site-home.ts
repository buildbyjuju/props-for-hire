/** Public marketing homepage. */
export const FULL_SITE_HOME = "/";

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
