import { useIntl } from 'react-intl'

import { PageHeader, Tabs }           from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { OnboardedSystems } from '../OnboardedSystems'
import { Support }          from '../Support'
import { WebhooksTable }    from '../Webhooks'

export enum AccountManagementTabEnum {
  ONBOARDED_SYSTEMS = 'onboarded',
  USERS = 'users',
  LABELS = 'labels',
  SUPPORT = 'support',
  RESOURCE_GROUPS = 'resourceGroups',
  LICENSES = 'license',
  SCHEDULES = 'schedules',
  WEBHOOKS = 'webhooks'
}

interface Tab {
  key: AccountManagementTabEnum,
  title: string | JSX.Element,
  component?: JSX.Element,
  url?: string,
  headerExtra?: JSX.Element[]
}

const useTabs = () : Tab[] => {
  const { $t } = useIntl()
  const isNewUserRolesEnabled = useIsSplitOn(Features.RUCKUS_AI_NEW_ROLES_TOGGLE)
  const onboardedSystemsTab = {
    key: AccountManagementTabEnum.ONBOARDED_SYSTEMS,
    title: $t({ defaultMessage: 'Onboarded Systems' }),
    component: <OnboardedSystems />
  }
  const usersTab = {
    key: AccountManagementTabEnum.USERS,
    title: $t({ defaultMessage: 'Users' }),
    url: isNewUserRolesEnabled ? undefined : '/analytics/admin/users'
  }
  const labelsTab = {
    key: AccountManagementTabEnum.LABELS,
    title: $t({ defaultMessage: 'Labels' }),
    url: '/analytics/admin/labels'
  }
  const resourceGroupsTab = {
    key: AccountManagementTabEnum.RESOURCE_GROUPS,
    title: $t({ defaultMessage: 'Resource Groups' }),
    url: '/analytics/admin/resourceGroups'
  }
  const supportTab = {
    key: AccountManagementTabEnum.SUPPORT,
    title: $t({ defaultMessage: 'Support' }),
    component: <Support />
  }
  const licenseTab = {
    key: AccountManagementTabEnum.LICENSES,
    title: $t({ defaultMessage: 'Licenses' }),
    url: '/analytics/admin/license'
  }
  const schedulesTab = {
    key: AccountManagementTabEnum.SCHEDULES,
    title: $t({ defaultMessage: 'Schedules' }),
    url: '/analytics/admin/schedules'
  }
  const webhooksTab = {
    key: AccountManagementTabEnum.WEBHOOKS,
    title: $t({ defaultMessage: 'Webhooks' }),
    component: <WebhooksTable />
  }
  return [
    onboardedSystemsTab, usersTab, labelsTab, resourceGroupsTab, supportTab,
    licenseTab, schedulesTab, webhooksTab
  ]
}

export function AccountManagement ({ tab }:{ tab: AccountManagementTabEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics')
  const onTabChange = (tabKey: string) => {
    const tab = tabs.find(({ key }) => key === tabKey)
    if (tab?.url) {
      window.open(tab.url, '_blank')
      return
    }
    tab && navigate({
      ...basePath,
      pathname: `${basePath.pathname}/admin/${tab.key}`
    })
  }
  const tabs = useTabs()
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Account Management' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Administration' }) }]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
      }
      extra={tabs.find(({ key }) => key === tab)?.headerExtra}
    />
    {TabComp}
  </>
}
