import { Router } from "express";
import userServices from './user.service'
import { authentication } from "../../Middlewares/authentication.middleware";
import { endPoint } from "./user.authorization";
 const router:Router = Router()
 router.get('/profile',authentication(endPoint.profile),userServices.getUser)
 router.delete('/logout',authentication(endPoint.logout),userServices.logout)

 export default router
