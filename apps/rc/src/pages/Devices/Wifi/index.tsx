import { useIntl } from 'react-intl'

import { PageHeader, Tabs }             from '@acx-ui/components'
import { useNavigate, useTenantLink }   from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportHeader } from '@acx-ui/reports/components'
import {
  ReportType,
  reportTypeDataStudioMapping
} from '@acx-ui/reports/components'
import { filterByAccess } from '@acx-ui/user'

import useApsTable from './ApsTable'

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
  headerExtra?: JSX.Element[]
}

const useTabs = () : WifiTab[] => {
  const { $t } = useIntl()
  const listTab = {
    key: WifiTabsEnum.LIST,
    ...useApsTable()
  }
  const apReportTab = {
    key: WifiTabsEnum.AP_REPORT,
    title: $t({ defaultMessage: 'AP Report' }),
    component: <EmbeddedReport
      reportName={reportTypeDataStudioMapping[ReportType.ACCESS_POINT] as ReportType}
      hideHeader={false}
    />,
    headerExtra: [
      <ReportHeader
        type={ReportType.ACCESS_POINT}
        showFilter={true}
      />
    ]
  }
  const airtimeReportTab = {
    key: WifiTabsEnum.AIRTIME_REPORT,
    title: $t({ defaultMessage: 'Air Time Utilization Report' }),
    component: <EmbeddedReport
      reportName={reportTypeDataStudioMapping[ReportType.AIRTIME_UTILIZATION] as ReportType}
      hideHeader={false}
    />,
    headerExtra: [
      <ReportHeader
        type={ReportType.AIRTIME_UTILIZATION}
        showFilter={true}
      />
    ]
  }
  return [
    listTab,
    apReportTab,
    airtimeReportTab
  ]
}

export function AccessPointList ({ tab }: { tab: WifiTabsEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tabs.find(({ key }) => key === tab)?.url || tab}`
    })
  const tabs = useTabs()
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Access Points' })}
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
