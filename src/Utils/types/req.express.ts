import { JwtPayload } from "jsonwebtoken";
import { HUser } from "../../DB/Models/user.model";

declare module 'express-serve-static-core'{
    interface Request{
        user?:HUser,
        decoded?:JwtPayload
    }
}