import {
  useGetTenantDetailsQuery
} from '@acx-ui/rc/services'
import { useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { useUserProfileContext }                 from '@acx-ui/user'
import { AccountType }                           from '@acx-ui/utils'


export function Dashboard () {
  const navigate = useNavigate()
  const params = useParams()

  const { data: userProfile } = useUserProfileContext()
  const linkVarPath = useTenantLink('/dashboard/varCustomers/', 'v')
  const linkMspPath = useTenantLink('/dashboard/mspCustomers/', 'v')

  const tenantDetailsData = useGetTenantDetailsQuery({ params })

  if (tenantDetailsData.data && userProfile) {
    if (tenantDetailsData.data.tenantType === AccountType.VAR &&
        userProfile?.support === false) {
      navigate(linkVarPath, { replace: true })
    } else {
      navigate(linkMspPath, { replace: true })
    }
  }

  return (
    null
    // <></>
  )
}
