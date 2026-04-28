import { Response, NextFunction } from 'express'
import Groq from 'groq-sdk'
import { z } from 'zod'
import { query } from '../db/connection'
import { AuthRequest, ApiResponse, Template } from '../types'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const generateSchema = z.object({
  templateId: z.string().uuid(),
  params: z.record(z.string()),
})

function buildPrompt(template: string, params: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] || '')
}

export async function getTemplates(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query<Template>(
      `SELECT id, name, category, fields, is_active FROM templates WHERE is_active = true ORDER BY name`
    )
    res.json({ success: true, data: result.rows } satisfies ApiResponse)
  } catch (err) {
    next(err)
  }
}

export async function getTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query<Template>(
      `SELECT * FROM templates WHERE id = $1 AND is_active = true`,
      [req.params.id]
    )
    if (!result.rows[0]) {
      res.status(404).json({ success: false, error: 'Template no encontrado' } satisfies ApiResponse)
      return
    }
    res.json({ success: true, data: result.rows[0] } satisfies ApiResponse)
  } catch (err) {
    next(err)
  }
}

export async function generateContent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { templateId, params } = generateSchema.parse(req.body)

    const tplResult = await query<Template>(
      `SELECT * FROM templates WHERE id = $1 AND is_active = true`,
      [templateId]
    )
    const template = tplResult.rows[0]
    if (!template) {
      res.status(404).json({ success: false, error: 'Template no encontrado' } satisfies ApiResponse)
      return
    }

    const prompt = buildPrompt(template.prompt_template, params)

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    try {
      const stream = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        max_tokens: 1500,
      })

      let fullText = ''
      let totalTokens = 0

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          fullText += content
          res.write(`data: ${JSON.stringify({ text: content })}\n\n`)
        }
        const chunkAny = chunk as unknown as { usage?: { total_tokens?: number } }
        if (chunkAny.usage?.total_tokens) {
          totalTokens = chunkAny.usage!.total_tokens!
        }
      }

      await query(
        `INSERT INTO generations (user_id, template_id, input_params, output_text, tokens_used)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.user!.userId, templateId, JSON.stringify(params), fullText, totalTokens]
      )

      res.write(`data: [DONE]\n\n`)
      res.end()
    } catch (streamError) {
      console.error('[Generate] Stream error:', streamError)
      res.write(`data: ${JSON.stringify({ error: 'Error durante la generación' })}\n\n`)
      res.end()
    }
  } catch (err) {
    if (!res.headersSent) {
      next(err)
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Error durante la generación' })}\n\n`)
      res.end()
    }
  }
}
