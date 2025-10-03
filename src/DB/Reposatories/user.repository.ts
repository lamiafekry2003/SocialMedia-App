import { CreateOptions, HydratedDocument, Model } from "mongoose";
import { IUser } from "../Models/user.model";
import { DatabaseRepository } from "./database.reposatery";
import { BadRequestException } from "../../Utils/errorHandling/errorHandling.utils";

export class UserRepository extends DatabaseRepository<IUser>{
    constructor(protected override readonly model:Model<IUser>){
        super(model)
    }
    async createUser({
        data,
        options,
    }:{
        data:Partial<IUser>[],
        options:CreateOptions

    }):Promise<HydratedDocument <IUser>>{
        const [user] = (await this.create({
            data,
            options
        })) || []
        if(!user)
            throw new BadRequestException('Fail To Signup')
        return user
    }

}