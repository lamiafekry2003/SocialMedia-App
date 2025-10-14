"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const chalk_1 = __importDefault(require("chalk"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const node_path_1 = __importDefault(require("node:path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = __importDefault(require("./Modules/Auth/auth.controller"));
const user_controller_1 = __importDefault(require("./Modules/User/user.controller"));
const post_controller_1 = __importDefault(require("./Modules/Post/post.controller"));
const errorHandling_utils_1 = require("./Utils/errorHandling/errorHandling.utils");
const connection_1 = __importDefault(require("./DB/connection"));
const s3_config_1 = require("./Utils/multer/s3.config");
const node_util_1 = require("node:util");
const node_stream_1 = require("node:stream");
const createWriteStreamPip = (0, node_util_1.promisify)(node_stream_1.pipeline);
(0, dotenv_1.config)({ path: node_path_1.default.resolve('./config/.env.dev') });
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: {
        status: 429,
        message: 'To many requests , please try later'
    }
});
const bootstrap = async () => {
    const app = (0, express_1.default)();
    const port = Number(process.env.PORT) || 3000;
    app.use(express_1.default.json());
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    app.use(limiter);
    await (0, connection_1.default)();
    app.get('/users', (req, res) => {
        return res.status(200).json({ message: 'Hello from social media project' });
    });
    app.use('/api/auth', auth_controller_1.default);
    app.use('/api/user', user_controller_1.default);
    app.use('/api/post', post_controller_1.default);
    app.get('/upload/*path', async (req, res) => {
        const { downloadName } = req.query;
        const { path } = req.params;
        const Key = path.join('/');
        const s3Response = await (0, s3_config_1.getFile)({ Key });
        if (!s3Response?.Body) {
            throw new errorHandling_utils_1.BadRequestException('Fail to get assests');
        }
        res.setHeader('Content-Type', `${s3Response.ContentType}` || "application/octet-stream");
        if (downloadName) {
            res.setHeader('Content-Disposition', `attachment;filename=${downloadName}`);
        }
        return await createWriteStreamPip(s3Response.Body, res);
    });
    app.get('/upload/presigned/*path', async (req, res) => {
        const { downloadName, download } = req.query;
        const { path } = req.params;
        const Key = path.join('/');
        const url = await (0, s3_config_1.createGetPreSignedUrl)({
            Key,
            downloadName: downloadName,
            download: download
        });
        return res.status(200).json({ message: 'Done', url });
    });
    app.use(errorHandling_utils_1.globalErrorHandling);
    app.listen(port, () => console.log(chalk_1.default.bgGreen(chalk_1.default.black(`Server is running on port ${port}!!`))));
};
exports.bootstrap = bootstrap;
