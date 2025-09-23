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
const errorHandling_utils_1 = require("./Utils/errorHandling/errorHandling.utils");
const connection_1 = __importDefault(require("./DB/connection"));
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
    app.use(errorHandling_utils_1.globalErrorHandling);
    app.listen(port, () => console.log(chalk_1.default.bgGreen(chalk_1.default.black(`Server is running on port ${port}!!`))));
};
exports.bootstrap = bootstrap;
