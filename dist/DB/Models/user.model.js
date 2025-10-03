"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = exports.userSchema = exports.RoleEnum = exports.GenderEnum = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["Male"] = "Male";
    GenderEnum["Female"] = "Female";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["User"] = "User";
    RoleEnum["Admin"] = "Admin";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
exports.userSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minLength: [2, 'First name must be at least 2 characters long'],
        maxLength: [25, 'First name must be at most 25 characters long']
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minLength: [2, 'Last name must be at least 2 characters long'],
        maxLength: [25, 'Last name must be at most 25 characters long']
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    confirmEmailOTP: String,
    confirmedAt: Date,
    password: {
        type: String,
        required: true
    },
    resetPasswordOTP: String,
    changeCredentialsTime: String,
    phone: String,
    address: String,
    gender: {
        type: String,
        enum: {
            values: Object.values(GenderEnum),
            message: 'gender must be male or female'
        },
        default: GenderEnum.Male
    },
    role: {
        type: String,
        enum: {
            values: Object.values(RoleEnum),
            message: 'Role must be user or admin'
        },
        default: RoleEnum.User
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
exports.userSchema.virtual('userName').set(function (value) {
    const [firstName, lastName] = value.split(' ') || [];
    this.set({ firstName, lastName });
}).get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.userModel = mongoose_1.default.models.User || mongoose_1.default.model('User', exports.userSchema);
