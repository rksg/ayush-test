
import { useIntl } from 'react-intl'

import { PageHeader, Tabs, TimeRangeDropDown, TimeRangeDropDownProvider } from '@acx-ui/components'
import { useNavigate, useTenantLink }                                     from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType, usePageHeaderExtra }                 from '@acx-ui/reports/components'
import { DateRange }                                                      from '@acx-ui/utils'

import { NetworkList } from './NetworksTable'

export enum NetworkTabsEnum {
  LIST = 'wireless',
  WLANS_REPORT = 'wireless/reports/wlans',
  APPLICATIONS_REPORT = 'wireless/reports/applications',
  WIRELESS_REPORT = 'wireless/reports/wireless'
}

interface WifiNetworksTab {
  key: NetworkTabsEnum,
  url?: string,
  title: string,
  component: JSX.Element,
  headerExtra: JSX.Element[]
}

const useTabs = () : WifiNetworksTab[] => {
  const { $t } = useIntl()
  const listTab = {
    key: NetworkTabsEnum.LIST,
    component: <NetworkList/>,
    title: $t({ defaultMessage: 'Network List' }),
    headerExtra: [<TimeRangeDropDown/>]
  }
  const wlanReportTab = {
    key: NetworkTabsEnum.WLANS_REPORT,
    title: $t({ defaultMessage: 'WLANS Report' }),
    component: <EmbeddedReport
      reportName={ReportType.WLAN}
      hideHeader={false}
    />,
    headerExtra: usePageHeaderExtra(ReportType.WLAN)
  }
  const applicationReportTab = {
    key: NetworkTabsEnum.APPLICATIONS_REPORT,
    title: $t({ defaultMessage: 'Applications Report' }),
    component: <EmbeddedReport
      reportName={ReportType.APPLICATION}
      hideHeader={false}
    />,
    headerExtra: usePageHeaderExtra(ReportType.APPLICATION)
  }
  const wirelessReportTab = {
    key: NetworkTabsEnum.WIRELESS_REPORT,
    title: $t({ defaultMessage: 'Wireless Report' }),
    component: <EmbeddedReport
      reportName={ReportType.WIRELESS}
      hideHeader={false}
    />,
    headerExtra: usePageHeaderExtra(ReportType.WIRELESS)
  }
  return [listTab, wlanReportTab, applicationReportTab, wirelessReportTab]
}

export function WiFiNetworksPage ({ tab }: { tab: NetworkTabsEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/networks')
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
      title={$t({ defaultMessage: 'Wi-Fi Networks' })}
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
