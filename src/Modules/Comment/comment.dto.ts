import { addCommentSchema, createReplySchema } from "./comment.validation";
import z from 'zod'

export type IAddCommentDto = z.infer<typeof addCommentSchema.params>
export type IReplayCommentDto = z.infer<typeof createReplySchema.params> 