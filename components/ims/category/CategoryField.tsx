'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NAME_MAX, SLUG_MAX } from '@/utils/helper/category-validation'

type CategoryFieldsProps = {
  idPrefix: string
  name: string
  slug: string
  onNameChange: (value: string) => void
  onSlugChange: (value: string) => void
  onSlugBlur?: () => void
  onNameBlur?: () => void
  nameError?: string
  slugError?: string
  disabled?: boolean
}

export function CategoryFields({
  idPrefix,
  name,
  slug,
  onNameChange,
  onSlugChange,
  onNameBlur,
  onSlugBlur,
  nameError,
  slugError,
  disabled,
}: CategoryFieldsProps) {
  const nameId = `${idPrefix}-name`
  const slugId = `${idPrefix}-slug`

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor={nameId}>
          Name <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <Input
          id={nameId}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={onNameBlur}
          placeholder="e.g. Beverages"
          maxLength={NAME_MAX}
          disabled={disabled}
          autoFocus
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? `${nameId}-error` : undefined}
        />
        {nameError && (
          <p id={`${nameId}-error`} role="alert" className="text-xs text-destructive">
            {nameError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={slugId}>
          Slug <span className="text-destructive" aria-hidden="true">*</span>
        </Label>
        <Input
          id={slugId}
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          onBlur={onSlugBlur}
          placeholder="e.g. beverages"
          maxLength={SLUG_MAX}
          disabled={disabled}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={Boolean(slugError)}
          aria-describedby={`${slugId}-hint${slugError ? ` ${slugId}-error` : ''}`}
        />
        {slugError ? (
          <p id={`${slugId}-error`} role="alert" className="text-xs text-destructive">
            {slugError}
          </p>
        ) : (
          <p id={`${slugId}-hint`} className="text-xs text-muted-foreground">
            Lowercase letters, numbers and hyphens only. Example: soft-drinks
          </p>
        )}
      </div>
    </>
  )
}