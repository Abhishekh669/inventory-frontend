import { User } from "@/utils/types/user.types"
import { AllPurchasesView } from "./AllPurchasesView"

export default function PurchaseManagementPage({user} : {user : User}) {
  if(!user)return null;
  return <AllPurchasesView />
}