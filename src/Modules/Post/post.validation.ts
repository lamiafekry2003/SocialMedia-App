import z from 'zod'
import { generalFiled } from '../../Middlewares/validation.middleware'
import { ActionEnum, AllowCommentEnum, AvailabilityEnum } from '../../DB/Models/post.model'
import { fileValidation } from '../../Utils/multer/cloud.multer'

export const createPostSchema={
    body:z.strictObject({
       content: z.string().min(2).max(500000).optional(),
        attachment: z.array(generalFiled.file(fileValidation.image)).min(1).max(5).optional(),
        allowComment: z.enum(AllowCommentEnum).default(AllowCommentEnum.ALLOW),
        availabilty: z.enum(AvailabilityEnum).default(AvailabilityEnum.PUBLIC),
        tags: z.array(generalFiled.id).max(10).optional(),
}).superRefine((data,ctx)=>{
    if(!data.attachment?.length && !data.content){
        ctx.addIssue({
            code:'custom',
            path:['content'],
            message:'Please Add Content Or Attachment '
        })
    }
    if(data.tags?.length && data.tags.length !== [...new Set(data.tags)].length){
        ctx.addIssue({
            code:'custom',
            path:['tags'],
            message:'please add unique id'
        })
    }
})
}

export const updatePostSchema={
    params:z.strictObject({
        postId:generalFiled.id
    }),
    body:z.strictObject({
       content: z.string().min(2).max(500000).optional(),
        attachment: z.array(generalFiled.file(fileValidation.image)).min(1).max(5).optional(),
        allowComment: z.enum(AllowCommentEnum).default(AllowCommentEnum.ALLOW),
        availabilty: z.enum(AvailabilityEnum).default(AvailabilityEnum.PUBLIC),
        tags: z.array(generalFiled.id).max(10).optional(),
        removeTags:z.array(generalFiled.id).max(10).optional(),
        removeAttachment:z.array(z.string()).max(10).optional()
}).superRefine((data,ctx)=>{
    if(!data.attachment?.length && !data.content){
        ctx.addIssue({
            code:'custom',
            path:['content'],
            message:'Please Add Content Or Attachment '
        })
    }
    if(data.tags?.length && data.tags.length !== [...new Set(data.tags)].length){
        ctx.addIssue({
            code:'custom',
            path:['tags'],
            message:'please add unique id'
        })
    }
    if(data.removeTags?.length && data.removeTags.length !== [...new Set(data.tags)].length){
        ctx.addIssue({
            code:'custom',
            path:['tags'],
            message:'please remove unique id'
        })
    }
})
}

export const likePostSchema={
    params:z.strictObject({
        postId:generalFiled.id
    }),
    query:z.strictObject({
        action:z.enum(ActionEnum).default(ActionEnum.LIKE)
    })
}