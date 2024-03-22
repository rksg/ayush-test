import { useIntl } from 'react-intl'

import { PageHeader, Tabs }           from '@acx-ui/components'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { Support }          from '../Support'
import { OnboardedSystems } from '../ＯnboardedSystems'

import { TabNewTabLink, TabTenantLink } from './styledComponents'

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
  url?: string,
  title: string | JSX.Element,
  component?: JSX.Element,
  headerExtra?: JSX.Element[]
}

const useTabs = () : Tab[] => {
  const { $t } = useIntl()
  const onboardedSystemsTab = {
    key: AccountManagementTabEnum.ONBOARDED_SYSTEMS,
    title: $t({ defaultMessage: 'Onboarded Systems' }),
    component: <OnboardedSystems />
  }
  const usersTab = {
    key: AccountManagementTabEnum.USERS,
    title: <TabTenantLink to={'/admin/users'}> {$t({ defaultMessage: 'Users' })}</TabTenantLink>
  }
  const labelsTab = {
    key: AccountManagementTabEnum.LABELS,
    title: <TabNewTabLink to={'/analytics/admin/labels'}>
      {$t({ defaultMessage: 'Labels' })}</TabNewTabLink>
  }
  const resourceGroupsTab = {
    key: AccountManagementTabEnum.RESOURCE_GROUPS,
    title: <TabNewTabLink to={'/analytics/admin/resourceGroups'}>
      {$t({ defaultMessage: 'Resource Groups' })}</TabNewTabLink>
  }
  const supportTab = {
    key: AccountManagementTabEnum.SUPPORT,
    title: $t({ defaultMessage: 'Support' }),
    component: <Support/>
  }
  const licenseTab = {
    key: AccountManagementTabEnum.LICENSES,
    title: <TabNewTabLink to={'/analytics/admin/license'}>
      {$t({ defaultMessage: 'Licenses' })}</TabNewTabLink>
  }
  const schedulesTab = {
    key: AccountManagementTabEnum.SCHEDULES,
    title: <TabNewTabLink to={'/analytics/admin/schedules'}>
      {$t({ defaultMessage: 'Schedules' })}</TabNewTabLink>
  }
  const webhooksTab = {
    key: AccountManagementTabEnum.WEBHOOKS,
    title: <TabNewTabLink to={'/analytics/admin/webhooks'}>
      {$t({ defaultMessage: 'Webhooks' })}</TabNewTabLink>
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
    tab?.component && navigate({
      ...basePath,
      pathname: `${basePath.pathname}/admin/${tab?.url || tab.key}`
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
