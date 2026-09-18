export const RELATIONSHIP_OPTIONS = ["Cônjuge", "Filho(a)", "Pai", "Mãe", "Outro"] as const;
export type Relationship = (typeof RELATIONSHIP_OPTIONS)[number];
