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
        const doc = this.model.find(filter || [], options).select(select || '');
        if (options?.populate) {
            doc.populate(options.populate);
        }
        if (options?.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec();
    }
    async updateOne({ filter, update, options }) {
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
