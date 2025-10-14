import { Router } from "express";
import postService from "./post.service";
import { authentication, TokenEnum } from "../../Middlewares/authentication.middleware";
import { endPoint } from "./post.authorization";
import { validation } from "../../Middlewares/validation.middleware";
import { createPostSchema } from "./post.validation";
import { cloudFileUpload, fileValidation, StorageEnum } from "../../Utils/multer/cloud.multer";
const router = Router()

router.post('/',cloudFileUpload({validation:fileValidation.image,storageApproch:StorageEnum.MEMORY}).array('attachment',5),validation(createPostSchema),authentication(endPoint.createPost,TokenEnum.ACCESS),postService.createPost)

export default router