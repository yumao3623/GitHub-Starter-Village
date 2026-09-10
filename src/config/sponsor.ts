export type SponsorConfig = {
  enabled: boolean;
  title: string;
  description: string;
  alipayQrPath?: string;
  wechatQrPath?: string;
  disclosure: string;
};

export const sponsorConfig: SponsorConfig = {
  enabled: false,
  title: "支持 GitHub 新手村",
  description: "如果这个开源项目帮助到了你，可以自愿支持后续维护。",
  disclosure: "赞助完全自愿，不会解锁额外内容，也不会影响任何功能。",
};
