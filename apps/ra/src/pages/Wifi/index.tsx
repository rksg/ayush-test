import { useIntl } from 'react-intl'

import { PageHeader, Tabs, TimeRangeDropDown, TimeRangeDropDownProvider } from '@acx-ui/components'
import { useNavigate, useTenantLink }                                     from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType, usePageHeaderExtra }                 from '@acx-ui/reports/components'
import { DateRange }                                                      from '@acx-ui/utils'

import { APList } from './ApsTable'

export enum WifiTabsEnum {
  LIST = 'wifi',
  AP_REPORT = 'wifi/reports/aps',
  AIRTIME_REPORT = 'wifi/reports/airtime'
}

interface WifiTab {
  key: WifiTabsEnum,
  url?: string,
  title: string,
  component: JSX.Element,
  headerExtra: JSX.Element[]
}

const useTabs = () : WifiTab[] => {
  const { $t } = useIntl()
  const listTab = {
    key: WifiTabsEnum.LIST,
    component: <APList/>,
    title: $t({ defaultMessage: 'AP List' }),
    headerExtra: [<TimeRangeDropDown/>]
  }
  const apReportTab = {
    key: WifiTabsEnum.AP_REPORT,
    title: $t({ defaultMessage: 'AP Report' }),
    component: <EmbeddedReport
      reportName={ReportType.ACCESS_POINT}
      hideHeader={false}
    />,
    headerExtra: usePageHeaderExtra(ReportType.ACCESS_POINT, false)
  }
  const airtimeReportTab = {
    key: WifiTabsEnum.AIRTIME_REPORT,
    title: $t({ defaultMessage: 'Airtime Utilization Report' }),
    component: <EmbeddedReport
      reportName={ReportType.AIRTIME_UTILIZATION}
      hideHeader={false}
    />,
    headerExtra: usePageHeaderExtra(ReportType.AIRTIME_UTILIZATION, false)
  }
  return [listTab, apReportTab, airtimeReportTab]
}

export function WiFiPage ({ tab }: { tab: WifiTabsEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/')
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tabs.find(({ key }) => key === tab)?.url || tab}`
    })
  const tabs = useTabs()
  const { component, headerExtra } = tabs.find(({ key }) => key === tab)!
  return <TimeRangeDropDownProvider availableRanges={[
    DateRange.last24Hours,
    DateRange.last7Days,
    DateRange.last30Days
  ]}>
    <PageHeader
      title={$t({ defaultMessage: 'Access Points' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Wi-Fi' }) }]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
      }
      extra={headerExtra}
    />
    {component}
  </TimeRangeDropDownProvider>
}
