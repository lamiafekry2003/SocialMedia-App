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
exports.postModel = exports.postSchema = exports.ActionEnum = exports.AvailabilityEnum = exports.AllowCommentEnum = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var AllowCommentEnum;
(function (AllowCommentEnum) {
    AllowCommentEnum["ALLOW"] = "ALLOW";
    AllowCommentEnum["DENY"] = "DENY";
})(AllowCommentEnum || (exports.AllowCommentEnum = AllowCommentEnum = {}));
var AvailabilityEnum;
(function (AvailabilityEnum) {
    AvailabilityEnum["PUBLIC"] = "PUBLIC";
    AvailabilityEnum["FRIENDS"] = "FRIENDS";
    AvailabilityEnum["ONLYME"] = "ONLYME";
})(AvailabilityEnum || (exports.AvailabilityEnum = AvailabilityEnum = {}));
var ActionEnum;
(function (ActionEnum) {
    ActionEnum["LIKE"] = "LIKE";
    ActionEnum["UNLIKE"] = "UNLIKE";
})(ActionEnum || (exports.ActionEnum = ActionEnum = {}));
exports.postSchema = new mongoose_1.Schema({
    content: {
        type: String,
        minLength: 2,
        maxLength: 500000,
        required: function () {
            return !this?.attachment?.length;
        }
    },
    attachment: {
        type: [String]
    },
    asssestFolderId: String,
    allowComment: {
        type: String,
        enum: Object.values(AllowCommentEnum),
        default: AllowCommentEnum.ALLOW
    },
    availabilty: {
        type: String,
        enum: Object.values(AvailabilityEnum),
        default: AvailabilityEnum.PUBLIC
    },
    tags: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    likes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
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
}, {
    timestamps: true
});
exports.postSchema.pre(['find', 'findOne', 'findOneAndUpdate', 'updateOne'], function (next) {
    const query = this.getQuery();
    if (query?.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
exports.postModel = mongoose_1.default.models.Post || mongoose_1.default.model('Post', exports.postSchema);
