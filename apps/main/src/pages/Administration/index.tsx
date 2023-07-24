import { useIntl } from 'react-intl'

import { Tabs, PageHeader }                         from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  useGetAdminListQuery,
  useGetDelegationsQuery,
  useGetNotificationRecipientsQuery
} from '@acx-ui/rc/services'
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
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

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
    pollingInterval: 30_000
  })
  const notificationList = useGetNotificationRecipientsQuery({
    params: { tenantId },
    payload: defaultPayload
  }, {
    pollingInterval: 30_000
  })
  const thirdPartyAdminList = useGetDelegationsQuery({ params })

  const adminCount = adminList?.data?.length! + thirdPartyAdminList.data?.length! || 0
  const notificationCount = notificationList?.data?.length || 0

  return (
    <Tabs
      defaultActiveKey='accountSettings'
      activeKey={activeTab}
      onChange={onTabChange}
    >
      <Tabs.TabPane tab={isNavbarEnhanced
        ? $t({ defaultMessage: 'Settings' })
        : $t({ defaultMessage: 'Account Settings' })
      }
      key='accountSettings' />
      { hasAdministratorTab &&
      ( <Tabs.TabPane
        tab={isNavbarEnhanced
          ? $t({ defaultMessage: 'Administrators ({adminCount})' }, { adminCount })
          : $t({ defaultMessage: 'Administrators' })
        }
        key='administrators' /> )
      }
      <Tabs.TabPane
        tab={isNavbarEnhanced
          ? $t({ defaultMessage: 'Notifications ({notificationCount})' }, { notificationCount })
          : $t({ defaultMessage: 'Notifications' })
        }
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
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

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
      title={isNavbarEnhanced
        ? $t({ defaultMessage: 'Account Management' })
        : $t({ defaultMessage: 'Administration' })
      }
      breadcrumb={[
        { text: $t({ defaultMessage: 'Administration' }) }
      ]}
      footer={<AdministrationTabs hasAdministratorTab={hasAdministratorTab} />}
    />
    { ActiveTabPane && <ActiveTabPane /> }
  </>)
}
