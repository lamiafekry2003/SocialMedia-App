import {Model } from "mongoose";
import { DatabaseRepository } from "./database.reposatery";
import { IFriendRequest } from "../Models/friendRequest.model";


export class FrientRequestRepository extends DatabaseRepository<IFriendRequest>{

    constructor(protected override readonly model:Model<IFriendRequest>){
        super(model)
    }
    
}