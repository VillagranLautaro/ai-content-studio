import { useState, useCallback, useRef } from 'react'
import type { Template } from '@/types'

interface UseGenerateReturn {
  output: string
  isGenerating: boolean
  isComplete: boolean
  error: string | null
  generate: (template: Template, params: Record<string, string>) => Promise<void>
  reset: () => void
}

export function useGenerate(): UseGenerateReturn {
  const [output, setOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const generate = useCallback(async (template: Template, params: Record<string, string>) => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setOutput('')
    setError(null)
    setIsComplete(false)
    setIsGenerating(true)

    const token = localStorage.getItem('accessToken')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ templateId: template.id, params }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Error al generar contenido')
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process all complete lines in the buffer
        const lines = buffer.split('\n')
        // Keep the last (potentially incomplete) line in the buffer
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue

          const data = trimmed.slice(6)
          if (data === '[DONE]') {
            setIsComplete(true)
            continue
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              setOutput(prev => prev + parsed.text)
            }
            if (parsed.error) {
              setError(parsed.error)
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return
      setError((err as Error).message || 'Error inesperado')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setOutput('')
    setError(null)
    setIsComplete(false)
    setIsGenerating(false)
  }, [])

  return { output, isGenerating, isComplete, error, generate, reset }
}
