import mongoose, { Schema, Types } from "mongoose";

export enum GenderEnum{
   Male='Male',
   Female='Female'
}
export enum RoleEnum{
    User='User',
    Admin='Admin'
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
    changeCredentialsTime ?:string;
    phone?:string;
    address?:string;
    gender:GenderEnum;
    role:RoleEnum;
    cleatedAt:Date;
    updatedAt ?:Date
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
        default:RoleEnum.User
       }


    },
    {
        timestamps:true,
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
);
userSchema.virtual('userName').set(function (value:string){
    const [firstName,lastName]=value.split(' ') || []
    this.set({firstName,lastName})
}).get(function(){
    return `${this.firstName} ${this.lastName}`;
})

export const userModel = mongoose.models.User || mongoose.model<IUser>('User',userSchema);