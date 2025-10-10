import { Request } from "express";
import multer, { FileFilterCallback, Multer } from "multer";
import os from 'node:os'
import {v4 as uuid} from 'uuid'
import { BadRequestException } from "../errorHandling/errorHandling.utils";

export enum StorageEnum{
    DISK='DISK',
    MEMORY='MEMORY'
}
export const fileValidation = {
    image: ['image/png','image/PNG', 'image/jpg', 'image/jpeg'],
    video: ['video/mp4','video/mkv','video/avi'],
    audio: ['audio/mpeg','audio/wav','audio/ogg'],
    document: 
    ['application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
} 

export const cloudFileUpload= ({validation=[],maxSize=2,storageApproch=StorageEnum.MEMORY}:{validation?:string[],maxSize?:number,storageApproch?:StorageEnum}):Multer=>{
    const storage = storageApproch === StorageEnum.MEMORY ? multer.memoryStorage() : multer.diskStorage({
        destination:os.tmpdir(),
        filename:(req:Request,file:Express.Multer.File,cb)=>{
            cb(null,`${uuid()}-${file.originalname}`)
        }
    })
     const fileFilter = (req:Request,file:Express.Multer.File,cb:FileFilterCallback) =>{
        if(!validation.includes(file.mimetype)){
        return cb(new BadRequestException('Invalid file type'))

        }else{
            cb(null,true)
        }
    }

    return multer({
        fileFilter,
        limits:{fileSize:maxSize * 1024 *1024},
        storage
    })

}