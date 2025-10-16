import { RoleEnum } from "../../DB/Models/user.model";

export const endPoint={
    createComment:[RoleEnum.ADMIN,RoleEnum.USER]
}