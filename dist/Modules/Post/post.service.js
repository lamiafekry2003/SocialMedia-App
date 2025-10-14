"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_repository_1 = require("../../DB/Reposatories/post.repository");
const post_model_1 = require("../../DB/Models/post.model");
const user_repository_1 = require("../../DB/Reposatories/user.repository");
const user_model_1 = require("../../DB/Models/user.model");
class PostService {
    _postModel = new post_repository_1.PostRepository(post_model_1.postModel);
    userModel = new user_repository_1.UserRepository(user_model_1.userModel);
    constructor() { }
    createPost = async (req, res, next) => {
        res.status(201).json({ message: 'post Created Successfully' });
    };
}
exports.default = new PostService;
