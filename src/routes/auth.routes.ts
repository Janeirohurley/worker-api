import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller";
import { validateDTO } from "../middlewares/validate.dto";
import { registerSchema, loginSchema } from "../dtos/auth.dto";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", validateDTO(registerSchema), register);
router.post("/login", validateDTO(loginSchema), login);
router.get("/me", authenticate, me);
router.post("/admin", authenticate, authorize("worker"), (req, res) => {
    res.json({ success: true, message: "Bienvenue, worker !" });
});

export default router;
