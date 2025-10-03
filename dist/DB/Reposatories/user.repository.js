"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_reposatery_1 = require("./database.reposatery");
const errorHandling_utils_1 = require("../../Utils/errorHandling/errorHandling.utils");
class UserRepository extends database_reposatery_1.DatabaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async createUser({ data, options, }) {
        const [user] = (await this.create({
            data,
            options
        })) || [];
        if (!user)
            throw new errorHandling_utils_1.BadRequestException('Fail To Signup');
        return user;
    }
}
exports.UserRepository = UserRepository;
