import { DeleteObjectCommand, DeleteObjectCommandOutput, DeleteObjectsCommand, GetObjectCommand, GetObjectCommandOutput, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";  //to upload and file 
import { StorageEnum } from "./cloud.multer";
import {v4 as uuid} from 'uuid'
import { createReadStream } from "node:fs";
import { BadRequestException } from "../errorHandling/errorHandling.utils";
import { Upload } from "@aws-sdk/lib-storage";  // to upload large file
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";



export const s3Config=()=>{
    return new S3Client({
        region:process.env.REGION as string,
        credentials:{
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string ,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
        }

    })
}

export const uploadFile = async({
    storageApproch=StorageEnum.MEMORY,
         Bucket=process.env.AWS_BUCKET_NAME as string,
         ACL='private',
         path='General',
         file
}:{storageApproch?:StorageEnum,Bucket?:string,ACL?:ObjectCannedACL,path?:string,file:Express.Multer.File}):Promise<string>=>{


    const command = new PutObjectCommand({
         Bucket,
         ACL,
         Key:`${process.env.APPLICATION_NAME}/${path}/${uuid()}-${file.originalname}`,
         Body:storageApproch === StorageEnum.MEMORY?file.buffer:createReadStream(file.path),
         ContentType:file.mimetype
    })

    await s3Config().send(command)
    if(!command?.input?.Key)
        throw new BadRequestException('Fail to upload File')
    return command.input.Key
}
// large files
export const uploadLargeFile = async({
    storageApproch=StorageEnum.MEMORY,
         Bucket=process.env.AWS_BUCKET_NAME as string,
         ACL='private',
         path='General',
         file
}:{storageApproch?:StorageEnum,Bucket?:string,ACL?:ObjectCannedACL,path?:string,file:Express.Multer.File}):Promise<string>=>{


    const upload = new Upload({
        client:s3Config(),
        params:{
         Bucket,
         ACL,
         Key:`${process.env.APPLICATION_NAME}/${path}/${uuid()}-${file.originalname}`,
         Body:storageApproch === StorageEnum.MEMORY?file.buffer:createReadStream(file.path),
         ContentType:file.mimetype
        },
        // to select size og one must than or equal 5MB
        // partSize:500 * 1024 *1024

    })
    upload.on('httpUploadProgress',(progress)=>{
        console.log(progress)
    })

    const {Key} = await upload.done()
    if(!Key){
        throw new BadRequestException('Fail to upload file')
    }
    return Key
}

// upload files
export const uploadFiles = async({
    storageApproch=StorageEnum.MEMORY,
         Bucket=process.env.AWS_BUCKET_NAME as string,
         ACL='private',
         path='General',
         files
}:{storageApproch?:StorageEnum,Bucket?:string,ACL?:ObjectCannedACL,path?:string,files:Express.Multer.File[]}):Promise<string[]>=>{
    let urls:string[] =[]
    // no upload in same time but file by file its not good
    // for(const file of files){
    //     const Key = await uploadFile({Bucket,ACL,path,file})
    //     urls.push(Key)
    // }
    // to upload all file parrelly 
    urls= await Promise.all(
        files.map((file)=>{
            return uploadFile({Bucket,ACL,path,file})
        })
    )
    return urls
}

// upload files using presignedURL 
export const createPreSignedUrl = async({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    path ='General',
    ContentType,
    originalname,
    expiresIn = 120
}:{
    Bucket?:string,
    path?:string,
    ContentType:string,
    originalname:string,
    expiresIn?:number
}):Promise<{url:string,Key:string}>=>{
   const command = new PutObjectCommand({
    Bucket,
    Key:`${process.env.APPLICATION_NAME}/${path}/${uuid()}-presignedurl-${originalname}`,
    ContentType,
   })
//    generate url
   const url = await getSignedUrl(s3Config(),command,{
    expiresIn
   })
   if(!url || !command.input.Key){
    throw new BadRequestException('Fail to generate preSignedURL')
   }
   return {url, Key:command.input.Key}
}
// get url assests using preSigned url
export const createGetPreSignedUrl= async({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key,
    downloadName = 'dummy',
    download='false',
    expiresIn=120
}:{
    Bucket?:string;
    Key:string;
    downloadName?:string;
    download?:string;
    expiresIn?:number
})=>{
    const command = new GetObjectCommand({
        Bucket,
        Key,
        ResponseContentDisposition:download === 'true'?`attachment;filename=${downloadName}` :undefined
    })
    const url = await getSignedUrl(s3Config(),command,{
        expiresIn
    })
    if(!url)
        throw new BadRequestException('Fail to Generate Url')
    return url


}
// get file upload 
export const getFile = async({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key,
}:{Bucket?:string,Key:string}):Promise<GetObjectCommandOutput>=>{
    const command= new GetObjectCommand({
        Bucket,
        Key
    })
    return await s3Config().send(command)
}
// delete file
export const deleteFile = async({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key,
}:{Bucket?:string,Key:string}):Promise<DeleteObjectCommandOutput>=>{
    const command = new DeleteObjectCommand({
        Bucket,
        Key
    })
   return await s3Config().send(command)
}
// delete file
export const deleteFiles = async({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Urls,
    Quiet = false
}:{Bucket?:string,Urls:string[],Quiet?:boolean}):Promise<DeleteObjectCommandOutput>=>{
    const Objects =  Urls.map((url)=>{
        return {Key:url}
    })
    const command = new DeleteObjectsCommand({
        Bucket,
        Delete:{
            Objects,
            Quiet
        }
    })
   return await s3Config().send(command)
}