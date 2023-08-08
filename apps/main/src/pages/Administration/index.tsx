import { useIntl } from 'react-intl'

import { Tabs, PageHeader }                         from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  useGetAdminListQuery,
  useGetDelegationsQuery,
  useGetNotificationRecipientsQuery
} from '@acx-ui/rc/services'
import { hasAdministratorTab }                   from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { useUserProfileContext }                 from '@acx-ui/user'

import AccountSettings   from './AccountSettings'
import Administrators    from './Administrators'
import FWVersionMgmt     from './FWVersionMgmt'
import LocalRadiusServer from './LocalRadiusServer'
import Notifications     from './Notifications'
import OnpremMigration   from './OnpremMigration'
import Subscriptions     from './Subscriptions'

const AdministrationTabs = ({ hasAdministratorTab }: { hasAdministratorTab: boolean }) => {
  const { $t } = useIntl()
  const params = useParams()
  const { activeTab, tenantId, venueId, serialNumber } = params
  const basePath = useTenantLink('/administration')
  const navigate = useNavigate()
  const isRadiusClientEnabled = useIsSplitOn(Features.RADIUS_CLIENT_CONFIG)
  const isCloudMoteEnabled = useIsTierAllowed(Features.CLOUDMOTE_BETA)

  const defaultPayload = {
    filters: venueId ? { venueId: [venueId] } :
      serialNumber ? { serialNumber: [serialNumber] } : {}
  }
  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }
  const adminList = useGetAdminListQuery({ params: { tenantId }, payload: defaultPayload }, {
    skip: !hasAdministratorTab,
    pollingInterval: 30_000
  })
  const notificationList = useGetNotificationRecipientsQuery({
    params: { tenantId },
    payload: defaultPayload
  }, {
    pollingInterval: 30_000
  })
  const thirdPartyAdminList = useGetDelegationsQuery(
    { params },
    { skip: !hasAdministratorTab }
  )

  const adminCount = adminList?.data?.length! + thirdPartyAdminList.data?.length! || 0
  const notificationCount = notificationList?.data?.length || 0

  return (
    <Tabs
      defaultActiveKey='accountSettings'
      activeKey={activeTab}
      onChange={onTabChange}
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Settings' })} key='accountSettings' />
      { hasAdministratorTab &&
      ( <Tabs.TabPane
        tab={$t({ defaultMessage: 'Administrators ({adminCount})' }, { adminCount })}
        key='administrators' /> )
      }
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Notifications ({notificationCount})' }, { notificationCount })}
        key='notifications'
      />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Subscriptions' })} key='subscriptions' />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Version Management' })}
        key='fwVersionMgmt'
      />
      { isCloudMoteEnabled &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'ZD Migration' })} key='onpremMigration' />
      }
      { isRadiusClientEnabled &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'Local RADIUS Server' })} key='localRadiusServer' />
      }
    </Tabs>
  )
}

const tabPanes = {
  accountSettings: AccountSettings,
  administrators: Administrators,
  onpremMigration: OnpremMigration,
  notifications: Notifications,
  subscriptions: Subscriptions,
  fwVersionMgmt: FWVersionMgmt,
  localRadiusServer: LocalRadiusServer
}

export default function Administration () {
  const { $t } = useIntl()
  const { tenantId, activeTab } = useParams()
  const { data: userProfileData } = useUserProfileContext()

  const isAdministratorAccessible = hasAdministratorTab(userProfileData, tenantId)
  if (isAdministratorAccessible === false && activeTab === 'administrators') {
    return <span>{ $t({ defaultMessage: 'Administrators is not allowed to access.' }) }</span>
  }

  const ActiveTabPane = tabPanes[activeTab as keyof typeof tabPanes]

  return (<>
    <PageHeader
      title={$t({ defaultMessage: 'Account Management' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Administration' }) }
      ]}
      footer={<AdministrationTabs hasAdministratorTab={isAdministratorAccessible} />}
    />
    { ActiveTabPane && <ActiveTabPane /> }
  </>)
}
