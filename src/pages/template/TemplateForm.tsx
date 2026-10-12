import { useMemo, useRef, useState } from 'react'
import { Alert } from '@/bbl/alert'
import { Button } from '@/bbl/button'
import { Icon } from '@/bbl/icon'
import { IconButton } from '@/bbl/icon-button'
import { OutlineButton } from '@/bbl/outline-button'
import { SpinnerLoader } from '@/bbl/building-block-spinner-loader'
import { ConfirmDialog } from '@/patterns/confirm-dialog'
import { ConsolePage, FormStep } from '@/patterns/console-page'
import { FormRow, FormSectionCard } from '@/patterns/form-section-card'
import type { FormValues, Toggles } from '@/data/template-form'
import { cn } from '@/lib/cn'
import {
  FORM,
  MSG_CHARSET,
  MSG_NO_CHANNEL,
  charsetOk,
  msgMax,
  MSG_REQUIRED,
  STEP_1_TITLE,
  STEP_2_TITLE,
  TOGGLE_OF,
  textProblem,
  type FieldKey,
  type FieldSpec,
  type SectionSpec,
} from './form-spec'
import { TemplateField } from './TemplateField'

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

type Errors = Partial<Record<FieldKey, string>>
type Action = 'draft' | 'submit' | 'update'

const EMPTY_VALUES: FormValues = {}

const FAIL_TITLE: Record<Action, string> = {
  draft: 'Unable to save the draft',
  update: 'Unable to save your changes',
  submit: 'Unable to publish the notification',
}

const SPAN: Record<FieldSpec['span'], string> = {
  half: 'w-[604px]',
  third: 'w-[395px]',
  full: 'w-full',
}

const isOn = (section: SectionSpec, toggles: Toggles) =>
  section.id === 'general' || toggles[TOGGLE_OF[section.id]]

/**
 * Create / Edit notification — webds `console-page` (82 header, scrolling 1280
 * column, 76 footer), two `FormStep`s, and a `form-section-card` per card:
 * General information, then the three channel cards, each switched on and off
 * as a whole. Behaviour is the original build's (`TemplateForm` in
 * .reference/cnh-tm-phase2/app-extract.js).
 */
