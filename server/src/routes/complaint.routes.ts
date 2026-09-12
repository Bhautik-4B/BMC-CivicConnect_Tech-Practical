import { Router } from 'express';
import { ComplaintController } from '../controllers/complaint.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  CreateComplaintSchema,
  AssignComplaintSchema,
  SubmitResolutionSchema,
  VerifyResolutionSchema,
  UserRoles
} from '@bmc/shared';

const router = Router();

// Create new complaint (Citizen & Admin)
router.post(
  '/',
  authenticate,
  authorize(UserRoles.CITIZEN, UserRoles.BMC_ADMIN),
  validate(CreateComplaintSchema),
  ComplaintController.create
);

// My complaints (Citizen)
router.get(
  '/my',
  authenticate,
  authorize(UserRoles.CITIZEN),
  ComplaintController.getMyComplaints
);

// Get single complaint details with audit logs
router.get(
  '/:id',
  authenticate,
  ComplaintController.getById
);

// Assign department & staff (Admin & Dept Supervisors)
router.patch(
  '/:id/assign',
  authenticate,
  authorize(UserRoles.BMC_ADMIN, UserRoles.DEPT_OFFICER, UserRoles.DEPT_SUPERVISOR),
  validate(AssignComplaintSchema),
  ComplaintController.assign
);

// Start work on site (Field Staff)
router.patch(
  '/:id/start-work',
  authenticate,
  authorize(UserRoles.FIELD_STAFF, UserRoles.BMC_ADMIN),
  ComplaintController.startWork
);

// Submit resolution proof with Before/After photos (Field Staff & Dept Supervisors)
router.patch(
  '/:id/resolve',
  authenticate,
  authorize(UserRoles.FIELD_STAFF, UserRoles.DEPT_SUPERVISOR, UserRoles.BMC_ADMIN),
  validate(SubmitResolutionSchema),
  ComplaintController.submitResolution
);

// Citizen verification (Yes -> Close, No -> Reopen)
router.patch(
  '/:id/verify',
  authenticate,
  authorize(UserRoles.CITIZEN, UserRoles.BMC_ADMIN),
  validate(VerifyResolutionSchema),
  ComplaintController.verifyResolution
);

export const complaintRoutes = router;
