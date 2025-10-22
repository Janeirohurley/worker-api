import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "Le nom est trop court"),
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
});

export const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Mot de passe requis"),
});
