'use client'

import { useMemo, useState } from 'react'
import { Building2, Loader2, MessageSquareText, ReceiptText, RotateCcw, Save, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Setting, UpdateSettingRequest } from '@/utils/types/settings.types'
import { updateSetting } from '@/utils/action/settings/setting.put'

const PAN_LENGTH = 9

type SettingForm = {
  name: string
  address: string
  phone: string
  panNo: string
  defaultVatRate: string
  lowStockDefault: string
  billFooter: string
}

// Keep digits only and cap at 9 characters
function sanitizePan(value: string) {
  return value.replace(/\D/g, '').slice(0, PAN_LENGTH)
}

function toForm(setting: Setting): SettingForm {
  return {
    name: setting.name ?? '',
    address: setting.address ?? '',
    phone: setting.phone ?? '',
    // PAN and VAT are the same number, so fall back to vat_no if pan_no is empty
    panNo: sanitizePan(setting.pan_no || setting.vat_no || ''),
    defaultVatRate: String(setting.default_vat_rate ?? ''),
    lowStockDefault: String(setting.low_stock_default ?? ''),
    billFooter: setting.bill_footer ?? '',
  }
}

function formatDate(value?: string | Date | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function SettingsForm({ setting }: { setting: Setting }) {
  const initialForm = useMemo(() => toForm(setting), [setting])
  const [form, setForm] = useState<SettingForm>(initialForm)
  const [baseline, setBaseline] = useState<SettingForm>(initialForm)
  const [isSaving, setIsSaving] = useState(false)
  const queryClient = useQueryClient()

  const isDirty = useMemo(
    () => (Object.keys(form) as (keyof SettingForm)[]).some((key) => form[key] !== baseline[key]),
    [form, baseline]
  )

  function updateField(field: keyof SettingForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function resetForm() {
    setForm(baseline)
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isDirty || isSaving) return

    const vatRate = form.defaultVatRate.trim() === '' ? 13 : Number(form.defaultVatRate)
    const lowStock = form.lowStockDefault.trim() === '' ? 50 : Number(form.lowStockDefault)

    if (!new RegExp(`^\\d{${PAN_LENGTH}}$`).test(form.panNo)) {
      toast.error(`PAN number must be exactly ${PAN_LENGTH} digits.`)
      return
    }
    if (Number.isNaN(vatRate) || vatRate < 0 || vatRate > 100) {
      toast.error('VAT rate must be a number between 0 and 100.')
      return
    }
    if (Number.isNaN(lowStock) || lowStock < 0) {
      toast.error('Low stock threshold must be 0 or more.')
      return
    }

    // Digits were validated as a number-only string; send it as a string.
    // PAN and VAT are the same, so both fields get the same value.
    const panNo = String(form.panNo)

    const payload: UpdateSettingRequest = {
      name: form.name.trim(),
      address: form.address.trim() || 'Nepal',
      phone: form.phone.trim() || '9812345678',
      pan_no: panNo,
      vat_no: panNo,
      default_vat_rate: vatRate,
      low_stock_default: lowStock,
      bill_footer: form.billFooter.trim() || 'Thank you',
    }

    setIsSaving(true)
    try {
      const res = await updateSetting(payload)

      if (!res.success) {
        toast.error(res.error || 'Failed to update settings.')
        return
      }

      setBaseline(form)
      toast.success('Settings saved.')
      queryClient.invalidateQueries({ queryKey: ['get-setting-info'] })
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong while saving. Please try again.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form
      onSubmit={saveSettings}
      className="grid items-start gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div className="flex min-w-0 flex-col gap-6">
        <FormSection
          icon={Building2}
          title="Business profile"
          description="Shown at the top of every bill."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Business name" id="name" value={form.name} onChange={(v) => updateField('name', v)} required />
            <Field label="Phone number" id="phone" value={form.phone} onChange={(v) => updateField('phone', v)} placeholder="Optional" />
            <Field label="Address" id="address" value={form.address} onChange={(v) => updateField('address', v)} placeholder="Optional" className="sm:col-span-2" />
            <Field
              label="PAN / VAT number"
              id="panNo"
              value={form.panNo}
              onChange={(v) => updateField('panNo', sanitizePan(v))}
              placeholder="9-digit number"
              required
              inputMode="numeric"
              maxLength={PAN_LENGTH}
              pattern={`[0-9]{${PAN_LENGTH}}`}
              title={`Enter exactly ${PAN_LENGTH} digits`}
              hint={`Exactly ${PAN_LENGTH} digits. Also used as your VAT number.`}
              className="sm:col-span-2"
            />
          </div>
        </FormSection>

        <FormSection
          icon={ReceiptText}
          title="Billing defaults"
          description="Used when you create new products and bills."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Default VAT rate"
              id="defaultVatRate"
              value={form.defaultVatRate}
              onChange={(v) => updateField('defaultVatRate', v)}
              type="number"
              suffix="%"
              min="0"
              max="100"
              step="0.01"
              hint="Applied to new products and bills."
            />
            <Field
              label="Low stock threshold"
              id="lowStockDefault"
              value={form.lowStockDefault}
              onChange={(v) => updateField('lowStockDefault', v)}
              type="number"
              min="0"
              step="1"
              hint="Starting re-order level for new products."
            />
          </div>
        </FormSection>

        <FormSection
          icon={MessageSquareText}
          title="Bill footer"
          description="Printed at the bottom of every bill."
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="billFooter">Footer message</Label>
            <Textarea
              id="billFooter"
              value={form.billFooter}
              onChange={(e) => updateField('billFooter', e.target.value)}
              rows={3}
              placeholder="Optional"
            />
          </div>
        </FormSection>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border bg-muted/40 px-3 py-1">Created {formatDate(setting.created_at)}</span>
          <span className="break-all rounded-full border bg-muted/40 px-3 py-1">ID {setting.id}</span>
        </div>
      </div>

      <BillPreview form={form} />

      <div
        inert={!isDirty}
        className={cn(
          'sticky bottom-4 z-10 col-span-full flex justify-center transition-all duration-200 motion-reduce:transition-none',
          isDirty ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        )}
      >
        <div className="flex w-full max-w-xl items-center justify-between gap-3 rounded-full bg-foreground py-2 pl-5 pr-2 text-background shadow-xl">
          <p className="flex items-center gap-2.5 text-sm font-medium">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-amber-400" />
            </span>
            {isSaving ? 'Saving changes...' : 'Unsaved changes'}
          </p>
          <div className="flex gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
              disabled={isSaving}
              className="rounded-full text-background hover:bg-background/15 hover:text-background"
            >
              <RotateCcw data-icon="inline-start" /> Reset
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              aria-busy={isSaving}
              className="rounded-full bg-background text-foreground hover:bg-background/90"
            >
              {isSaving ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Save data-icon="inline-start" />
              )}
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon
  title: string
  description: string
  children: React.ReactNode
}) {
  const headingId = `${title.toLowerCase().replace(/\s+/g, '-')}-heading`
  return (
    <section aria-labelledby={headingId} className="rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b px-5 py-4 sm:px-6">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-[18px]" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 id={headingId} className="text-sm font-semibold">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  )
}

// Zig-zag bottom edge so the preview reads as a torn paper receipt.
const TORN_EDGE: React.CSSProperties = {
  WebkitMask: 'conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%',
  mask: 'conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%',
}

function BillPreview({ form }: { form: SettingForm }) {
  const vatRate = form.defaultVatRate.trim()

  return (
    <aside aria-label="Bill preview" className="lg:sticky lg:top-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">Bill preview</p>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          Updates as you type
        </span>
      </div>

      <div className="rounded-2xl border bg-muted/50 p-4">
        <div className="drop-shadow-md">
          <div className="bg-card px-5 pb-8 pt-6 font-mono" style={TORN_EDGE}>
            <div className="text-center">
              <p className={cn('break-words text-base font-semibold', !form.name && 'text-muted-foreground/60')}>
                {form.name || 'Business name'}
              </p>
              {form.address && <p className="mt-1 break-words text-xs text-muted-foreground">{form.address}</p>}
              {form.phone && <p className="text-xs text-muted-foreground">{form.phone}</p>}
              {form.panNo && <p className="mt-1 text-xs text-muted-foreground">PAN {form.panNo}</p>}
            </div>

            <div className="my-4 border-t border-dashed" />

            <div className="flex flex-col gap-2.5" aria-hidden="true">
              {[28, 20, 24].map((width, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="h-2 rounded bg-muted" style={{ width: `${width * 4}px` }} />
                  <div className="h-2 w-10 rounded bg-muted" />
                </div>
              ))}
            </div>

            <div className="my-4 border-t border-dashed" />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>VAT{vatRate ? ` (${vatRate}%)` : ''}</span>
              <div className="h-2 w-10 rounded bg-muted" aria-hidden="true" />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <div className="h-2.5 w-14 rounded bg-foreground/20" aria-hidden="true" />
            </div>

            <div className="my-4 border-t border-dashed" />

            <p
              className={cn(
                'whitespace-pre-line break-words text-center text-xs',
                form.billFooter ? 'text-foreground' : 'text-muted-foreground/60'
              )}
            >
              {form.billFooter || 'Footer message'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

type FieldProps = {
  label: string
  id: keyof SettingForm
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  min?: string
  max?: string
  step?: string
  suffix?: string
  hint?: string
  className?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number
  pattern?: string
  title?: string
}

function Field({
  label,
  id,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  min,
  max,
  step,
  suffix,
  hint,
  className,
  inputMode,
  maxLength,
  pattern,
  title,
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={type}
          inputMode={inputMode ?? (type === 'number' ? 'decimal' : undefined)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          step={step}
          maxLength={maxLength}
          pattern={pattern}
          title={title}
          aria-describedby={hintId}
          className={cn('h-10', suffix && 'pr-9')}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}