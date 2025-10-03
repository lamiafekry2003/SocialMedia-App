import { Router } from "express";
import authServices from './auth.service'
import { validation } from "../../Middlewares/validation.middleware";
import { confirmEmailSchema, loginSchema, signUpSchema } from "./auth.validation";

const router:Router = Router()

router.post('/signup',validation(signUpSchema),authServices.signUp)
router.post('/login',validation(loginSchema),authServices.login)
router.patch('/confirmEmail',validation(confirmEmailSchema),authServices.confirmEmail)

export default router