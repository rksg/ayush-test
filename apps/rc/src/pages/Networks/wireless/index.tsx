import { useIntl } from 'react-intl'

import { PageHeader, Tabs }                               from '@acx-ui/components'
import { useNavigate, useTenantLink }                     from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType, usePageHeaderExtra } from '@acx-ui/reports/components'
import { filterByAccess }                                 from '@acx-ui/user'

import useNetworksTable from './NetworksTable'

export enum NetworkTabsEnum {
  LIST = 'wireless',
  WLANS_REPORT = 'wireless/reports/wlans',
  APPLICATIONS_REPORT = 'wireless/reports/applications',
  WIRELESS_REPORT = 'wireless/reports/wireless'
}

interface NetworkTab {
  key: NetworkTabsEnum,
  url?: string,
  title: string,
  component: JSX.Element,
  headerExtra: JSX.Element[]
}

function isElementArray (data: JSX.Element | JSX.Element[]
): data is JSX.Element[] {
  return Array.isArray(data)
}

const useTabs = () : NetworkTab[] => {
  const { $t } = useIntl()
  const listTab = {
    key: NetworkTabsEnum.LIST,
    ...useNetworksTable()
  }
  const wlanReportTab = {
    key: NetworkTabsEnum.WLANS_REPORT,
    title: $t({ defaultMessage: 'WLANs Report' }),
    component: <EmbeddedReport
      reportName={ReportType.WLAN}
      hideHeader={false}
    />,
    headerExtra: usePageHeaderExtra(ReportType.WLAN)
  }
  const applicationsReportTab = {
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
  return [listTab, wlanReportTab, applicationsReportTab, wirelessReportTab]
}

export function NetworksList ({ tab }: { tab: NetworkTabsEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/networks/')
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tabs.find(({ key }) => key === tab)?.url || tab}`
    })
  const tabs = useTabs()
  const { component, headerExtra } = tabs.find(({ key }) => key === tab)!
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Wi-Fi Networks' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Wi-Fi' }) }]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
      }
      extra={filterByAccess(isElementArray(headerExtra!) ? headerExtra : [headerExtra])}
    />
    {component}
  </>
}
