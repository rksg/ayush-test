import { useIntl } from 'react-intl'

import { useHeaderExtra }                                                 from '@acx-ui/analytics/components'
import { PageHeader, Tabs, TimeRangeDropDown, TimeRangeDropDownProvider } from '@acx-ui/components'
import { useNavigate, useTenantLink }                                     from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType }                                     from '@acx-ui/reports/components'
import { DateRange }                                                      from '@acx-ui/utils'

import { SwitchList } from './SwitchList'

export enum AISwitchTabsEnum {
  SWITCH_LIST = 'switch',
  WIRED_REPORT = 'switch/reports/wired'
}

interface SwitchTab {
  key: AISwitchTabsEnum,
  url?: string,
  title: string,
  component: JSX.Element,
  headerExtra: JSX.Element[]
}

const useTabs = () : SwitchTab[] => {
  const { $t } = useIntl()
  const switchListTab = {
    key: AISwitchTabsEnum.SWITCH_LIST,
    title: $t({ defaultMessage: 'Switch List' }),
    component: <SwitchList />,
    headerExtra: [<TimeRangeDropDown/>]
  }
  const wiredReportTab = {
    key: AISwitchTabsEnum.WIRED_REPORT,
    title: $t({ defaultMessage: 'Wired Report' }),
    component: <EmbeddedReport
      reportName={ReportType.WIRED}
      hideHeader={false}
    />,
    headerExtra: useHeaderExtra({ excludeNetworkFilter: true })
  }
  return [switchListTab, wiredReportTab]
}

export function AISwitches ({ tab }: { tab: AISwitchTabsEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/')
  const tabs = useTabs()
  const TabComp = tabs.find(({ key }) => key === tab)?.component

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tabs.find(({ key }) => key === tab)?.url || tab}`
    })

  return <TimeRangeDropDownProvider availableRanges={[
    DateRange.last24Hours,
    DateRange.last7Days,
    DateRange.last30Days
  ]}>
    <PageHeader
      title={$t({ defaultMessage: 'Switches' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Wired' }) }]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
      }
      extra={tabs.find(({ key }) => key === tab)?.headerExtra}
    />
    {TabComp}
  </TimeRangeDropDownProvider>
}

export default AISwitches
