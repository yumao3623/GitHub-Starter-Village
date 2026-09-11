import { z } from "zod";

export const projectIds = ["reed", "cloud", "mist"] as const;
export const categories = ["environment", "permission", "maintenance"] as const;
export const verdicts = ["suitable", "unsuitable", "uncertain"] as const;
export const categoryLabels = { environment: "运行环境", permission: "使用条件", maintenance: "维护线索" } as const;
export const verdictLabels = { suitable: "适合当前委托", unsuitable: "不符合当前条件", uncertain: "信息不足，需核实" } as const;
export const dossierTabs = [
  { id: "requirements", english: "Requirements", chinese: "运行要求" },
  { id: "license", english: "License", chinese: "许可证" },
  { id: "release", english: "Releases", chinese: "发布版本" },
  { id: "stars", english: "Stars", chinese: "收藏数量" },
] as const;
export type ProjectId = typeof projectIds[number];
export type Category = typeof categories[number];
export type Verdict = typeof verdicts[number];
export type DossierTab = typeof dossierTabs[number]["id"];

const factSchema = z.object({
  id: z.string(), tab: z.enum(["requirements", "license", "release", "stars"]),
  category: z.enum(categories).nullable(), title: z.string(), detail: z.string(), termId: z.string(),
});
const projectSchema = z.object({
  id: z.enum(projectIds), name: z.string(), repository: z.string(), description: z.string(),
  verdict: z.enum(verdicts), explanation: z.string(), facts: z.array(factSchema).length(4),
});
export type AppraisalProject = z.infer<typeof projectSchema>;
export type Evidence = z.infer<typeof factSchema>;

const source = {
  requirements: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes",
  license: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository",
  releases: "https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases",
  stars: "https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars",
};
export const appraisalSources = Object.entries(source).map(([id, url]) => ({ id, url, lastVerifiedAt: "2026-09-10" }));

function project(id: ProjectId, name: string, node: number, license: boolean, release: boolean, stars: string, verdict: Verdict): AppraisalProject {
  return projectSchema.parse({
    id, name, repository: `jianghu/${id}-map`,
    description: id === "reed" ? "轻巧的离线地图工具" : id === "cloud" ? "适合自定义的地图组件" : "留存旧路线的地图档案",
    verdict,
    explanation: verdict === "suitable" ? "环境符合，MIT 文件明确列出使用条件，也有可追溯的发布记录。它适合当前委托，但不代表无需检查安全和实际功能。"
      : verdict === "unsuitable" ? "当前电脑只有 Node.js 22，这个项目要求更高版本。不升级环境，就不符合本次委托。星数不能改变运行要求。"
      : "环境能满足，但没有明确许可证。公开可见不等于授权任意改编与分发，需要先确认许可；归档也提醒你留意维护状态。",
    facts: [
      { id: `${id}-requirements`, tab: "requirements", category: "environment", title: `Node.js ≥ ${node} · 支持离线`, detail: `README 的 Requirements 写明需要 Node.js ${node} 或更高版本；安装说明完整，安装依赖后可离线运行。委托电脑目前是 Node.js 22。`, termId: "requirements" },
      { id: `${id}-license`, tab: "license", category: "permission", title: license ? "MIT · 保留版权与许可声明" : "没有 LICENSE 文件", detail: license ? "仓库的 MIT 许可允许在遵守条件的前提下使用、修改和分发。复制或分发时保留版权与许可声明。实际项目仍需检查第三方素材的单独许可。" : "资料里找不到明确的使用许可。不要把 Public 理解为可以随意复制、修改和分发，先向维护者确认。", termId: "license" },
      { id: `${id}-release`, tab: "release", category: "maintenance", title: release ? "Release v1.2 · 有变更说明" : "Archived · 已归档", detail: release ? "Releases 有 v1.2，Changelog 说明了修复内容。这是判断维护情况的一条线索，不是安全认证，也不能单靠日期判断好坏。" : "Archived 表示仓库已归档，主要以只读形式保留。旧代码仍可有参考价值，但不要假定有人持续修复。", termId: release ? "release" : "archived" },
      { id: `${id}-stars`, tab: "stars", category: null, title: `${stars} Stars`, detail: "Stars 是用户收藏与表达关注的数量。它不能证明环境适配、许可证或维护安全；不 Star 也可以使用项目。", termId: "star" },
    ],
  });
}

export function getProjects(variant: number): AppraisalProject[] {
  const second = variant % 2 === 1;
  return [
    project("reed", "芦岸图", second ? 24 : 20, true, true, "128", second ? "unsuitable" : "suitable"),
    project("cloud", "云栈图", second ? 20 : 24, true, true, "8,640", second ? "suitable" : "unsuitable"),
    project("mist", "旧雾图", 20, false, false, "2,031", "uncertain"),
  ];
}

export const appraisalStory = {
  title: "集市鉴宝", subtitle: "看项目，先看证据。", npcName: "鉴图人 · 青砚",
  opening: "少侠，《江湖夜行图》需要一件趁手的地图工具。摊上三卷看似都不错，别被热闹迷了眼。查环境、查许可，再看维护线索。",
  brief: "为夜行图选一个可改编并分发、安装后可离线使用的地图工具。电脑已有 Node.js 22，本次不升级环境。",
  guide: "选卷轴 → 查看四类资料 → 收集证据 → 放入三个证据栏 → 作出鉴定。三卷鉴定后，交付推荐。",
  next: "你找到了合适的地图工具。接下来，沿驿道进入飞鸽传书，亲手分拣收藏、关注与通知。",
  safety: "所有项目、数据与操作均为教学模拟，不读取你的 GitHub 账号。",
};
