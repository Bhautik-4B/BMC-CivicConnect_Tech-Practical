import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  SendOtpSchema,
  VerifyOtpSchema,
  PasswordLoginSchema
} from '@bmc/shared';

const router = Router();

router.post('/otp/send', validate(SendOtpSchema), AuthController.sendOtp);
router.post('/otp/verify', validate(VerifyOtpSchema), AuthController.verifyOtp);
router.post('/login', validate(PasswordLoginSchema), AuthController.passwordLogin);
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/logout', authenticate, AuthController.logout);

export const authRoutes = router;
