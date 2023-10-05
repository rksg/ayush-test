import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Layout as LayoutComponent,
  LayoutUI
} from '@acx-ui/components'
import { Features, SplitProvider, useIsSplitOn } from '@acx-ui/feature-toggle'
import { AdminSolid }                            from '@acx-ui/icons'
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
import {
  useMspEntitlementListQuery,
  useGetTenantDetailQuery
} from '@acx-ui/msp/services'
import { CloudMessageBanner }                                                       from '@acx-ui/rc/components'
import { Outlet, useParams, useNavigate, useTenantLink, TenantNavLink, TenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                                                                from '@acx-ui/types'
import { hasRoles, useUserProfileContext }                                          from '@acx-ui/user'

import { useMenuConfig } from './menuConfig'
import * as UI           from './styledComponents'

function Layout () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [tenantType, setTenantType] = useState('')
  const [hasLicense, setHasLicense] = useState(false)
  const [isDogfood, setDogfood] = useState(false)
  const [supportStatus,setSupportStatus] = useState('')
  const basePath = useTenantLink('/users/guestsManager')
  const dpskBasePath = useTenantLink('/users/dpskAdmin')
  const navigate = useNavigate()
  const params = useParams()
  const isHspSupportEnabled = useIsSplitOn(Features.MSP_HSP_SUPPORT)

  const { data } = useGetTenantDetailQuery({ params: { tenantId } })
  const { data: userProfile } = useUserProfileContext()
  const companyName = userProfile?.companyName
  const [licenseExpanded, setLicenseExpanded] = useState<boolean>(false)
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const isDPSKAdmin = hasRoles([RolesEnum.DPSK_ADMIN])
  const indexPath = isGuestManager ? '/users/guestsManager' : '/dashboard'
  const { data: mspEntitlement } = useMspEntitlementListQuery({ params })

  useEffect(() => {
    if (isGuestManager && params['*'] !== 'guestsManager') {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}`
      })
    }
    if (isDPSKAdmin && params['*'] !== 'dpskAdmin') {
      navigate({
        ...dpskBasePath,
        pathname: `${dpskBasePath.pathname}`
      })
    }
  }, [isGuestManager, isDPSKAdmin, params['*']])

  useEffect(() => {
    if (data && userProfile) {
      if (userProfile?.support || userProfile?.dogfood) {
        setTenantType('SUPPORT')
      } else {
        setTenantType(data.tenantType)
      }
      setDogfood(userProfile?.dogfood && !userProfile?.support)
    }
    if (mspEntitlement?.length && mspEntitlement?.length > 0) {
      setHasLicense(true)
    }
  }, [data, userProfile, mspEntitlement])

  return (
    <LayoutComponent
      logo={<TenantNavLink to={indexPath} tenantType={'v'} children={<Logo />} />}
      menuConfig={useMenuConfig(tenantType, hasLicense, isDogfood)}
      content={
        <>
          <CloudMessageBanner />
          <Outlet />
        </>
      }
      leftHeaderContent={<>
        {isHspSupportEnabled && <TenantLink to='/dashboard'>
          <UI.MyAccount>
            <LayoutUI.Icon children={<AdminSolid />} />
            {$t({ defaultMessage: 'My Account' })}
          </UI.MyAccount></TenantLink>}
        <RegionButton/>
        <HeaderContext.Provider value={{ licenseExpanded, setLicenseExpanded }}>
          <LicenseBanner isMSPUser={true}/>
        </HeaderContext.Provider>
      </>}
      rightHeaderContent={<>
        <LayoutUI.CompanyName>{companyName}</LayoutUI.CompanyName>
        {!(isGuestManager || isDPSKAdmin) &&
          <>
            <AlarmsButton/>
            <ActivityButton/>
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
