import z from 'zod'
import { LogoutEnum } from '../../Utils/token/token.utils'
import { generalFiled } from '../../Middlewares/validation.middleware'


export const logoutSchema ={
    body:z.strictObject({
        flag: z.enum(LogoutEnum).default(LogoutEnum.ONLY)
    })
}

export const sendFriendRequestSchema ={
    params:z.strictObject({
        userId: generalFiled.id
    })
}

export const acceptFriendRequestSchema ={
    params:z.strictObject({
        requestId: generalFiled.id
    })
}