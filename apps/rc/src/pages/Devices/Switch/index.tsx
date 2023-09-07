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
  component: JSX.Element,
  headerExtra: JSX.Element[]
}

function isElementArray (data: JSX.Element | JSX.Element[]
): data is JSX.Element[] {
  return Array.isArray(data)
}

const useTabs = () : SwitchTab[] => {
  const { $t } = useIntl()
  const listTab = {
    key: SwitchTabsEnum.LIST,
    ...useSwitchesTable()
  }
  const wiredReportTab = {
    key: SwitchTabsEnum.WIRED_REPORT,
    title: $t({ defaultMessage: 'Wired Report' }),
    component: <EmbeddedReport
      reportName={ReportType.WIRED}
      hideHeader={false}
    />,
    headerExtra: usePageHeaderExtra(ReportType.WIRED)
  }
  return [listTab, wiredReportTab]
}

export function SwitchList ({ tab }: { tab: SwitchTabsEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tabs.find(({ key }) => key === tab)?.url || tab}`
    })
  const tabs = useTabs()
  const { component, headerExtra } = tabs.find(({ key }) => key === tab)!
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Switches' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Wired' }) }]}
      footer={
        tabs.length > 1 && <Tabs type='first' activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
      }
      extra={filterByAccess(isElementArray(headerExtra!) ? headerExtra : [headerExtra])}
    />
    {component}
  </>
}
