import { useEffect, useState } from 'react'

import {
  Layout as LayoutComponent,
  LayoutUI
} from '@acx-ui/components'
import { SplitProvider } from '@acx-ui/feature-toggle'
import {
  ActivityButton,
  AlarmsButton,
  FetchBot,
  HelpButton,
  UserButton,
  LicenseBanner,
  Logo,
  HeaderContext,
  RegionButton
} from '@acx-ui/main/components'
import { CloudMessageBanner } from '@acx-ui/rc/components'
import {
  useGetTenantDetailQuery
} from '@acx-ui/rc/services'
import { Outlet, useParams, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                                     from '@acx-ui/types'
import { hasRoles, useUserProfileContext }               from '@acx-ui/user'

import { useMenuConfig }     from './menuConfig'
import { LeftHeaderWrapper } from './styledComponents'

function Layout () {
  const { tenantId } = useParams()
  const [tenantType, setTenantType] = useState('')
  const [supportStatus,setSupportStatus] = useState('')
  const basePath = useTenantLink('/users/guestsManager')
  const navigate = useNavigate()
  const params = useParams()

  const { data } = useGetTenantDetailQuery({ params: { tenantId } })
  const { data: userProfile } = useUserProfileContext()
  const companyName = userProfile?.companyName
  const [licenseExpanded, setLicenseExpanded] = useState<boolean>(false)
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])

  useEffect(() => {
    if (isGuestManager && params['*'] !== 'guestsManager') {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}`
      })
    }
  }, [isGuestManager, params['*']])

  useEffect(() => {
    if (data && userProfile) {
      if (userProfile?.support) {
        setTenantType('SUPPORT')
      } else {
        setTenantType(data.tenantType)
      }
    }
  }, [data, userProfile])

  return (
    <LayoutComponent
      logo={<Logo />}
      menuConfig={useMenuConfig(tenantType)}
      content={
        <>
          <CloudMessageBanner />
          <Outlet />
        </>
      }
      leftHeaderContent={<LeftHeaderWrapper>
        <RegionButton/>
        <HeaderContext.Provider value={{ licenseExpanded, setLicenseExpanded }}>
          <LicenseBanner isMSPUser={true}/>
        </HeaderContext.Provider>
      </LeftHeaderWrapper>
      }
      rightHeaderContent={<>
        <LayoutUI.CompanyName>{companyName}</LayoutUI.CompanyName>
        {!isGuestManager &&
          <>
            <AlarmsButton />
            <ActivityButton />
          </>}
        <FetchBot showFloatingButton={false} statusCallback={setSupportStatus}/>
        <HelpButton supportStatus={supportStatus}/>
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
