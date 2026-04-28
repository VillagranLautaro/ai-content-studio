import { Router } from 'express'
import { getHistory, getGenerationById, toggleFavorite, deleteGeneration } from '../controllers/history.controller'
import { verifyToken } from '../middleware/auth.middleware'

const router = Router()

router.use(verifyToken)

router.get('/', getHistory)
router.get('/:id', getGenerationById)
router.patch('/:id/favorite', toggleFavorite)
router.delete('/:id', deleteGeneration)

export default router
