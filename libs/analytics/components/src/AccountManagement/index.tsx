import { createContext } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader, Tabs }           from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { DevelopersTab }       from '../Developers'
import { useWebhooks }         from '../Developers/Webhooks'
import { useOnboardedSystems } from '../OnboardedSystems'
import { Support }             from '../Support'
import { useUsers }            from '../Users'

export enum AccountManagementTabEnum {
  ONBOARDED_SYSTEMS = 'onboarded',
  USERS = 'users',
  LABELS = 'labels',
  SUPPORT = 'support',
  RESOURCE_GROUPS = 'resourceGroups',
  LICENSES = 'license',
  SCHEDULES = 'schedules',
  WEBHOOKS = 'webhooks',
  APPLICATION_TOKENS = 'applicationTokens',
  DEVELOPERS = 'developers/applicationTokens'
}

interface Tab {
  key: AccountManagementTabEnum,
  title: string | JSX.Element,
  component?: JSX.Element,
  url?: string,
  headerExtra?: JSX.Element[]
}

interface CountContextType {
  usersCount: number,
  setUsersCount: (count: number) => void
}
export const CountContext = createContext({} as CountContextType)

const useTabs = (): Tab[] => {
  const { $t } = useIntl()

  const onboardedSystemsTab = {
    key: AccountManagementTabEnum.ONBOARDED_SYSTEMS,
    ...useOnboardedSystems()
  }
  const usersTab = {
    key: AccountManagementTabEnum.USERS,
    ...useUsers()
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
  const developersTab = {
    key: AccountManagementTabEnum.DEVELOPERS,
    title: $t({ defaultMessage: 'Developers' }),
    component: <DevelopersTab />
  }
  const webhooksTab = {
    key: AccountManagementTabEnum.WEBHOOKS,
    ...useWebhooks()
  }
  const isJwtEnabled = useIsSplitOn(Features.RUCKUS_AI_JWT_TOGGLE)

  return [
    onboardedSystemsTab, usersTab, labelsTab, resourceGroupsTab, supportTab,
    licenseTab, schedulesTab, isJwtEnabled ? developersTab : webhooksTab
  ]
}

export function AccountManagement ({ tab }:{ tab: AccountManagementTabEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics')
  const tabs = useTabs()
  const onTabClick = (tabKey: string) => {
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
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Account Management' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Administration' }) }]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onTabClick={onTabClick}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
      }
      extra={tabs.find(({ key }) => key === tab)?.headerExtra}
    />
    {TabComp}
  </>
}
