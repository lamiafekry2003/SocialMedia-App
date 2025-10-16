import { CreateOptions, HydratedDocument, Model, MongooseUpdateQueryOptions, PopulateOptions, ProjectionType, QueryOptions, RootFilterQuery, UpdateQuery, UpdateWriteOpResult } from "mongoose";


export abstract class DatabaseRepository<TDocument>{
   constructor(protected readonly model:Model<TDocument>){}

   async create({
    data,
    options,
   }:{
    data:Partial<TDocument>[],
    options?:CreateOptions | undefined
   }):Promise<HydratedDocument<TDocument>[] | undefined> {
       return await this.model.create(data,options)
     
   }
    //find one
    async findOne({
        filter,
        select,
        options
    }:{
        filter?:RootFilterQuery<TDocument> | [],
        select?:ProjectionType<TDocument> | null,
        options?:QueryOptions<TDocument> | null
    }):Promise<HydratedDocument<TDocument> | null> {
        const doc =  this.model.findOne(filter,options).select(select || '')
        if(options?.populate){
            doc.populate(options.populate as PopulateOptions[])
        }
        if(options?.lean){
            doc.lean(options.lean)
        }
        return await doc.exec()
    }
    // find
    async find({
        filter,
        select,
        options
    }:{
        filter?:RootFilterQuery<TDocument> | [],
        select?:ProjectionType<TDocument> | null,
        options?:QueryOptions<TDocument> | null
    }):Promise<any | HydratedDocument<TDocument> | []>{
        const doc =  this.model.find(filter|| [], select || '',options)
        if(options?.populate){
            doc.populate(options.populate as PopulateOptions[])
        }
        if(options?.lean){
            doc.lean(options.lean)
        }
        if(options?.limit){
            doc.limit(options.limit)
        }
        if(options?.skip){
            doc.skip(options.skip)
        }
        return await doc.exec()
    }
    // paginate
    async paginate({
        filter = {},
        select = {},
        options = {},
        page = 1 ,
        size = 5
    }:{
        filter?:RootFilterQuery<TDocument>,
        select?:ProjectionType<TDocument> | undefined,
        options?:QueryOptions<TDocument> | undefined,
        page?:number,
        size?:number
    }) {
        let docmentCount:number | undefined = undefined;
        let pages:number | undefined = undefined
        page = Math.floor(page < 1 ? 1 : page)
        options.limit = Math.floor(size < 1 || !size ? 5 :size)
        options.skip = (page - 1 ) * size
        docmentCount = await this.model.countDocuments(filter)
        pages = Math.ceil(docmentCount / options.limit)
        const result = await this.find({filter,select,options })
        return await{
            docmentCount,
            pages,
            limit:options.limit,
            currentPage:page,
            result
        }
    }

    // update one
    async updateOne({
        filter,
        update,
        options
    }:{
        filter:RootFilterQuery<TDocument>,
        update:UpdateQuery<TDocument>,
        options?:MongooseUpdateQueryOptions<TDocument> |null
    }):Promise<UpdateWriteOpResult>{
        // if get array
        if(Array.isArray(update)){
            update.push({
                $set:{
                    __v:{$add:['$__v',1]}
                }
            })
            return await this.model.updateOne(filter,update,options)
        }
        // else
        return await this.model.updateOne(filter,{
            ...update,
            $inc:{__v:1}
        },options)
    }
    // find one and update
    async findOneAndUpdate({
    filter ,
    update ={} ,
    options = { runValidators: true, returnDocument: "after" ,new:true }
    }:{
        filter:RootFilterQuery<TDocument>
        update:UpdateQuery<TDocument>
        options?:QueryOptions & { returnDocument?: "before" | "after" }

    }):Promise<any| HydratedDocument<TDocument> |null>{
        const doc = this.model.findOneAndUpdate(filter,update)
        if(options?.populate){
            doc.populate(options.populate as PopulateOptions[])
        }
        if(options?.lean){
            doc.lean(options.lean)
        }
        return await doc.exec()
        // return await this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, options);
    }
}