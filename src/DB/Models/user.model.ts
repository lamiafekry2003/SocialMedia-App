import mongoose, { HydratedDocument, Schema, Types } from "mongoose";
import { BadRequestException } from "../../Utils/errorHandling/errorHandling.utils";
import { string } from "zod";

export enum GenderEnum{
   Male='Male',
   Female='Female'
}
export enum RoleEnum{
    USER='USER',
    ADMIN='ADMIN'
}

export interface IUser{
    _id:Types.ObjectId;
    firstName:string;
    lastName:string;
    userName?:string;
    email:string;
    confirmEmailOTP ?:string;
    confirmedAt?:Date
    password:string;
    resetPasswordOTP:string;
    changeCredentialsTime ?:Date;
    phone?:string;
    address?:string;
    gender:GenderEnum;
    role:RoleEnum;
    cleatedAt:Date;
    updatedAt ?:Date;
    slug?:string,
    profileImage?: {
        key: string
    },
    coverImages?:{
        urls:String[]
    }
}

export const userSchema = new Schema<IUser>(
    {
       firstName:{
        type:String,
        required:true,
        trim:true,
        minLength:[2,'First name must be at least 2 characters long'],
        maxLength:[25,'First name must be at most 25 characters long']
       },
       lastName:{
        type:String,
        required:true,
        trim:true,
        minLength:[2,'Last name must be at least 2 characters long'],
        maxLength:[25,'Last name must be at most 25 characters long']
       },
        slug:{
        type:String,
        required:true,
        minLength:2,
        maxLength:51
       },
       email:{
        type:String,
        required:true,
        unique:true
       },
       confirmEmailOTP:String,
       confirmedAt:Date,
       password:{
        type:String,
        required:true
       },
       resetPasswordOTP:String,
       changeCredentialsTime:String,
       phone:String,
       address:String,
       gender:{
        type:String,
        enum:{
            values:Object.values(GenderEnum),
            message:'gender must be male or female'
        },
        default:GenderEnum.Male
       },
       role:{
        type:String,
        enum:{
            values:Object.values(RoleEnum),
             message:'Role must be user or admin'
        },
        default:RoleEnum.USER
       },
       profileImage: {
        key: string
       },
      coverImages: {
  urls: [String],
},

    },
    {
        timestamps:true,
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
);
userSchema.virtual('userName').set(function (value:string){
    const [firstName,lastName]=value.split(' ') || []
    this.set({firstName,lastName,slug:value.replaceAll(/\s+/g,'-')})
}).get(function(){
    return `${this.firstName} ${this.lastName}`;
})

userSchema.pre('validate',function(next){
    if(!this.slug?.includes('-'))
        throw new BadRequestException(`Slug is required and must hold - ${this.firstName}-${this.lastName}`)
    next()

})

export const userModel = mongoose.models.User || mongoose.model<IUser>('User',userSchema);
export type HUser = HydratedDocument<IUser>