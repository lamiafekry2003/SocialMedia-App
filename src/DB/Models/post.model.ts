import mongoose, { HydratedDocument, Schema, Types } from "mongoose"


export enum AllowCommentEnum{
    ALLOW ='ALLOW',
    DENY = 'DENY'
}
export enum AvailabilityEnum{
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
    ONLYME ='ONLYME'
}
export interface IPost{
    content?:string,
    attachment?:string[],

    allowComment:AllowCommentEnum,
    availabilty:AvailabilityEnum,

    tags?:Types.ObjectId[],
    likes?:Types.ObjectId[],

    createdBy:Types.ObjectId,

    freezedBy?:Types.ObjectId,
    freezedAt?:Date,

    restoredBy?:Types.ObjectId,
    restoredAt?:Date

    createdAt:Date,
    updatedAt:Date
}

export const postSchema = new Schema<IPost>({
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
    allowComment:{
        type:String,
        enum:Object.values(AllowCommentEnum),
        default:AllowCommentEnum.ALLOW
    },
     availabilty:{
        type:String,
        enum:Object.values(AvailabilityEnum),
        default:AvailabilityEnum.PUBLIC
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
export const postModel = mongoose.models.Post || mongoose.model<IPost>('Post',postSchema)
export type HUDocument = HydratedDocument<IPost>