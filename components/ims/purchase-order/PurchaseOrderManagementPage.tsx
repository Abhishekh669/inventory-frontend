import { User } from '@/utils/types/user.types'
import { AllPurchasesView } from '../purchase/AllPurchasesView'

function PurchaseOrderManagementPage({user}  : {user : User}) {
  if(!user)return null
  return <AllPurchasesView />
}

export default PurchaseOrderManagementPage