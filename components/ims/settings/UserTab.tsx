"use client"

import type { User } from "@/utils/types/user.types"

const FIELDS: { key: string; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "role", label: "Role" },
]

export function UserTab({ user }: { user: User }) {
  const record = user as unknown as Record<string, unknown>
  const displayName = String(record.name ?? record.email ?? "User")

  return (
    <section className="max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{displayName}</h2>
          <p className="text-sm text-muted-foreground">Your account details</p>
        </div>
      </div>

      <dl className="divide-y rounded-lg border bg-background">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="break-words text-sm font-medium sm:col-span-2">
              {record[key] ? String(record[key]) : "—"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}