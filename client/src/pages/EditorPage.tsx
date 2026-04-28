import { useEffect, useState } from 'react'
import { generateApi } from '@/services/api'
import { useGenerate } from '@/hooks/useGenerate'
import { Button } from '@/components/ui/Button'
import { Card, Badge, Spinner } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import type { Template } from '@/types'

export function EditorPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [params, setParams] = useState<Record<string, string>>({})
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [copied, setCopied] = useState(false)

  const { output, isGenerating, isComplete, error, generate, reset } = useGenerate()

  useEffect(() => {
    generateApi.getTemplates()
      .then(({ data }) => {
        if (data.data) setTemplates(data.data)
      })
      .finally(() => setLoadingTemplates(false))
  }, [])

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setParams({})
    reset()
  }

  const handleParamChange = (key: string, value: string) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  const handleGenerate = () => {
    if (!selectedTemplate) return
    generate(selectedTemplate, params)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isFormValid = selectedTemplate?.fields
    .filter(f => f.required)
    .every(f => params[f.key]?.trim())

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Editor IA</h1>
        <p className="text-sm text-gray-500 mt-1">Elegí un template y generá contenido en segundos</p>
      </div>

      <div className="grid grid-cols-[320px_1fr] gap-6 items-start">

        {/* Left panel: template selector + form */}
        <div className="space-y-4">

          {/* Template selector */}
          <Card className="p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Templates
            </h2>

            {loadingTemplates ? (
              <div className="flex justify-center py-6"><Spinner /></div>
            ) : (
              <ul className="space-y-1.5">
                {templates.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => handleSelectTemplate(t)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                        selectedTemplate?.id === t.id
                          ? 'bg-violet-50 border border-violet-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-800 truncate">{t.name}</span>
                        <Badge label={t.category} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Dynamic form */}
          {selectedTemplate && (
            <Card className="p-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Parámetros
              </h2>
              <div className="space-y-4">
                {selectedTemplate.fields.map((field) => {
                  if (field.type === 'select') {
                    return (
                      <div key={field.key} className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          {field.label}
                          {field.required && <span className="text-violet-500 ml-1">*</span>}
                        </label>
                        <select
                          value={params[field.key] || ''}
                          onChange={(e) => handleParamChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors"
                        >
                          <option value="">Seleccioná...</option>
                          {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    )
                  }

                  if (field.type === 'textarea') {
                    return (
                      <div key={field.key} className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          {field.label}
                          {field.required && <span className="text-violet-500 ml-1">*</span>}
                        </label>
                        <textarea
                          value={params[field.key] || ''}
                          onChange={(e) => handleParamChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors resize-none"
                        />
                      </div>
                    )
                  }

                  if (field.type === 'boolean') {
                    return (
                      <div key={field.key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={field.key}
                          checked={params[field.key] === 'true'}
                          onChange={(e) => handleParamChange(field.key, String(e.target.checked))}
                          className="w-4 h-4 rounded text-violet-600 border-gray-300 focus:ring-violet-500"
                        />
                        <label htmlFor={field.key} className="text-sm font-medium text-gray-700">
                          {field.label}
                        </label>
                      </div>
                    )
                  }

                  // text (default)
                  return (
                    <Input
                      key={field.key}
                      label={field.label}
                      value={params[field.key] || ''}
                      onChange={(e) => handleParamChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )
                })}

                <Button
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  disabled={!isFormValid || isGenerating}
                  className="w-full mt-2"
                >
                  {isGenerating ? 'Generando...' : 'Generar contenido'}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right panel: output */}
        <Card className="min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900">Resultado</h2>
              {isGenerating && (
                <span className="flex items-center gap-1.5 text-xs text-violet-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                  Generando...
                </span>
              )}
              {isComplete && (
                <span className="text-xs text-green-600 font-medium">✓ Completado</span>
              )}
            </div>
            {output && (
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                {copied ? '✓ Copiado' : 'Copiar'}
              </Button>
            )}
          </div>

          <div className="flex-1 p-5">
            {!output && !isGenerating && !error && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <p className="text-sm">
                  {selectedTemplate
                    ? 'Completá los parámetros y presioná Generar'
                    : 'Elegí un template para empezar'}
                </p>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {output && (
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                {output}
                {isGenerating && (
                  <span className="inline-block w-0.5 h-4 bg-violet-500 animate-pulse ml-0.5 align-middle" />
                )}
              </pre>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
