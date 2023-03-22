import {
  useGetTenantDetailsQuery,
  useGetMspEcProfileQuery
} from '@acx-ui/rc/services'
import { MSPUtils, TenantType }  from '@acx-ui/rc/utils'
import { useParams }             from '@acx-ui/react-router-dom'
import { useUserProfileContext } from '@acx-ui/user'

import AdministratorsTable from './AdministratorsTable'
import DelegationsTable    from './DelegationsTable'
import * as UI             from './styledComponents'

const Administrators = () => {
  const params = useParams()
  const mspUtils = MSPUtils()
  const { data: userProfileData, isPrimeAdmin } = useUserProfileContext()

  const tenantDetailsData = useGetTenantDetailsQuery({ params })
  const mspEcProfileData = useGetMspEcProfileQuery({ params })

  const isVAR = userProfileData?.var && !userProfileData?.support
  const isNonVarMsp = (tenantDetailsData.data?.tenantType === TenantType.MSP_NON_VAR)
  let isMspEc = mspUtils.isMspEc(mspEcProfileData.data)
  let currentUserMail = userProfileData?.email

  if (mspEcProfileData.data) {
    if (isMspEc === true) {
      currentUserMail = ''
    }
  }

  const isPrimeAdminUser = isPrimeAdmin()
  const isDelegationReady = (!isVAR && !isNonVarMsp) || isMspEc

  return (
    <UI.Wrapper
      direction='vertical'
      justify-content='space-around'
      size={36}
    >
      <AdministratorsTable
        currentUserMail={currentUserMail}
        isPrimeAdminUser={isPrimeAdminUser}
        isMspEc={isMspEc}
      />
      {isDelegationReady &&
        <DelegationsTable
          isMspEc={isMspEc}
          userProfileData={userProfileData}/>
      }
    </UI.Wrapper>
  )
}

export default Administrators
