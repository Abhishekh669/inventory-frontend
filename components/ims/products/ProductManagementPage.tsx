import type { User } from "@/utils/types/user.types"
import { ProductsView } from "./ProductView"

function ProductManagementPage({ user }: { user: User }) {
  if (!user) return null
  return <ProductsView user={user} />
}

export default ProductManagementPage