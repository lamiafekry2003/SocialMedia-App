import z from "zod";
import { signUpSchema } from "./auth.validation";

export type ISignupDto = z.infer<typeof signUpSchema.body>