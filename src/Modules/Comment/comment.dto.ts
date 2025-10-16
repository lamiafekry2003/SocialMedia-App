import { addCommentSchema } from "./comment.validation";
import z from 'zod'

export type IAddCommentDto = z.infer<typeof addCommentSchema.params>