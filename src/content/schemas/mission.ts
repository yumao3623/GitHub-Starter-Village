import { z } from "zod";

export const missionTaskSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["choice", "checklist", "simulator"]),
  prompt: z.string().min(8),
  options: z.array(z.string().min(1)).min(2),
  correctIndex: z.number().int().nonnegative(),
  correctFeedback: z.string().min(8),
  incorrectFeedback: z.string().min(8),
  termIds: z.array(z.string().min(1)).min(1),
});

export const missionSchema = z.object({
  id: z.string().min(1),
  chapter: z.number().int().min(0).max(13),
  phase: z.number().int().min(1).max(3),
  title: z.string().min(2),
  shortTitle: z.string().min(2),
  summary: z.string().min(12),
  story: z.string().min(12),
  objectives: z.array(z.string().min(4)).min(1),
  termIds: z.array(z.string().min(1)).min(1),
  uiTerms: z.array(z.string().min(1)).min(1),
  tasks: z.array(missionTaskSchema).min(1),
  completionMessage: z.string().min(8),
  externalAction: z.boolean(),
  verificationMode: z.enum(["game", "self-check"]),
});

export type Mission = z.infer<typeof missionSchema>;
export type MissionTask = z.infer<typeof missionTaskSchema>;
