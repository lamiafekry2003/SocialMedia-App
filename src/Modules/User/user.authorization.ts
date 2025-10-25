import { RoleEnum } from "../../DB/Models/user.model";

export const endPoint ={
    profile:[RoleEnum.USER,RoleEnum.ADMIN],
    logout:[RoleEnum.USER,RoleEnum.ADMIN],
    image:[RoleEnum.USER,RoleEnum.ADMIN],
    friendRequest:[RoleEnum.USER],
    acceptFriendRequest:[RoleEnum.USER],
}