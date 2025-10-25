import z from 'zod'
import { generalFiled } from '../../Middlewares/validation.middleware'
import { fileValidation } from '../../Utils/multer/cloud.multer'


export const addCommentSchema = {
    params:z.strictObject({
        postId:generalFiled.id
    }),
    body:z.strictObject({
        content: z.string().min(2).max(500000).optional(),
        attachment: z.array(generalFiled.file(fileValidation.image)).max(3).optional(),
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

export const createReplySchema={
    params:addCommentSchema.params.extend({
        commentId:generalFiled.id
    }),
    body:addCommentSchema.body
}