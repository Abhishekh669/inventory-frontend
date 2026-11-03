"use client"

import { useParams } from "next/navigation"
import type { User } from "@/utils/types/user.types"
import { CategoryProductsView } from "./CategoryProductView"

function CategorySlugManagementPage({ user }: { user: User }) {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug

  if (!slug) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Category not found</h1>
      </div>
    )
  }

  return <CategoryProductsView slug={slug} user={user} />
}

export default CategorySlugManagementPage
