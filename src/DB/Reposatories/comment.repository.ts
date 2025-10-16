import {Model } from "mongoose";
import { DatabaseRepository } from "./database.reposatery";
import { IComment } from "../Models/comment.model";


export class CommentRepository extends DatabaseRepository<IComment>{

    constructor(protected override readonly model:Model<IComment>){
        super(model)
    }
    
}