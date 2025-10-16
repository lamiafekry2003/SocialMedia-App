"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRepository = void 0;
class DatabaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options, }) {
        return await this.model.create(data, options);
    }
    async findOne({ filter, select, options }) {
        const doc = this.model.findOne(filter, options).select(select || '');
        if (options?.populate) {
            doc.populate(options.populate);
        }
        if (options?.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec();
    }
    async find({ filter, select, options }) {
        const doc = this.model.find(filter || [], select || '', options);
        if (options?.populate) {
            doc.populate(options.populate);
        }
        if (options?.lean) {
            doc.lean(options.lean);
        }
        if (options?.limit) {
            doc.limit(options.limit);
        }
        if (options?.skip) {
            doc.skip(options.skip);
        }
        return await doc.exec();
    }
    async paginate({ filter = {}, select = {}, options = {}, page = 1, size = 5 }) {
        let docmentCount = undefined;
        let pages = undefined;
        page = Math.floor(page < 1 ? 1 : page);
        options.limit = Math.floor(size < 1 || !size ? 5 : size);
        options.skip = (page - 1) * size;
        docmentCount = await this.model.countDocuments(filter);
        pages = Math.ceil(docmentCount / options.limit);
        const result = await this.find({ filter, select, options });
        return await {
            docmentCount,
            pages,
            limit: options.limit,
            currentPage: page,
            result
        };
    }
    async updateOne({ filter, update, options }) {
        if (Array.isArray(update)) {
            update.push({
                $set: {
                    __v: { $add: ['$__v', 1] }
                }
            });
            return await this.model.updateOne(filter, update, options);
        }
        return await this.model.updateOne(filter, {
            ...update,
            $inc: { __v: 1 }
        }, options);
    }
    async findOneAndUpdate({ filter, update = {}, options = { runValidators: true, returnDocument: "after", new: true } }) {
        const doc = this.model.findOneAndUpdate(filter, update);
        if (options?.populate) {
            doc.populate(options.populate);
        }
        if (options?.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec();
    }
}
exports.DatabaseRepository = DatabaseRepository;
