"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const database_reposatery_1 = require("./database.reposatery");
class CommentRepository extends database_reposatery_1.DatabaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.CommentRepository = CommentRepository;
