import { CommentEntity } from "@prisma/client";

export const COMMENT_ENTITIES = [
  "WORLD",
  "REGION",
  "CHARACTER",
  "FACTION",
  "EVENT",
  "WIKI",
  "MAP",
  "MAP_PIN",
  "FAMILY_TREE",
  "FAMILY_MEMBER",
] as const;

export type CommentEntityName = (typeof COMMENT_ENTITIES)[number];

export function parseCommentEntity(value: unknown): CommentEntity | null {
  if (typeof value !== "string") return null;
  const upper = value.toUpperCase();
  if ((COMMENT_ENTITIES as readonly string[]).includes(upper)) {
    return upper as CommentEntity;
  }
  return null;
}
