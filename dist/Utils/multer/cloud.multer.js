"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudFileUpload = exports.fileValidation = exports.StorageEnum = void 0;
const multer_1 = __importDefault(require("multer"));
const node_os_1 = __importDefault(require("node:os"));
const uuid_1 = require("uuid");
const errorHandling_utils_1 = require("../errorHandling/errorHandling.utils");
var StorageEnum;
(function (StorageEnum) {
    StorageEnum["DISK"] = "DISK";
    StorageEnum["MEMORY"] = "MEMORY";
})(StorageEnum || (exports.StorageEnum = StorageEnum = {}));
exports.fileValidation = {
    image: ['image/png', 'image/PNG', 'image/jpg', 'image/jpeg'],
    video: ['video/mp4', 'video/mkv', 'video/avi'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    document: ['application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
};
const cloudFileUpload = ({ validation = [], maxSize = 2, storageApproch = StorageEnum.MEMORY }) => {
    const storage = storageApproch === StorageEnum.MEMORY ? multer_1.default.memoryStorage() : multer_1.default.diskStorage({
        destination: node_os_1.default.tmpdir(),
        filename: (req, file, cb) => {
            cb(null, `${(0, uuid_1.v4)()}-${file.originalname}`);
        }
    });
    const fileFilter = (req, file, cb) => {
        if (!validation.includes(file.mimetype)) {
            return cb(new errorHandling_utils_1.BadRequestException('Invalid file type'));
        }
        else {
            cb(null, true);
        }
    };
    return (0, multer_1.default)({
        fileFilter,
        limits: { fileSize: maxSize * 1024 * 1024 },
        storage
    });
};
exports.cloudFileUpload = cloudFileUpload;
