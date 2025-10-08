import z from "zod";
import { logoutSchema } from "./user.validation";

export type ILogoutDto = z.infer<typeof logoutSchema.body>