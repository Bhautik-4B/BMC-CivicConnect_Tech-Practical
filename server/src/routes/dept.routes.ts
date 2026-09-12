import { Router } from 'express';
import { DeptController } from '../controllers/dept.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { UserRoles, CreateStaffSchema, UpdateStaffSchema } from '@bmc/shared';

const router = Router();

router.use(authenticate);

// Department queue
router.get(
  '/queue',
  authorize(UserRoles.DEPT_OFFICER, UserRoles.DEPT_SUPERVISOR, UserRoles.BMC_ADMIN),
  DeptController.getDepartmentQueue
);

// Department staff workload & list
router.get(
  '/staff',
  authorize(UserRoles.DEPT_OFFICER, UserRoles.DEPT_SUPERVISOR, UserRoles.BMC_ADMIN),
  DeptController.getDepartmentStaff
);

// Create new staff member
router.post(
  '/staff',
  authorize(UserRoles.DEPT_OFFICER, UserRoles.DEPT_SUPERVISOR, UserRoles.BMC_ADMIN),
  validate(CreateStaffSchema),
  DeptController.createStaff
);

// Update staff member
router.patch(
  '/staff/:id',
  authorize(UserRoles.DEPT_OFFICER, UserRoles.DEPT_SUPERVISOR, UserRoles.BMC_ADMIN),
  validate(UpdateStaffSchema),
  DeptController.updateStaff
);

// Deactivate staff member
router.delete(
  '/staff/:id',
  authorize(UserRoles.DEPT_OFFICER, UserRoles.DEPT_SUPERVISOR, UserRoles.BMC_ADMIN),
  DeptController.deleteStaff
);

// Field staff individual task queue
router.get(
  '/field-tasks',
  authorize(UserRoles.FIELD_STAFF, UserRoles.BMC_ADMIN),
  DeptController.getFieldStaffTasks
);

export const deptRoutes = router;

