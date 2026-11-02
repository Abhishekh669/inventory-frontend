"use client"

import { Building2, Ruler, UserRound } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { User } from "@/utils/types/user.types"
import { UserTab } from "./UserTab"
import { CompanyInfoTab } from "./CompanyInfoTab"
import { UnitsTab } from "./UnitTabs"

function SettingManagementPage({ user }: { user: User }) {
  if (!user) return null

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, business details and inventory units.
        </p>
      </header>

      <Tabs defaultValue="company" className="gap-6">
        <TabsList>
          <TabsTrigger value="user">
            <UserRound aria-hidden="true" /> User
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building2 aria-hidden="true" /> Company
          </TabsTrigger>
          <TabsTrigger value="units">
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