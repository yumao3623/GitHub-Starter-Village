import { z } from "zod";

export const vocabularyKindSchema = z.enum([
  "concept",
  "navigation",
  "action",
  "status",
  "permission",
  "security",
  "git-command",
  "file",
  "community",
]);

export const termPrioritySchema = z.enum(["P0", "P1", "P2"]);

export const vocabularyItemSchema = z.object({
  id: z.string().min(1),
  english: z.string().min(1),
  chinese: z.string().min(1),
  literalTranslation: z.string().min(1).optional(),
  beginnerMeaning: z.string().min(12),
  officialMeaningSummary: z.string().min(12),
  purpose: z.string().min(4),
  whenYouSeeIt: z.string().min(8),
  howToUseIt: z.string().min(8),
  currentStoryExample: z.string().min(8),
  commonMistakes: z.array(z.string().min(4)).min(1),
  confusedWith: z.array(z.string().min(1)),
  kind: vocabularyKindSchema,
  priority: termPrioritySchema,
  relatedLessonIds: z.array(z.string().min(1)).min(1),
  screenLocations: z.array(z.string().min(1)).min(1),
  sourceTitle: z.string().min(1),
  sourceUrl: z.string().url(),
  secondarySources: z
    .array(z.object({ title: z.string().min(1), url: z.string().url() }))
    .optional(),
  lastVerifiedAt: z.string().date(),
  uiMayChange: z.boolean(),
});

export type VocabularyItem = z.infer<typeof vocabularyItemSchema>;
export type VocabularyKind = z.infer<typeof vocabularyKindSchema>;
export type TermPriority = z.infer<typeof termPrioritySchema>;
