import { Unit } from "../types/settings.types";

export const UNIT_NAME_MAX = 30
export const MAX_CREATE_UNITS = 10

/** otherNames = names of the other rows in the same create form */
export function validateUnitName(
  name: string,
  existing: Unit[],
  opts: { ignoreId?: string; otherNames?: string[] } = {}
): string | undefined {
  const value = name.trim()
  if (!value) return "Name is required."
  if (value.length > UNIT_NAME_MAX) return `Name must be at most ${UNIT_NAME_MAX} characters.`

  const lower = value.toLowerCase()
  if (existing.some((u) => u.id !== opts.ignoreId && u.name.toLowerCase() === lower)) {
    return "A unit with this name already exists."
  }
  if (opts.otherNames?.some((n) => n.trim().toLowerCase() === lower)) {
    return "Duplicate name in this list."
  }
}

export function getActionError(res: unknown, fallback: string) {
  if (res && typeof res === "object" && "error" in res) {
    const err = (res as { error?: unknown }).error
    if (typeof err === "string" && err) return err
  }
  return fallback
}