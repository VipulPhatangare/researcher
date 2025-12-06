import express from 'express';
import { generatePDFReport } from '../controllers/report.controller.js';

const router = express.Router();

// Generate PDF report for research session
router.get('/:chatId/download', generatePDFReport);

export default router;
