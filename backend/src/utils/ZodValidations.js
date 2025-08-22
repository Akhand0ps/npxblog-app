

import { z } from "zod";

export const createUserSchema = z.object({

    name:z.string().min(3,"Name must be at least 3 characters").max(50,"Name can't exceed 50 characters"),

    email:z.string().email("Invalid email address"),
    password:z.string().min(6,"password must be atleast 6 characters"),

    bio: z.string().max(200,"Bio can't exceed 200 characters").optional(),

    avatar: z.string().url("Avatar must be a valid URL").optional()
})


export const updateBioSchema = z.object({

    bio:z.string().max(200,"bio can't exceed 200 characters"),
});