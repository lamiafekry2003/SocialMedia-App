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
const errorHandling_utils_1 = require("../../Utils/errorHandling/errorHandling.utils");
const zod_1 = require("zod");
const hash_utils_1 = require("../../Utils/security/hash.utils");
const email_events_utils_1 = require("../../Utils/events/email.events.utils");
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["Male"] = "Male";
    GenderEnum["Female"] = "Female";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["USER"] = "USER";
    RoleEnum["ADMIN"] = "ADMIN";
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
    slug: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 51
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
    freezedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    freezedAt: Date,
    restoredBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    restoredAt: Date,
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
        default: RoleEnum.USER
    },
    friends: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    profileImage: {
        key: zod_1.string
    },
    coverImages: {
        urls: [String],
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
exports.userSchema.virtual('userName').set(function (value) {
    const [firstName, lastName] = value.split(' ') || [];
    this.set({ firstName, lastName, slug: value.replaceAll(/\s+/g, '-') });
}).get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.userSchema.pre('validate', function (next) {
    if (!this.slug?.includes('-'))
        throw new errorHandling_utils_1.BadRequestException(`Slug is required and must hold - ${this.firstName}-${this.lastName}`);
    next();
});
exports.userSchema.pre('save', async function (next) {
    this.wasNew = this.isNew;
    if (this.isModified('password')) {
        this.password = await (0, hash_utils_1.generateHash)(this.password);
    }
    if (this.isModified('confirmEmailOTP')) {
        this.confirmEmailPlainOtp = this.confirmEmailOTP;
        this.confirmEmailOTP = await (0, hash_utils_1.generateHash)(this.confirmEmailOTP);
    }
    next();
});
exports.userSchema.post('save', async function (doc, next) {
    const that = this;
    if (that.wasNew && that.confirmEmailPlainOtp) {
        email_events_utils_1.emailEvent.emit('confirmEmail', { to: this.email, otp: that.confirmEmailPlainOtp, username: this.userName, subject: 'Confirm your email' });
    }
    next();
});
exports.userSchema.pre(['find', 'findOne'], function (next) {
    const query = this.getQuery();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
exports.userModel = mongoose_1.default.models.User || mongoose_1.default.model('User', exports.userSchema);
