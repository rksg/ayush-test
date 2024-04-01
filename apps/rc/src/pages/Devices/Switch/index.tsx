import { useIntl } from 'react-intl'

import { PageHeader, Tabs }                               from '@acx-ui/components'
import { useNavigate, useTenantLink }                     from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType, usePageHeaderExtra } from '@acx-ui/reports/components'
import { filterByAccess }                                 from '@acx-ui/user'

import useSwitchesTable from './SwitchesTable'

export enum SwitchTabsEnum {
  LIST = 'switch',
  WIRED_REPORT = 'switch/reports/wired'
}

interface SwitchTab {
  key: SwitchTabsEnum,
  url?: string,
  title: string,
  tabPane: JSX.Element,
  component: JSX.Element,
  headerExtra: JSX.Element[]
}

function isElementArray (data: JSX.Element | JSX.Element[]
): data is JSX.Element[] {
  return Array.isArray(data)
}

export function SwitchList ({ tab }: { tab: SwitchTabsEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const tabs = [{
    key: SwitchTabsEnum.LIST,
    tabPane: <Tabs.TabPane key={SwitchTabsEnum.LIST} tab={useSwitchesTable().title} />,
    ...useSwitchesTable()
  }, {
    key: SwitchTabsEnum.WIRED_REPORT,
    title: $t({ defaultMessage: 'Wired Report' }),
    tabPane: <Tabs.TabPane key={SwitchTabsEnum.WIRED_REPORT}
      tab={$t({ defaultMessage: 'Wired Report' })} />,
    component: <EmbeddedReport
      reportName={ReportType.WIRED}
      hideHeader={false}
    />,
    headerExtra: usePageHeaderExtra(ReportType.WIRED)
  }] as SwitchTab[]

  const { component, headerExtra } = tabs.find(({ key }) => key === tab)!

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tabs.find(({ key }) => key === tab)?.url || tab}`
    })

  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Switches' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Wired' }) }]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(tab=> tab.tabPane)}
        </Tabs>
      }
      extra={filterByAccess(isElementArray(headerExtra!) ? headerExtra : [headerExtra])}
    />
    {component}
  </>
}