export function TemplateForm({
  mode,
  title,
  loading,
  initialValues = EMPTY_VALUES,
  initialToggles,
  failNext,
  onBack,
  onSaveDraft,
  onSubmit,
  onUpdate,
}: TemplateFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [toggles, setToggles] = useState<Toggles>(initialToggles)
  const [errors, setErrors] = useState<Errors>({})
  const [noChannel, setNoChannel] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [draftNeedsOpen, setDraftNeedsOpen] = useState(false)
  const [failed, setFailed] = useState<Action | null>(null)
  const body = useRef<HTMLDivElement>(null)

  const dirty = useMemo(
    () =>
      JSON.stringify(values) !== JSON.stringify(initialValues) ||
      JSON.stringify(toggles) !== JSON.stringify(initialToggles),
    [values, toggles, initialValues, initialToggles],
  )

  const change = (key: FieldKey, value: string) => {
    setValues((v) => ({ ...v, [key]: value }))
    const spec = FORM.flatMap((s) => s.rows.flat()).find((f) => f.key === key)
    const problem = spec ? textProblem(spec, value) : undefined
    setErrors((e) => {
      const next = { ...e }
      if (problem) next[key] = problem
      else delete next[key]
      return next
    })
  }

  /** Checks every enabled card; scrolls to the first problem. */
  const validate = (needChannel = true) => {
    const next: Errors = {}
    for (const section of FORM) {
      if (!isOn(section, toggles)) continue
      for (const row of section.rows)
        for (const spec of row) {
          if (spec.editOnly && mode === 'create') continue
          const value = values[spec.key] ?? ''
          /* An Edit leaves an unchanged over-max value alone: the record was
             saved under the old limit. The charset rule still applies. */
          const unchanged = mode === 'edit' && value === (initialValues[spec.key] ?? '')
          const text = spec.kind === 'text' || spec.kind === 'textarea'
          const over = text && !!spec.max && value.length > spec.max && !unchanged
          const charset = text && !charsetOk(value, spec.rawFormat)
          if (spec.required && !value.trim()) next[spec.key] = MSG_REQUIRED
          else if (over && charset) next[spec.key] = `${MSG_CHARSET}\n${msgMax(spec.max!)}`
          else if (charset) next[spec.key] = MSG_CHARSET
          else if (over) next[spec.key] = msgMax(spec.max!)
        }
    }
    const channelMissing = needChannel && !toggles.push && !toggles.email && !toggles.sms
    setErrors(next)
    setNoChannel(channelMissing)
    if (Object.keys(next).length || channelMissing) {
      requestAnimationFrame(() => {
        body.current?.querySelector('[data-error="true"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      })
      return false
    }
    return true
  }

  const run = (action: Action) => {
    if (action === 'draft') {
      /* A draft needs General information's required fields and one channel. */
      const missing = FORM[0].rows
        .flat()
        .filter((f) => !(f.editOnly && mode === 'create'))
        .filter((f) => f.required && !(values[f.key] ?? '').trim())
        .map((f) => f.key)
      const channelMissing = !toggles.push && !toggles.email && !toggles.sms
      if (missing.length || channelMissing) {
        setNoChannel(channelMissing)
        setErrors(Object.fromEntries(missing.map((k) => [k, MSG_REQUIRED])))
        setDraftNeedsOpen(true)
        return
      }
      if (failNext) return setFailed('draft')
      return onSaveDraft(values, toggles)
    }
    if (!validate(action !== 'update' || values.status !== 'Draft')) return
    if (failNext) return setFailed(action)
    if (action === 'update') onUpdate?.(values, toggles)
    else onSubmit(values, toggles)
  }

  return (
    <>
      <ConsolePage
        /* The form's ground is the SECONDARY surface; the cards are the white. */
        className="h-full bg-[var(--color-surface-secondary-default)]"
        bodyRef={body}
        back={
          <IconButton
            size={24}
            label="Back"
            icon={<Icon slug="chevron-left" size={24} />}
            onClick={() => (dirty ? setLeaveOpen(true) : onBack())}
          />
        }
        title={title}
        actions={
          mode === 'create' ? (
            <>
              <OutlineButton className="w-[177px]" disabled={loading} onClick={() => run('draft')}>
                Save as draft
              </OutlineButton>
              <Button className="w-[177px]" disabled={loading} onClick={() => run('submit')}>
                Publish
              </Button>
            </>
          ) : (
            <Button className="w-[177px]" disabled={!dirty || loading} onClick={() => run('update')}>
              Save
            </Button>
          )
        }
      >
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <SpinnerLoader size="l" appearance="brand" />
          </div>
        ) : (
          <>
            <FormStep title={STEP_1_TITLE}>
              <Section mode={mode} section={FORM[0]} values={values} errors={errors} enabled onChange={change} />
            </FormStep>
            <FormStep
              title={STEP_2_TITLE}
              alert={noChannel ? <Alert
                    appearance="negative"
                    title={MSG_NO_CHANNEL}
                    /* The slot the file names for Negative: Icon/24px/General Icon/CloseCircle. */
                    icon={<Icon slug="close-circle" size={24} color="var(--color-icon-negative-default)" />}
                  /> : undefined}
            >
              <div className="flex flex-col gap-[var(--space-8)]" data-error={noChannel ? 'true' : undefined}>
                {FORM.slice(1).map((section) => (
                  <Section
                    key={section.id}
                    mode={mode}
                    section={section}
                    values={values}
                    errors={errors}
                    invalid={noChannel}
                    enabled={isOn(section, toggles)}
                    onChange={change}
                    onToggle={(on) => {
                      setToggles((t) => ({ ...t, [TOGGLE_OF[section.id as Exclude<typeof section.id, 'general'>]]: on }))
                      if (on) setNoChannel(false)
                      /* Switching a card off keeps what was typed but drops its errors. */
                      if (!on)
                        setErrors((e) => {
                          const next = { ...e }
                          for (const f of section.rows.flat()) delete next[f.key]
                          return next
                        })
                    }}
                  />
                ))}
              </div>
            </FormStep>
          </>
        )}
      </ConsolePage>

      {leaveOpen && (
        <ConfirmDialog
          anatomy="sectioned"
          contentType="label-xl"
          layer="fixed"
          width={600}
          title="You are about to leave this page"
          cancelLabel="Leave"
          confirmLabel="Stay"
          onCancel={() => {
            setLeaveOpen(false)
            onBack()
          }}
          onConfirm={() => setLeaveOpen(false)}
          onDismiss={() => setLeaveOpen(false)}
          className="z-50"
        >
          The changes you made will not be saved
        </ConfirmDialog>
      )}

      {failed && (
        <ConfirmDialog
          anatomy="sectioned"
          contentType="heading-xxs"
          layer="fixed"
          width={600}
          title={FAIL_TITLE[failed]}
          cancelLabel="Close"
          confirmLabel="Try again"
          onCancel={() => setFailed(null)}
          onDismiss={() => setFailed(null)}
          onConfirm={() => {
            const again = failed
            setFailed(null)
            run(again)
          }}
          className="z-50"
        >
          Please try again
        </ConfirmDialog>
      )}

      {draftNeedsOpen && (
        <ConfirmDialog
          anatomy="sectioned"
          layer="fixed"
          width={600}
          title="Fill in all required General Info fields and at least 1 Channel to save as draft"
          onDismiss={() => setDraftNeedsOpen(false)}
          actions={<Button onClick={() => setDraftNeedsOpen(false)}>Ok</Button>}
          className="z-50 [&_.webds-pattern-confirm-dialog-5]:hidden"
        />
      )}
    </>
  )
}

function Section({
  mode,
  section,
  values,
  errors,
  enabled,
  invalid,
  onChange,
  onToggle,
}: {
  mode: 'create' | 'edit'
  section: SectionSpec
  values: FormValues
  errors: Errors
  enabled: boolean
  invalid?: boolean
  onChange: (key: FieldKey, value: string) => void
  onToggle?: (on: boolean) => void
}) {
  /* Edit shows the edit-only Status field; when its row and the row above all
     carry an edit width, they share one row, as the source draws them. */
  const rows = section.rows
    .map((row) => row.filter((f) => mode === 'edit' || !f.editOnly))
    .filter((row) => row.length > 0)
    .reduce<FieldSpec[][]>((acc, row) => {
      const last = acc[acc.length - 1]
      if (mode === 'edit' && last && row.every((f) => f.editOnly) && last.every((f) => f.editWidth)) last.push(...row)
      else acc.push([...row])
      return acc
    }, [])

  const title = section.hint ? (
    <span className="flex flex-col">
      <span>{section.title}</span>
      <span className="type-body-s text-[var(--color-text-secondary-default)]">{section.hint}</span>
    </span>
  ) : (
    section.title
  )

  return (
    <FormSectionCard
      title={title}
      toggle={section.toggle ? { on: enabled, onToggle: (on) => onToggle?.(on) } : undefined}
      invalid={invalid}
      rowGap={section.rowGap ?? 6}
    >
      {rows.map((row, i) => (
        <FormRow key={i}>
          {row.map((spec) => {
            const fixed = mode === 'edit' && spec.editWidth
            return (
              <div
                key={spec.key}
                className={cn('shrink-0', !fixed && SPAN[spec.span])}
                style={fixed ? { width: spec.editWidth } : undefined}
                data-error={errors[spec.key] ? 'true' : undefined}
              >
                <TemplateField
                  spec={spec}
                  value={values[spec.key] ?? ''}
                  error={errors[spec.key]}
                  disabled={!enabled}
                  onChange={(v) => onChange(spec.key, v)}
                />
              </div>
            )
          })}
        </FormRow>
      ))}
    </FormSectionCard>
  )
}
