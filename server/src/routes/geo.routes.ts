import { Router } from 'express';
import { GeoController } from '../controllers/geo.controller.js';

const router = Router();

router.get('/detect-ward', GeoController.detectWard);
router.get('/check-duplicates', GeoController.checkDuplicates);

export const geoRoutes = router;
