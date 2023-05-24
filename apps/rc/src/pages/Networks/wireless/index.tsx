import { useIntl } from 'react-intl'

import { PageHeader, Tabs }           from '@acx-ui/components'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { EmbeddedReport }             from '@acx-ui/reports/components'
import {
  ReportType,
  reportTypeDataStudioMapping
} from '@acx-ui/reports/components'
import { filterByAccess } from '@acx-ui/user'

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
  const listTab = {
    key: NetworkTabsEnum.LIST,
    ...useNetworksTable()
  }
  const wlanReportTab = {
    key: NetworkTabsEnum.WLAN_REPORT,
    title: $t({ defaultMessage: 'WLAN Report' }),
    component: <EmbeddedReport embedDashboardName={reportTypeDataStudioMapping[ReportType.WLAN]} />
  }
  const applicationsReportTab = {
    key: NetworkTabsEnum.APPLICATIONS_REPORT,
    title: $t({ defaultMessage: 'Applications Report' }),
    component: <EmbeddedReport
      embedDashboardName={reportTypeDataStudioMapping[ReportType.APPLICATION]} />
  }
  const wirelessReportTab = {
    key: NetworkTabsEnum.WIRELESS_REPORT,
    title: $t({ defaultMessage: 'Wireless Report' }),
    component: <EmbeddedReport
      embedDashboardName={reportTypeDataStudioMapping[ReportType.WIRELESS]} />
  }
  return [
    listTab,
    wlanReportTab,
    applicationsReportTab,
    wirelessReportTab
  ]
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
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Wi-Fi Networks' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Wi-Fi' }) }]}
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
