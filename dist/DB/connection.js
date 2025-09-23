"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const connection = await mongoose_1.default.connect(process.env.DB_URL, {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`database connected ${connection.connection.host}`);
    }
    catch (error) {
        console.log('Database Connection Error', error.message);
    }
};
exports.default = connectDB;
