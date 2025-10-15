import mongoose, { HydratedDocument, Schema, Types } from "mongoose"


export enum AllowCommentEnum{
    ALLOW ='ALLOW',
    DENY = 'DENY'
}
export enum AvailabilityEnum{
    PUBLIC = 'PUBLIC',
    FRIENDS = 'FRIENDS',
    ONLYME ='ONLYME'
}
export enum ActionEnum{
    LIKE = 'LIKE',
    UNLIKE = 'UNLIKE',
} 

export interface IPost{
    content?:string,
    attachment?:string[],
    asssestFolderId:string,

    allowComment?:AllowCommentEnum,
    availabilty?:AvailabilityEnum,

    tags?:Types.ObjectId[],
    likes?:Types.ObjectId[],

    createdBy:Types.ObjectId,

    freezedBy?:Types.ObjectId,
    freezedAt?:Date,

    restoredBy?:Types.ObjectId,
    restoredAt?:Date

    createdAt:Date,
    updatedAt:Date,

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
    asssestFolderId:String,
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

// query middleware check if user freezed or not using paranoid
postSchema.pre(['find','findOne','findOneAndUpdate','updateOne'], function(next){
    const query = this.getQuery() ;
    if(query.paranoid === false){
        // get all data in decomunet that also not freezed
        this.setQuery({...query})
    }else{
        this.setQuery({...query,freezedAt:{$exist:false}})
    }
    next()

})


export const postModel = mongoose.models.Post || mongoose.model<IPost>('Post',postSchema)
export type HPDocument = HydratedDocument<IPost>