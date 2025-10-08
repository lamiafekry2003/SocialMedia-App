import mongoose, { HydratedDocument, Schema, Types } from "mongoose";


export interface IToken{
    jti:string,
    expireIn:number,
    userId:Types.ObjectId
}

export const tokenSchema = new Schema<IToken>({
    jti:{
        type:String,
        required:true,
        unique:true
    },
    expireIn:{
        type:Number,
        required:true,
    },
    userId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{
    timestamps:true
})

export const tokenModel = mongoose.models.Token || mongoose.model<IToken>('Token',tokenSchema)
export type HTokenDocument = HydratedDocument<IToken>