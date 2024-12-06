import { z } from "zod" 

const emailValidation = z.string().email({ message: "Invalid email. Please make sure to enter a valid email and try again." });
const passwordValidation = z.string().min(8, { message: "Invalid Password. Password should be a minimum of 8 characters." });

export const registerSchema = z.object({
    name: z.string().min(2, { message: "Name should be a minimum of 2 characters." }),
    email: emailValidation,
    password: passwordValidation
});

export const loginSchema = z.object({
    email: emailValidation,
    password: passwordValidation
});

export type RegisterUserType = z.infer<typeof registerSchema>
export type LoginUserType = z.infer<typeof loginSchema>