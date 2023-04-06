import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Layout as LayoutComponent,
  LayoutUI
} from '@acx-ui/components'
import { SplitProvider } from '@acx-ui/feature-toggle'
import { HomeSolid }     from '@acx-ui/icons'
import {
  ActivityButton,
  AlarmsButton,
  FetchBot,
  HelpButton,
  UserButton,
  LicenseBanner,
  HeaderContext,
  RegionButton
} from '@acx-ui/main/components'
import {
  MspEcDropdownList
} from '@acx-ui/msp/components'
import { CloudMessageBanner, useUpdateGoogleMapRegion }          from '@acx-ui/rc/components'
import { useGetPreferencesQuery }                                from '@acx-ui/rc/services'
import { isDelegationMode, TenantPreferenceSettings }            from '@acx-ui/rc/utils'
import { getBasePath, Link, Outlet, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { useParams }                                             from '@acx-ui/react-router-dom'
import { RolesEnum }                                             from '@acx-ui/types'
import { hasRoles, useUserProfileContext }                       from '@acx-ui/user'
import { getJwtTokenPayload, PverName }                          from '@acx-ui/utils'

import { useMenuConfig } from './menuConfig'
import SearchBar         from './SearchBar'
import * as UI           from './styledComponents'

const getMapRegion = (data: TenantPreferenceSettings | undefined): string => {
  return data?.global.mapRegion as string
}

function Layout () {
  const [supportStatus,setSupportStatus] = useState('')
  const [isSkip, setSkipQuery] = useState(false)

  const { data: userProfile } = useUserProfileContext()
  const companyName = userProfile?.companyName
  const showHomeButton = isDelegationMode() || userProfile?.var
  const { $t } = useIntl()
  const basePath = useTenantLink('/users/guestsManager')
  const navigate = useNavigate()
  const params = useParams()
  const searchFromUrl = params.searchVal || ''

  const [searchExpanded, setSearchExpanded] = useState<boolean>(searchFromUrl !== '')
  const [licenseExpanded, setLicenseExpanded] = useState<boolean>(false)
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])

  const { data } = useGetPreferencesQuery({ params }, { skip: isSkip })
  const { update: updateGoogleMapRegion } = useUpdateGoogleMapRegion()
  const isBackToRC = (PverName.ACX === getJwtTokenPayload().pver ||
    PverName.ACX_HYBRID === getJwtTokenPayload().pver)

  const getIndexPath = () => {
    return isGuestManager
      ? `${getBasePath()}/v/${getJwtTokenPayload().tenantId}/users/guestsManager`
      : `${getBasePath()}/v/${getJwtTokenPayload().tenantId}`
  }

  useEffect(() => {
    if (data?.global) {
      const currentMapRegion = getMapRegion(data)
      updateGoogleMapRegion(currentMapRegion)
      setSkipQuery(true)
    }
  }, [data])

  useEffect(() => {
    if (isGuestManager && params['*'] !== 'guestsManager') {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}`
      })
    }
  }, [isGuestManager, params['*']])

  return (
    <LayoutComponent
      menuConfig={useMenuConfig()}
      content={
        <>
          <CloudMessageBanner />
          <Outlet />
        </>
      }
      leftHeaderContent={
        <UI.LeftHeaderWrapper>
          { showHomeButton && isBackToRC ?
            <a href={`/api/ui/v/${getJwtTokenPayload().tenantId}`}>
              <UI.Home>
                <LayoutUI.Icon children={<HomeSolid />} />
                {$t({ defaultMessage: 'Home' })}
              </UI.Home>
            </a> :
            <Link to={getIndexPath()}>
              <UI.Home>
                <LayoutUI.Icon children={<HomeSolid />} />
                {$t({ defaultMessage: 'Home' })}
              </UI.Home>
            </Link>
          }
          <RegionButton/>
          <HeaderContext.Provider value={{
            searchExpanded, licenseExpanded, setSearchExpanded, setLicenseExpanded }}>
            <LicenseBanner/>
          </HeaderContext.Provider>
        </UI.LeftHeaderWrapper>
      }

      rightHeaderContent={<>
        <HeaderContext.Provider value={{
          searchExpanded, licenseExpanded, setSearchExpanded, setLicenseExpanded }}>
          <SearchBar />
        </HeaderContext.Provider>
        <LayoutUI.Divider />
        {isDelegationMode()
          ? <MspEcDropdownList/>
          : <LayoutUI.CompanyName>{companyName}</LayoutUI.CompanyName>}
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
