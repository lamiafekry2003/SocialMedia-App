import mongoose, { HydratedDocument, Schema, Types  } from "mongoose"



export interface IComment{
    content?:string,
       attachment?:string[],
       tags?:Types.ObjectId[],
       likes?:Types.ObjectId[],
       postId:Types.ObjectId,
       commentId?:Types.ObjectId
   
     createdBy:Types.ObjectId,
   
    freezedBy?:Types.ObjectId,
    freezedAt?:Date,
   
    restoredBy?:Types.ObjectId,
    restoredAt?:Date
   
    createdAt:Date,
    updatedAt:Date,

}

export const commentSchema = new Schema<IComment>({
    content:{
            type:String,
            minLength:2,
            maxLength:500000,
            require:function(){
                return !this.attachment?.length
            }
        },
        attachment:{
            type:[String]
        },
        
        tags:[{
            type:Schema.Types.ObjectId,
            ref:'User'
        }],
        likes:[{
            type:Schema.Types.ObjectId,
            ref:'User'
        }],
        createdBy:{
            type:Schema.Types.ObjectId,
            require:true,
            ref:'User'
        },
         postId:{
            type:Schema.Types.ObjectId,
            require:true,
            ref:'Post'
        },
         commentId:{
            type:Schema.Types.ObjectId,
            ref:'User'
        },
        freezedBy:{
            type:Schema.Types.ObjectId,
            ref:'User'
        },
        freezedAt:Date,
        restoredBy:{
            type:Schema.Types.ObjectId,
            ref:'User'
        },
        restoredAt:Date,
    
    
},{
    timestamps:true
})
// query middleware check if user freezed or not using paranoid
commentSchema.pre(['find','findOne','findOneAndUpdate','updateOne'], function(next){
    const query = this.getQuery() ;
    if(query?.paranoid === false){
        // get all data in decomunet that also not freezed
        this.setQuery({...query})
    }else{
        this.setQuery({...query,freezedAt:{$exists:false}})
    }
    next()

})




export const commentModel = mongoose.models.Comment || mongoose.model<IComment>('Comment',commentSchema)
export type HCommentDocument = HydratedDocument<IComment>