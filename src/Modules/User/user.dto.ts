import z from "zod";
import { acceptFriendRequestSchema, logoutSchema, sendFriendRequestSchema } from "./user.validation";

export type ILogoutDto = z.infer<typeof logoutSchema.body>
export type ISendFriendRequestDto = z.infer<typeof sendFriendRequestSchema.params>
export type IAcceptFriendRequestDto = z.infer<typeof acceptFriendRequestSchema.params>