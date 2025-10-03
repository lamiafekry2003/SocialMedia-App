export const generateOtp = ():number =>{
    return Math.floor(Math.random() * 1000000)
};