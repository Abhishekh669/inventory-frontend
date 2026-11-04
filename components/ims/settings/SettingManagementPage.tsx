"use client"

import { Building2, Ruler, Settings2, UserRound } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { User } from "@/utils/types/user.types"
import { UserTab } from "./UserTab"
import { CompanyInfoTab } from "./CompanyInfoTab"
import { UnitsTab } from "./UnitTabs"

// Works with both Radix (data-state) and Base UI (data-active) tab primitives.
const TRIGGER_CLASS =
  "h-9 flex-none gap-2 rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors " +
  "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm " +
  "data-active:bg-background data-active:text-foreground data-active:shadow-sm"

function SettingManagementPage({ user }: { user: User }) {
  if (!user) return null

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-8 flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Settings2 className="size-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your account, business details and inventory units.
          </p>
        </div>
      </header>

      <Tabs defaultValue="company" className="gap-8">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-muted/70 p-1 sm:w-fit">
          <TabsTrigger value="user" className={TRIGGER_CLASS}>
            <UserRound aria-hidden="true" /> User
          </TabsTrigger>
          <TabsTrigger value="company" className={TRIGGER_CLASS}>
            <Building2 aria-hidden="true" /> Company
          </TabsTrigger>
          <TabsTrigger value="units" className={TRIGGER_CLASS}>
            <Ruler aria-hidden="true" /> Units
          </TabsTrigger>
        </TabsList>

        <TabsContent value="user">
          <UserTab user={user} />
        </TabsContent>
        <TabsContent value="company">
          <CompanyInfoTab />
        </TabsContent>
        <TabsContent value="units">
          <UnitsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingManagementPage