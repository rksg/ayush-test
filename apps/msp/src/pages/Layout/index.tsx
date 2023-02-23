import { useEffect, useState } from 'react'

import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import {
  Layout as LayoutComponent,
  LayoutUI,
  Dropdown
} from '@acx-ui/components'
import {
  WorldSolid,
  ArrowExpand
} from '@acx-ui/icons'
import {
  ActivityButton,
  AlarmsButton,
  FetchBot,
  HelpButton,
  UserButton,
  LicenseBanner,
  HeaderContext
} from '@acx-ui/main/components'
import {
  CloudMessageBanner,
  useUserProfileContext
} from '@acx-ui/rc/components'
import {
  useGetTenantDetailQuery
} from '@acx-ui/rc/services'
import { Outlet, TenantLink, useParams } from '@acx-ui/react-router-dom'

import { useMenuConfig }     from './menuConfig'
import { LeftHeaderWrapper } from './styledComponents'

function Layout () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [tenantType, setTenantType] = useState('')
  const [supportStatus,setSupportStatus] = useState('')

  const { data } = useGetTenantDetailQuery({ params: { tenantId } })
  const { data: userProfile } = useUserProfileContext()
  const companyName = userProfile?.companyName
  const [licenseExpanded, setLicenseExpanded] = useState<boolean>(false)

  useEffect(() => {
    if (data && userProfile) {
      if (userProfile?.support) {
        setTenantType('SUPPORT')
      } else {
        setTenantType(data.tenantType)
      }
    }
  }, [data, userProfile])


  const regionMenu = <Menu
    selectable
    defaultSelectedKeys={['US']}
    items={[
      { key: 'US', label: <TenantLink to='TODO'>{$t({ defaultMessage: 'US' })}</TenantLink> },
      { key: 'EU', label: <TenantLink to='TODO'>{$t({ defaultMessage: 'EU' })}</TenantLink> },
      { key: 'Asia', label: <TenantLink to='TODO'>{$t({ defaultMessage: 'ASIA' })}</TenantLink> }
    ]}
  />
  return (
    <LayoutComponent
      menuConfig={useMenuConfig(tenantType)}
      content={
        <>
          <CloudMessageBanner />
          <Outlet />
        </>
      }
      leftHeaderContent={<LeftHeaderWrapper>
        <Dropdown overlay={regionMenu}>{(selectedKeys) =>
          <LayoutUI.DropdownText>
            <LayoutUI.Icon children={<WorldSolid />} />
            {selectedKeys}
            <LayoutUI.Icon children={<ArrowExpand />} />
          </LayoutUI.DropdownText>
        }</Dropdown>
        <HeaderContext.Provider value={{ licenseExpanded, setLicenseExpanded }}>
          <LicenseBanner isMSPUser={true}/>
        </HeaderContext.Provider>
      </LeftHeaderWrapper>
      }
      rightHeaderContent={<>
        <LayoutUI.CompanyName>{companyName}</LayoutUI.CompanyName>
        <AlarmsButton/>
        <ActivityButton/>
        <FetchBot showFloatingButton={false} statusCallback={setSupportStatus}/>
        <HelpButton supportStatus={supportStatus}/>
        <UserButton/>
      </>}
    />
  )
}
export default Layout
