import { useIntl } from 'react-intl'

import { PageHeader, Tabs }             from '@acx-ui/components'
import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import { useNavigate, useTenantLink }   from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportHeader } from '@acx-ui/reports/components'
import { ReportType }                   from '@acx-ui/reports/components'
import { filterByAccess }               from '@acx-ui/user'

import useNetworksTable from './NetworksTable'

export enum NetworkTabsEnum {
  LIST = 'wireless',
  WLAN_REPORT = 'wireless/reports/wlans',
  APPLICATIONS_REPORT = 'wireless/reports/applications',
  WIRELESS_REPORT = 'wireless/reports/wireless'
}

interface NetworkTab {
  key: NetworkTabsEnum,
  url?: string,
  title: string,
  component: JSX.Element,
  headerExtra?: JSX.Element[]
}

const useTabs = () : NetworkTab[] => {
  const { $t } = useIntl()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const listTab = {
    key: NetworkTabsEnum.LIST,
    ...useNetworksTable()
  }
  const wlanReportTab = {
    key: NetworkTabsEnum.WLAN_REPORT,
    title: $t({ defaultMessage: 'WLAN Report' }),
    component: <EmbeddedReport
      reportName={ReportType.WLAN}
      hideHeader={false}
    />,
    headerExtra: [
      <ReportHeader
        type={ReportType.WLAN}
        showFilter={true}
      />
    ]
  }
  const applicationsReportTab = {
    key: NetworkTabsEnum.APPLICATIONS_REPORT,
    title: $t({ defaultMessage: 'Applications Report' }),
    component: <EmbeddedReport
      reportName={ReportType.APPLICATION}
      hideHeader={false}
    />,
    headerExtra: [
      <ReportHeader
        type={ReportType.APPLICATION}
        showFilter={true}
      />
    ]
  }
  const wirelessReportTab = {
    key: NetworkTabsEnum.WIRELESS_REPORT,
    title: $t({ defaultMessage: 'Wireless Report' }),
    component: <EmbeddedReport
      reportName={ReportType.WIRELESS}
      hideHeader={false}
    />,
    headerExtra: [
      <ReportHeader
        type={ReportType.WIRELESS}
        showFilter={true}
      />
    ]
  }
  return [
    listTab,
    ...(isNavbarEnhanced ? [wlanReportTab] : []),
    ...(isNavbarEnhanced ? [applicationsReportTab] : []),
    ...(isNavbarEnhanced ? [wirelessReportTab] : [])
  ]
}

export function NetworksList ({ tab }: { tab: NetworkTabsEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const basePath = useTenantLink('/networks/')
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tabs.find(({ key }) => key === tab)?.url || tab}`
    })
  const tabs = useTabs()
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  return <>
    <PageHeader
      title={isNavbarEnhanced
        ? $t({ defaultMessage: 'Wi-Fi Networks' })
        : $t({ defaultMessage: 'Networks' })
      }
      breadcrumb={isNavbarEnhanced
        ? [{ text: $t({ defaultMessage: 'Wi-Fi' }) }]
        : []
      }
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
