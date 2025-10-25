import { Router } from "express";
import userServices from './user.service'
import { authentication } from "../../Middlewares/authentication.middleware";
import { endPoint } from "./user.authorization";
import { cloudFileUpload, fileValidation, StorageEnum } from "../../Utils/multer/cloud.multer";
import { validation } from "../../Middlewares/validation.middleware";
import { acceptFriendRequestSchema, sendFriendRequestSchema } from "./user.validation";
 const router:Router = Router()
 router.get('/profile',authentication(endPoint.profile),userServices.getUser)
 router.delete('/logout',authentication(endPoint.logout),userServices.logout)
 router.patch('/profile-image',authentication(endPoint.image),cloudFileUpload({validation:fileValidation.image,maxSize:2,storageApproch:StorageEnum.MEMORY}).single('profileImage'),userServices.profileImage)
 router.patch('/cover-image',authentication(endPoint.image),cloudFileUpload({validation:fileValidation.image,maxSize:2,storageApproch:StorageEnum.MEMORY}).array('coverImage',5),userServices.profileCoverImage)
 router.delete('/delete-image',authentication(endPoint.image),userServices.deleteImage)
 router.delete('/delete-images',authentication(endPoint.image),userServices.deleteImages)
 router.post('/:userId/friend-request',authentication(endPoint.friendRequest),validation(sendFriendRequestSchema),userServices.sendFriendRequest)
 router.patch('/:requestId/accept-friend',authentication(endPoint.acceptFriendRequest),validation(acceptFriendRequestSchema),userServices.acceptFriendRequest)

 export default router
