import { useIntl } from 'react-intl'

import { PageHeader, Tabs }                                   from '@acx-ui/components'
import { NewTabLink, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { Support } from '../Support'

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
    title: <NewTabLink to={'/analytics/admin/onboarded'}>
      {$t({ defaultMessage: 'Onboarded Systems' })}</NewTabLink>
  }
  const usersTab = {
    key: AccountManagementTabEnum.USERS,
    title: <TenantLink to={'/admin/users'}> {$t({ defaultMessage: 'Users' })}</TenantLink>
  }
  const labelsTab = {
    key: AccountManagementTabEnum.LABELS,
    title: <NewTabLink to={'/analytics/admin/labels'}>
      {$t({ defaultMessage: 'Labels' })}</NewTabLink>
  }
  const resourceGroupsTab = {
    key: AccountManagementTabEnum.RESOURCE_GROUPS,
    title: <NewTabLink to={'/analytics/admin/resourceGroups'}>
      {$t({ defaultMessage: 'Resource Groups' })}</NewTabLink>
  }
  const supportTab = {
    key: AccountManagementTabEnum.SUPPORT,
    title: $t({ defaultMessage: 'Support' }),
    component: <Support/>
  }
  const licenseTab = {
    key: AccountManagementTabEnum.LICENSES,
    title: <NewTabLink to={'/analytics/admin/license'}>
      {$t({ defaultMessage: 'Licenses' })}</NewTabLink>
  }
  const schedulesTab = {
    key: AccountManagementTabEnum.SCHEDULES,
    title: <NewTabLink to={'/analytics/admin/schedules'}>
      {$t({ defaultMessage: 'Schedules' })}</NewTabLink>
  }
  const webhooksTab = {
    key: AccountManagementTabEnum.WEBHOOKS,
    title: <NewTabLink to={'/analytics/admin/webhooks'}>
      {$t({ defaultMessage: 'Webhooks' })}</NewTabLink>
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
      pathname: `${basePath.pathname}/admin/${tab?.url || tab}`
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
