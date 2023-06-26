import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import { IncidentTabContent, useHeaderExtra } from '@acx-ui/analytics/components'
import { PageHeader, Tabs, Button, Dropdown } from '@acx-ui/components'
import { useIsSplitOn, Features }             from '@acx-ui/feature-toggle'
import { ClockOutlined }                      from '@acx-ui/icons'
import { useNavigate, useTenantLink }         from '@acx-ui/react-router-dom'
import { filterByAccess }                     from '@acx-ui/user'

import { ConfigChange } from '../ConfigChange'

export enum AIAnalyticsTabEnum {
  INCIDENTS = 'incidents',
  CONFIG_CHANGE = 'configChange'
}

interface Tab {
  key: AIAnalyticsTabEnum,
  title: string,
  component: JSX.Element,
  headerExtra?: JSX.Element[]
}

const useTabs = () : Tab[] => {
  const { $t } = useIntl()
  const incidentsTab = {
    key: AIAnalyticsTabEnum.INCIDENTS,
    title: $t({ defaultMessage: 'Incidents' }),
    component: <IncidentTabContent/>,
    headerExtra: useHeaderExtra({ shouldQuerySwitch: true, withIncidents: true })
  }
  const menuMap = {
    last7Days: 'Last 24 Hours',
    last30Days: 'Last 30 Days'
  }
  const menu = <Menu
    selectable
    defaultSelectedKeys={['last7Days']}
    items={[
      { key: 'last7Days', label: 'Last 24 Hours' },
      { key: 'last30Days', label: 'Last 30 Days' }
    ]}
  />
  const configChangeTab = {
    key: AIAnalyticsTabEnum.CONFIG_CHANGE,
    title: $t({ defaultMessage: 'Config Change' }),
    component: <ConfigChange/>,
    headerExtra: [
      useHeaderExtra({ shouldQuerySwitch: true, withIncidents: false })[0],
      <Dropdown overlay={menu}>{(selectedKeys) => {
        const key = selectedKeys || ''
        return <Button icon={<ClockOutlined />}>
          {menuMap[key as keyof typeof menuMap]}
        </Button>
      }}</Dropdown>
    ]
  }
  return [
    incidentsTab,
    ...(useIsSplitOn(Features.CONFIG_CHANGE) ? [configChangeTab] : [])
  ]
}

export function AIAnalytics ({ tab }:{ tab: AIAnalyticsTabEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics')
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  const tabs = useTabs()
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'AI Analytics' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'AI Assurance' }) }]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
      }
      extra={filterByAccess(tabs.find(({ key }) => key === tab)?.headerExtra)}
    />
    {TabComp}
  </>
}
