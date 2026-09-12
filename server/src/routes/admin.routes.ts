import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { UserRoles } from '@bmc/shared';

const router = Router();

// Public master data endpoints (Wards, Categories, Department lists)
router.get('/departments', AdminController.getDepartments);
router.get('/wards', AdminController.getWards);
router.get('/categories', AdminController.getCategories);

// Protected Admin & Officer routes
router.use(authenticate);

// Admin / Dept head analytics overview
router.get(
  '/analytics',
  authorize(UserRoles.BMC_ADMIN, UserRoles.DEPT_OFFICER),
  AdminController.getAnalyticsOverview
);

// All city complaints with master filters
router.get(
  '/complaints',
  authorize(UserRoles.BMC_ADMIN, UserRoles.DEPT_OFFICER),
  AdminController.getAllComplaints
);

// Admin Department & Staff Management
router.post('/departments', authorize(UserRoles.BMC_ADMIN), AdminController.createDepartment);
router.patch('/departments/:id', authorize(UserRoles.BMC_ADMIN), AdminController.updateDepartment);
router.delete('/departments/:id', authorize(UserRoles.BMC_ADMIN), AdminController.deleteDepartment);
router.get('/departments/:id/staff', authorize(UserRoles.BMC_ADMIN, UserRoles.DEPT_OFFICER), AdminController.getDepartmentStaff);

export const adminRoutes = router;


