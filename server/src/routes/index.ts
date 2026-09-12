import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { complaintRoutes } from './complaint.routes.js';
import { adminRoutes } from './admin.routes.js';
import { deptRoutes } from './dept.routes.js';
import { geoRoutes } from './geo.routes.js';
import { notificationRoutes } from './notification.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/admin', adminRoutes);
router.use('/dept', deptRoutes);
router.use('/geo', geoRoutes);
router.use('/notifications', notificationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

export const apiRoutes = router;
