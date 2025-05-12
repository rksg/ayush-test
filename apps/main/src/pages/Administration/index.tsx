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
import { MspRbacUrlsInfo } from '@acx-ui/msp/utils'
import {
  AdministrationUrlsInfo,
  AdminRbacUrlsInfo,
  LicenseUrlsInfo,
  hasAdministratorTab,
  MigrationUrlsInfo
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                   from '@acx-ui/react-router-dom'
import { getUserProfile, hasAllowedOperations, isCoreTier, useUserProfileContext } from '@acx-ui/user'
import { getOpsApi }                                                               from '@acx-ui/utils'

import AccountSettings                                                                      from './AccountSettings'
import Administrators                                                                       from './Administrators'
import FWVersionMgmt                                                                        from './FWVersionMgmt'
import LocalRadiusServer                                                                    from './LocalRadiusServer'
import Notifications                                                                        from './Notifications'
import OnpremMigration                                                                      from './OnpremMigration'
import Privacy                                                                              from './Privacy'
import Subscriptions                                                                        from './Subscriptions'
import { AdminsTabTitleWithCount, NotificationTabTitleWithCount, WebhookTabTitleWithCount } from './TabTitleWithCount'
import UserPrivileges                                                                       from './UserPrivileges'
import R1Webhooks                                                                           from './Webhooks'

const useTabs = ({ isAdministratorAccessible }: { isAdministratorAccessible: boolean }) => {
  const { $t } = useIntl()
  const { accountTier } = getUserProfile()

  const isCore = isCoreTier(accountTier)
  const isRadiusClientEnabled = useIsSplitOn(Features.RADIUS_CLIENT_CONFIG)
  const isGroupBasedLoginEnabled = useIsSplitOn(Features.GROUP_BASED_LOGIN_TOGGLE)
  const isRbacEarlyAccessEnable = useIsTierAllowed(TierFeatures.RBAC_IMPLICIT_P1)
  const isAbacToggleEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE) && isRbacEarlyAccessEnable
  const isWebhookToggleEnabled = useIsSplitOn(Features.WEBHOOK_TOGGLE)
  const isMspAppMonitoringEnabled = useIsSplitOn(Features.MSP_APP_MONITORING)
  const { title: webhookTitle, component: webhookComponent } = useWebhooks()

  return [
    ...(
      hasAllowedOperations([getOpsApi(AdministrationUrlsInfo.getTenantDetails)])
        ? [{
          key: 'accountSettings',
          title: $t({ defaultMessage: 'Settings' }),
          component: <AccountSettings />
        }] : []),
    ...(isAdministratorAccessible && hasAllowedOperations([
      getOpsApi(AdministrationUrlsInfo.getAdministrators),
      getOpsApi(AdministrationUrlsInfo.getDelegations),
      getOpsApi(AdminRbacUrlsInfo.getPrivilegeGroups),
      getOpsApi(AdministrationUrlsInfo.getCustomRoles)
    ]) ? isAbacToggleEnabled
        ? [{
          key: 'userPrivileges',
          title: $t({ defaultMessage: 'Users & Privileges' }),
          component: <UserPrivileges />
        }]
        : [{
          key: 'administrators',
          title: isGroupBasedLoginEnabled
            ? $t({ defaultMessage: 'Administrators' })
            : <AdminsTabTitleWithCount />,
          component: <Administrators />
        }]
      : []),
    ...(isMspAppMonitoringEnabled && !isCore &&
      hasAllowedOperations([getOpsApi(AdministrationUrlsInfo.getPrivacySettings)])
      ? [
        {
          key: 'privacy',
          title: $t({ defaultMessage: 'Privacy' }),
          component: <Privacy />
        }
      ] : []),
    ...(hasAllowedOperations([ getOpsApi(AdministrationUrlsInfo.getNotificationRecipients)]) ? [{
      key: 'notifications',
      title: <NotificationTabTitleWithCount />,
      component: <Notifications />
    }] : []),
    ...(hasAllowedOperations([
      getOpsApi(LicenseUrlsInfo.getMspEntitlement),
      getOpsApi(AdministrationUrlsInfo.getEntitlementsActivations),
      getOpsApi(MspRbacUrlsInfo.getEntitlementsCompliances)
    ]) ? [{
        key: 'subscriptions',
        title: $t({ defaultMessage: 'Subscriptions' }),
        component: <Subscriptions />
      }]: []),
    {
      key: 'fwVersionMgmt',
      title: $t({ defaultMessage: 'Version Management' }),
      component: <FWVersionMgmt />
    },
    ...(hasAllowedOperations([getOpsApi(AdministrationUrlsInfo.getWebhooks)])
      ? [
        isWebhookToggleEnabled
          ? {
            key: 'webhooks',
            title: <WebhookTabTitleWithCount />,
            component: <R1Webhooks/>
          }
          : {
            key: 'webhooks',
            title: webhookTitle,
            component: webhookComponent
          }]: []) ,
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
