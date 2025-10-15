import z from 'zod'
import { likePostSchema } from './post.validation'
export type IPostDto = z.infer<typeof likePostSchema.params>
export type ILikePostDto = z.infer<typeof likePostSchema.query>