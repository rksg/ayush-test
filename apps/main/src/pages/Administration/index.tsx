import { useIntl } from 'react-intl'

import { Tabs, PageHeader }                      from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { useUserProfileContext }                 from '@acx-ui/user'

import AccountSettings   from './AccountSettings'
import Administrators    from './Administrators'
import FWVersionMgmt     from './FWVersionMgmt'
import LocalRadiusServer from './LocalRadiusServer'
import Notifications     from './Notifications'
import Subscriptions     from './Subscriptions'


const AdministrationTabs = ({ hasAdministratorTab }: { hasAdministratorTab: boolean }) => {
  const { $t } = useIntl()
  const { activeTab } = useParams()
  const basePath = useTenantLink('/administration')
  const navigate = useNavigate()
  const isRadiusClientEnabled = useIsSplitOn(Features.RADIUS_CLIENT_CONFIG)

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <Tabs
      defaultActiveKey='accountSettings'
      activeKey={activeTab}
      onChange={onTabChange}
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Account Settings' })} key='accountSettings' />
      { hasAdministratorTab &&
      ( <Tabs.TabPane tab={$t({ defaultMessage: 'Administrators' })} key='administrators' /> )
      }
      <Tabs.TabPane tab={$t({ defaultMessage: 'Notifications' })} key='notifications' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Subscriptions' })} key='subscriptions' />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Firmware Version Management' })}
        key='fwVersionMgmt'
      />
      { isRadiusClientEnabled &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'Local RADIUS Server' })} key='localRadiusServer' />
      }
    </Tabs>
  )
}

const tabPanes = {
  accountSettings: AccountSettings,
  administrators: Administrators,
  notifications: Notifications,
  subscriptions: Subscriptions,
  fwVersionMgmt: FWVersionMgmt,
  localRadiusServer: LocalRadiusServer
}

export default function Administration () {
  const { $t } = useIntl()
  const { tenantId, activeTab } = useParams()
  const isEdgeEarlyBetaEnabled = useIsSplitOn(Features.EDGE_EARLY_BETA)
  const isEnable = useIsSplitOn(Features.UNRELEASED) || isEdgeEarlyBetaEnabled
  const { data: userProfileData } = useUserProfileContext()

  if (!isEnable) {
    return <span>{ $t({ defaultMessage: 'Administration is not enabled' }) }</span>
  }

  // support dashboard - his own account
  let isSupport: boolean = false
  if (userProfileData?.dogfood) {
    // eslint-disable-next-line max-len
    isSupport = userProfileData?.varTenantId !== undefined && userProfileData?.varTenantId === tenantId
  }

  const hasAdministratorTab = !userProfileData?.delegatedDogfood && !isSupport
  if (hasAdministratorTab === false && activeTab === 'administrators') {
    return <span>{ $t({ defaultMessage: 'Administrators is not allowed to access.' }) }</span>
  }

  const ActiveTabPane = tabPanes[activeTab as keyof typeof tabPanes]

  return (<>
    <PageHeader
      title={$t({ defaultMessage: 'Administration' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Administration' }), link: '/administration' }
      ]}
      footer={<AdministrationTabs hasAdministratorTab={hasAdministratorTab} />}
    />
    { ActiveTabPane && <ActiveTabPane /> }
  </>)
}
