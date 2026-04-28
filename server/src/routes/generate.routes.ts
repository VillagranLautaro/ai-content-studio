import { Router } from 'express'
import { getTemplates, getTemplate, generateContent } from '../controllers/generate.controller'
import { verifyToken } from '../middleware/auth.middleware'

const router = Router()

router.use(verifyToken)

router.get('/templates', getTemplates)
router.get('/templates/:id', getTemplate)
router.post('/', generateContent)

export default router
