import { useEffect, useState } from 'react'

import {
  Layout as LayoutComponent,
  LayoutUI
} from '@acx-ui/components'
import { SplitProvider } from '@acx-ui/feature-toggle'
import { HomeSolid }     from '@acx-ui/icons'
import {
  ActivityButton,
  AlarmsButton,
  HelpButton,
  UserButton
} from '@acx-ui/main/components'
import {
  MspEcDropdownList,
  MFASetupModal
} from '@acx-ui/msp/components'
import { CloudMessageBanner, useUserProfileContext }                       from '@acx-ui/rc/components'
import { useLazyGetMfaTenantDetailsQuery, useLazyGetMfaAdminDetailsQuery } from '@acx-ui/rc/services'
import { isDelegationMode, MfaDetailStatus, TenantIdFromJwt }              from '@acx-ui/rc/utils'
import { getBasePath, Link, Outlet, useParams }                            from '@acx-ui/react-router-dom'

import { useMenuConfig } from './menuConfig'
import SearchBar         from './SearchBar'
import { Home }          from './styledComponents'


function Layout () {
  const params = useParams()
  const[mfaDetails, setMfaDetails] = useState({} as MfaDetailStatus)
  const[mfaSetupFinish, setMfaSetupFinish] = useState(false)
  const { data: userProfile } = useUserProfileContext()
  const companyName = userProfile?.companyName
  const showHomeButton = isDelegationMode() || userProfile?.var
  const [getMfaTenantDetails] = useLazyGetMfaTenantDetailsQuery()
  const [getMfaAdminDetails] = useLazyGetMfaAdminDetailsQuery()

  const handleMFASetupFinish = () => {
    setMfaSetupFinish(true)
  }

  useEffect(() => {
    const fetchMfaData = async () => {
      const mfaTenantData = await getMfaTenantDetails({ params }).unwrap()
      const mfaDetailsData = await getMfaAdminDetails({
        params: {
          userId: mfaTenantData?.userId
        } }).unwrap()

      setMfaDetails(mfaDetailsData)
    }

    fetchMfaData()
  }, [getMfaAdminDetails, getMfaTenantDetails, params])

  return (
    <LayoutComponent
      menuConfig={useMenuConfig()}
      content={
        mfaDetails.userId !== ''
          ?((mfaDetails.enabled && mfaDetails.mfaMethods.length === 0 && mfaSetupFinish === false)
            ? <MFASetupModal onFinish={handleMFASetupFinish} />
            : <>
              <CloudMessageBanner />
              <Outlet />
            </>)
          :''}
      leftHeaderContent={
        showHomeButton && <Link to={`${getBasePath()}/v/${TenantIdFromJwt()}`}>
          <Home>
            <LayoutUI.Icon children={<HomeSolid />} />
            Home
          </Home>
        </Link>
      }

      rightHeaderContent={<>
        <SearchBar />
        <LayoutUI.Divider />
        {isDelegationMode()
          ? <MspEcDropdownList/>
          : <LayoutUI.CompanyName>{companyName}</LayoutUI.CompanyName>}
        <AlarmsButton/>
        <ActivityButton/>
        <HelpButton/>
        <UserButton/>
      </>}
    />
  )
}

function LayoutWithSplitProvider () {
  return <SplitProvider>
    <Layout />
  </SplitProvider>
}

export default LayoutWithSplitProvider
