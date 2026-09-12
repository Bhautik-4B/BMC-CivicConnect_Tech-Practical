import { Router } from 'express';
import { DeptController } from '../controllers/dept.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { UserRoles } from '@bmc/shared';

const router = Router();

router.use(authenticate);

// Department queue
router.get(
  '/queue',
  authorize(UserRoles.DEPT_OFFICER, UserRoles.DEPT_SUPERVISOR, UserRoles.BMC_ADMIN),
  DeptController.getDepartmentQueue
);

// Department staff workload
router.get(
  '/staff',
  authorize(UserRoles.DEPT_OFFICER, UserRoles.DEPT_SUPERVISOR, UserRoles.BMC_ADMIN),
  DeptController.getDepartmentStaff
);

// Field staff individual task queue
router.get(
  '/field-tasks',
  authorize(UserRoles.FIELD_STAFF, UserRoles.BMC_ADMIN),
  DeptController.getFieldStaffTasks
);

export const deptRoutes = router;
