import { Router } from 'express';
import { getGltf } from '../points/points.controller';

const router = Router();

router.get('/', getGltf);

export default router;
