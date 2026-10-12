import type { FormValues, Toggles } from '@/data/template-form'

export type TemplateFormProps = {
  mode: 'create' | 'edit'
  title: string
  /** `#/create/loading` — the form while its record loads. */
  loading?: boolean
  initialValues?: FormValues
  initialToggles: Toggles
  /** `…/fail` — the next save fails, to show the failure dialog. */
  failNext?: boolean
  onBack: () => void
  onSaveDraft: (values: FormValues, toggles: Toggles) => void
  onSubmit: (values: FormValues, toggles: Toggles) => void
  /** Edit only — saving changes to a published record. */
  onUpdate?: (values: FormValues, toggles: Toggles) => void
}

/* STUB — ported by the template-form agent. */
export function TemplateForm(props: TemplateFormProps) {
  return <div className="p-[var(--space-6)] type-heading-m">{props.title}</div>
}
