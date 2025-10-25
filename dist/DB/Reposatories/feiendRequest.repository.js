"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrientRequestRepository = void 0;
const database_reposatery_1 = require("./database.reposatery");
class FrientRequestRepository extends database_reposatery_1.DatabaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.FrientRequestRepository = FrientRequestRepository;
