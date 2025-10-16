import mongoose, { HydratedDocument, Schema, Types } from "mongoose";
import { BadRequestException } from "../../Utils/errorHandling/errorHandling.utils";
import { string } from "zod";
import { generateHash } from "../../Utils/security/hash.utils";
import { emailEvent } from "../../Utils/events/email.events.utils";


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
    friends?:Types.ObjectId
    slug?:string,
     freezedBy?:Types.ObjectId,
    freezedAt?:Date,
    restoredBy?:Types.ObjectId,
    restoredAt?:Date
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
        friends:[
            {
        type:Schema.Types.ObjectId,
        ref:'User'
        }
        ],
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
// hashing password before save
userSchema.pre('save', async function(this:HUser &{wasNew:boolean,confirmEmailPlainOtp?:string},next){
    this.wasNew = this.isNew
    if(this.isModified('password')){
        this.password = await generateHash(this.password)
    }
    if(this.isModified('confirmEmailOTP')){
        this.confirmEmailPlainOtp = this.confirmEmailOTP as string
        this.confirmEmailOTP = await generateHash(this.confirmEmailOTP as string)
    }
    next()
})
// send email at creation decomunt middleware
userSchema.post('save',async function(doc,next){
    const that = this as HUser &{
        wasNew:boolean,
        confirmEmailPlainOtp?:string
    }
    if(that.wasNew && that.confirmEmailPlainOtp){
         emailEvent.emit('confirmEmail',{to:this.email,otp:that.confirmEmailPlainOtp,username:this.userName,subject:'Confirm your email'})
    }
    next()
})
// query middleware check if user freezed or not using paranoid
userSchema.pre(['find','findOne'], function(next){
    const query = this.getQuery() ;
    if(query.paranoid === false){
        // get all data in decomunet that also not freezed
        this.setQuery({...query})
    }else{
        this.setQuery({...query,freezedAt:{$exists:false}})
    }
    next()

})


export const userModel = mongoose.models.User || mongoose.model<IUser>('User',userSchema);
export type HUser = HydratedDocument<IUser>