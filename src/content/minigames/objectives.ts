import { z } from "zod";
import { categories, projectIds } from "./appraisal";

export const objectiveSchema = z.object({
  id: z.string(), title: z.string(), termIds: z.array(z.string()),
  predicate: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("attached"), category: z.enum(categories) }),
    z.object({ kind: z.literal("appraised") }),
    z.object({ kind: z.literal("delivered") }),
  ]),
});
export const appraisalObjectives = [
  { id: "environment-evidence", title: "核对三卷运行条件", termIds: ["requirements"], predicate: { kind: "attached", category: "environment" } },
  { id: "permission-evidence", title: "核对三卷使用许可", termIds: ["license"], predicate: { kind: "attached", category: "permission" } },
  { id: "maintenance-evidence", title: "核对发布与归档线索", termIds: ["release", "archived"], predicate: { kind: "attached", category: "maintenance" } },
  { id: "three-appraisals", title: "完成三卷有据鉴定", termIds: [], predicate: { kind: "appraised" } },
  { id: "market-delivered", title: "交付适合委托的推荐", termIds: [], predicate: { kind: "delivered" } },
].map(item => objectiveSchema.parse(item));

// Input actions express intent, never a client-supplied `correct` or `completed` flag.
export const appraisalIntentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("inspect"), project: z.enum(projectIds), tab: z.enum(["requirements", "license", "release", "stars"]) }),
  z.object({ type: z.literal("collect"), factId: z.string().min(1) }),
  z.object({ type: z.literal("attach"), category: z.enum(categories) }),
  z.object({ type: z.literal("verdict"), verdict: z.enum(["suitable", "unsuitable", "uncertain"]) }),
  z.object({ type: z.literal("deliver"), project: z.enum(projectIds) }),
]);
