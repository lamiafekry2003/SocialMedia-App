import { RoleEnum } from "../../DB/Models/user.model";


export const endPoint={
    createPost:[RoleEnum.ADMIN,RoleEnum.USER]
}