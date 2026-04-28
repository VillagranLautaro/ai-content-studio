import { Response, NextFunction } from 'express'
import { query } from '../db/connection'
import { AuthRequest, ApiResponse, Generation } from '../types'

interface GenerationRow extends Generation {
  template_name: string | null
}

// ─── GET /history ─────────────────────────────────────────
export async function getHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10)
    const offset = (page - 1) * limit

    const [dataResult, countResult] = await Promise.all([
      query<GenerationRow>(
        `SELECT g.*, t.name as template_name
         FROM generations g
         LEFT JOIN templates t ON g.template_id = t.id
         WHERE g.user_id = $1
         ORDER BY g.created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.user!.userId, limit, offset]
      ),
      query<{ count: string }>(
        `SELECT COUNT(*) as count FROM generations WHERE user_id = $1`,
        [req.user!.userId]
      ),
    ])

    res.json({
      success: true,
      data: {
        generations: dataResult.rows,
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
      },
    } satisfies ApiResponse)
  } catch (err) {
    next(err)
  }
}

// ─── GET /history/:id ─────────────────────────────────────
export async function getGenerationById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query<GenerationRow>(
      `SELECT g.*, t.name as template_name
       FROM generations g
       LEFT JOIN templates t ON g.template_id = t.id
       WHERE g.id = $1 AND g.user_id = $2`,
      [req.params.id, req.user!.userId]
    )
    if (!result.rows[0]) {
      res.status(404).json({ success: false, error: 'Generación no encontrada' } satisfies ApiResponse)
      return
    }
    res.json({ success: true, data: result.rows[0] } satisfies ApiResponse)
  } catch (err) {
    next(err)
  }
}

// ─── PATCH /history/:id/favorite ──────────────────────────
export async function toggleFavorite(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query<Generation>(
      `UPDATE generations
       SET is_favorite = NOT is_favorite
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user!.userId]
    )
    if (!result.rows[0]) {
      res.status(404).json({ success: false, error: 'Generación no encontrada' } satisfies ApiResponse)
      return
    }
    res.json({ success: true, data: result.rows[0] } satisfies ApiResponse)
  } catch (err) {
    next(err)
  }
}

// ─── DELETE /history/:id ──────────────────────────────────
export async function deleteGeneration(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query(
      `DELETE FROM generations WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user!.userId]
    )
    if (!result.rowCount) {
      res.status(404).json({ success: false, error: 'Generación no encontrada' } satisfies ApiResponse)
      return
    }
    res.json({ success: true, message: 'Generación eliminada' } satisfies ApiResponse)
  } catch (err) {
    next(err)
  }
}
