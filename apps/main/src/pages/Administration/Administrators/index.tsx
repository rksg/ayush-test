import {
  Loader
} from '@acx-ui/components'
import { /*useUserProfileActions*/ UserProfileUtils } from '@acx-ui/rc/components'
import {
  useGetTenantDetailsQuery,
  useGetMspEcProfileQuery
} from '@acx-ui/rc/services'
import { MSPUtils, TenantType, UserProfile } from '@acx-ui/rc/utils'
import { useParams }                         from '@acx-ui/react-router-dom'

import AdministrationDelegationsTable from './AdministrationDelegationsTable'
import AdministratorsTable            from './AdministratorsTable'

const Administrators = (props: { userProfileData?: UserProfile }) => {
  const { userProfileData } = props
  const params = useParams()
  const mspUtils = MSPUtils()
  const userProfileUtils = UserProfileUtils()

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

  const isPrimeAdminUser = userProfileData ? userProfileUtils.verifyIsPrimeAdminUser(userProfileData) : false
  const isDelegationReady = (!isVAR && !isNonVarMsp) || isMspEc



  // const dateTimeFormat = userProfileData?.dateFormat
  //   ? userProfileData.dateFormat.toUpperCase() + ' ,HH:mm:ss' : ''


  return (
    <>
      <AdministratorsTable currentUserMail={currentUserMail} isPrimeAdminUser={isPrimeAdminUser} isMspEc={isMspEc}/>
      {isDelegationReady &&
        <AdministrationDelegationsTable isMspEc={isMspEc} userProfileData={userProfileData}/>
      }
    </>
  )
}

export default Administrators