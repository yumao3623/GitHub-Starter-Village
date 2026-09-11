import brand from "./brand.json";
export const brandConfig = { ...brand, releasesUrl: `${brand.repositoryUrl}/releases/latest` } as const;
export type BrandConfig = typeof brandConfig;
