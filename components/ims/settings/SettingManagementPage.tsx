"use client"

import { AlertCircle, RotateCcw, Settings } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useGetSettingInfo } from "@/utils/hooks/tanstack/settings/use-get-setting-info"
import { User } from "@/utils/types/user.types"
import { Button } from "@/components/ui/button"
import { SettingsForm } from "./SettingForm"

function SettingManagementPage({ user }: { user: User }) {
  const { data, isLoading, isError, refetch } = useGetSettingInfo()

  if (!user) return null

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Business details and billing defaults used across your bills and inventory.
        </p>
      </header>

      {isLoading && <SettingsSkeleton />}

      {isError && !data?.setting && (
        <StatePanel
          icon={AlertCircle}
          title="Couldn't load settings"
          description="Check your connection and try again."
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RotateCcw data-icon="inline-start" /> Try again
            </Button>
          }
        />
      )}

      {!isLoading && !isError && !data?.setting && (
        <StatePanel
          icon={Settings}
          title="No settings found"
          description="Business settings haven't been created for this account yet."
        />
      )}

      {data?.setting && (
        // key re-initializes the form if the setting changes after a refetch
        <SettingsForm key={data.setting.id} setting={data.setting} />
      )}
    </div>
  )
}

function StatePanel({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed px-6 py-14 text-center">
      <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div
      className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_20rem]"
      aria-busy="true"
      aria-label="Loading settings"
    >
      <div className="flex flex-col">
        <SkeletonSection fieldCount={5} fullWidthIndex={2} />
        <SkeletonSection fieldCount={2} />
        <SkeletonSection fieldCount={1} textarea />
      </div>

      <div className="hidden lg:block">
        <div className="mb-2 h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-80 animate-pulse rounded-lg border bg-muted/40" />
      </div>
    </div>
  )
}

function SkeletonSection({
  fieldCount,
  fullWidthIndex,
  textarea,
}: {
  fieldCount: number
  fullWidthIndex?: number
  textarea?: boolean
}) {
  return (
    <div className="border-t py-8 first:border-t-0 first:pt-0">
      <div className="mb-5 flex flex-col gap-2">
        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
        <div className="h-3 w-60 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: fieldCount }).map((_, i) => (
          <div key={i} className={fullWidthIndex === i ? "sm:col-span-2" : undefined}>
            <div className="mb-2 h-3.5 w-24 animate-pulse rounded bg-muted" />
            <div className={textarea ? "h-20 w-full animate-pulse rounded-lg bg-muted" : "h-8 w-full animate-pulse rounded-lg bg-muted"} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default SettingManagementPage