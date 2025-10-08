import z from 'zod'
import { LogoutEnum } from '../../Utils/token/token.utils'


export const logoutSchema ={
    body:z.strictObject({
        flag: z.enum(LogoutEnum).default(LogoutEnum.ONLY)
    })
}