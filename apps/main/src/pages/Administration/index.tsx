import { useIntl } from 'react-intl'

import { useWebhooks } from '@acx-ui/analytics/components'
import { Tabs,
  PageHeader
} from '@acx-ui/components'
import { Features,
  useIsSplitOn,
  useIsTierAllowed,
  TierFeatures
} from '@acx-ui/feature-toggle'
import {
  useGetAdminListQuery,
  useGetDelegationsQuery,
  useGetNotificationRecipientsQuery,
  useGetWebhooksQuery
} from '@acx-ui/rc/services'
import {
  hasAdministratorTab,
  MigrationUrlsInfo,
  transformDisplayNumber,
  useTableQuery,
  Webhook
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }       from '@acx-ui/react-router-dom'
import { hasAllowedOperations, useUserProfileContext } from '@acx-ui/user'
import { getOpsApi }                                   from '@acx-ui/utils'

import AccountSettings   from './AccountSettings'
import Administrators    from './Administrators'
import FWVersionMgmt     from './FWVersionMgmt'
import LocalRadiusServer from './LocalRadiusServer'
import Notifications     from './Notifications'
import OnpremMigration   from './OnpremMigration'
import Privacy           from './Privacy'
import Subscriptions     from './Subscriptions'
import UserPrivileges    from './UserPrivileges'
import R1Webhooks        from './Webhooks'

const useTabs = ({ isAdministratorAccessible }: { isAdministratorAccessible: boolean }) => {
  const { $t } = useIntl()
  const params = useParams()
  const { tenantId, venueId, serialNumber } = params
  const isRadiusClientEnabled = useIsSplitOn(Features.RADIUS_CLIENT_CONFIG)
  const isGroupBasedLoginEnabled = useIsSplitOn(Features.GROUP_BASED_LOGIN_TOGGLE)
  const isRbacEarlyAccessEnable = useIsTierAllowed(TierFeatures.RBAC_IMPLICIT_P1)
  const isAbacToggleEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE) && isRbacEarlyAccessEnable
  const isWebhookToggleEnabled = useIsSplitOn(Features.WEBHOOK_TOGGLE)
  const isMspAppMonitoringEnabled = useIsSplitOn(Features.MSP_APP_MONITORING)
  const { title: webhookTitle, component: webhookComponent } = useWebhooks()

  const defaultPayload = {
    filters: venueId ? { venueId: [venueId] } :
      serialNumber ? { serialNumber: [serialNumber] } : {}
  }
  const adminList = useGetAdminListQuery({ params: { tenantId }, payload: defaultPayload }, {
    skip: !isAdministratorAccessible,
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
    { skip: !isAdministratorAccessible }
  )
  const webhookData = useTableQuery<Webhook>({
    useQuery: useGetWebhooksQuery,
    defaultPayload: {},
    option: { skip: !isWebhookToggleEnabled }
  })

  const adminCount = adminList?.data?.length! + thirdPartyAdminList.data?.length! || 0
  const notificationCount = notificationList?.data?.length || 0
  const webhookCount = transformDisplayNumber(webhookData?.data?.totalCount)

  return [
    {
      key: 'accountSettings',
      title: $t({ defaultMessage: 'Settings' }),
      component: <AccountSettings />
    },
    ...(isAdministratorAccessible
      ? isAbacToggleEnabled
        ? [{
          key: 'userPrivileges',
          title: $t({ defaultMessage: 'Users & Privileges' }),
          component: <UserPrivileges />
        }]
        : [{
          key: 'administrators',
          title: isGroupBasedLoginEnabled
            ? $t({ defaultMessage: 'Administrators' })
            : $t({ defaultMessage: 'Administrators ({adminCount})' }, { adminCount }),
          component: <Administrators />
        }]
      : []),
    ...(isMspAppMonitoringEnabled ? [
      {
        key: 'privacy',
        title: $t({ defaultMessage: 'Privacy' }),
        component: <Privacy />
      }
    ] : []),
    {
      key: 'notifications',
      title: $t({ defaultMessage: 'Notifications ({notificationCount})' }, { notificationCount }),
      component: <Notifications />
    },
    {
      key: 'subscriptions',
      title: $t({ defaultMessage: 'Subscriptions' }),
      component: <Subscriptions />
    },
    {
      key: 'fwVersionMgmt',
      title: $t({ defaultMessage: 'Version Management' }),
      component: <FWVersionMgmt />
    },
    isWebhookToggleEnabled
      ? {
        key: 'webhooks',
        title: $t({
          defaultMessage: 'Webhooks {webhookCount, select, null {} other {({webhookCount})}}',
          description: 'Translation string - Webhooks'
        }, { webhookCount }),
        component: <R1Webhooks/>
      }
      : {
        key: 'webhooks',
        title: webhookTitle,
        component: webhookComponent
      },
    ...(
      hasAllowedOperations([getOpsApi(MigrationUrlsInfo.getZdConfigurationList)])
        ? [{
          key: 'onpremMigration',
          title: $t({ defaultMessage: 'ZD Migration' }),
          component: <OnpremMigration />
        }] : []
    ),
    ...(isRadiusClientEnabled
      ? [{
        key: 'localRadiusServer',
        title: $t({ defaultMessage: 'Local RADIUS Server' }),
        component: <LocalRadiusServer />
      }]
      : [])
  ]
}

export default function Administration () {
  const { $t } = useIntl()
  const { tenantId, activeTab } = useParams()
  const { data: userProfileData, isCustomRole, rbacOpsApiEnabled } = useUserProfileContext()
  const isCustomRoleCheck = rbacOpsApiEnabled ? false : isCustomRole

  const basePath = useTenantLink('/administration')
  const navigate = useNavigate()

  const isAdministratorAccessible = hasAdministratorTab(userProfileData, tenantId)
  const customRoleTab = [
    {
      key: 'fwVersionMgmt',
      title: $t({ defaultMessage: 'Version Management' }),
      component: <FWVersionMgmt />
    }
  ]
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const tabs = isCustomRoleCheck ? customRoleTab : useTabs({ isAdministratorAccessible })
  if (isAdministratorAccessible === false && activeTab === 'administrators') {
    return <span>{ $t({ defaultMessage: 'Administrators is not allowed to access.' }) }</span>
  }

  const ActiveTabPane = tabs.find(({ key }) => key === activeTab)?.component
  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (<>
    <PageHeader
      title={$t({ defaultMessage: 'Account Management' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Administration' }) }
      ]}
      footer={tabs.length > 1 && <Tabs
        defaultActiveKey='accountSettings'
        activeKey={activeTab}
        onChange={onTabChange}
      >
        {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
      </Tabs>}
    />
    {ActiveTabPane}
  </>)
}
