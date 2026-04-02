import { Router } from 'express';
import { 
  exportSalesReport, 
  exportOrdersReport, 
  exportInventoryReport,
  getExportOptions 
} from '../controllers/export.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/export/sales', authenticate, authorizeAdmin, exportSalesReport);
router.get('/export/orders', authenticate, authorizeAdmin, exportOrdersReport);
router.get('/export/inventory', authenticate, authorizeAdmin, exportInventoryReport);
router.get('/export/options', authenticate, authorizeAdmin, getExportOptions);

export default router;
