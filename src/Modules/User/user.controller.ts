import { Router } from "express";
import userServices from './user.service'
import { authentication } from "../../Middlewares/authentication.middleware";
import { endPoint } from "./user.authorization";
import { cloudFileUpload, fileValidation, StorageEnum } from "../../Utils/multer/cloud.multer";
 const router:Router = Router()
 router.get('/profile',authentication(endPoint.profile),userServices.getUser)
 router.delete('/logout',authentication(endPoint.logout),userServices.logout)
 router.patch('/profile-image',authentication(endPoint.image),cloudFileUpload({validation:fileValidation.image,maxSize:2,storageApproch:StorageEnum.MEMORY}).single('profileImage'),userServices.profileImage)
 router.patch('/cover-image',authentication(endPoint.image),cloudFileUpload({validation:fileValidation.image,maxSize:2,storageApproch:StorageEnum.MEMORY}).array('coverImage',5),userServices.profileCoverImage)

 export default router
