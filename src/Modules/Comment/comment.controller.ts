import { Router } from "express";
import { authentication, TokenEnum } from "../../Middlewares/authentication.middleware";
import { endPoint } from "./comment.authorization";
import commentService from "./comment.service";
import { cloudFileUpload, fileValidation, StorageEnum } from "../../Utils/multer/cloud.multer";
import { validation } from "../../Middlewares/validation.middleware";
import { addCommentSchema, createReplySchema } from "./comment.validation";

const router:Router = Router({mergeParams:true})

router.post('/add-comment',cloudFileUpload({validation:fileValidation.image,storageApproch:StorageEnum.MEMORY}).array('attachment',5),validation(addCommentSchema),authentication(endPoint.createComment,TokenEnum.ACCESS),commentService.addComment)
router.post('/:commentId/reply',cloudFileUpload({validation:fileValidation.image,storageApproch:StorageEnum.MEMORY}).array('attachment',5),validation(createReplySchema),authentication(endPoint.replyComment,TokenEnum.ACCESS),commentService.createReplay)

export default router