import { Router } from "express";
import authServices from './auth.service'
import { validation } from "../../Middlewares/validation.middleware";
import { signUpSchema } from "./auth.validation";

const router:Router = Router()

router.post('/signup',validation(signUpSchema),authServices.signUp)
router.get('/login',authServices.login)

export default router