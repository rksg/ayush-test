import { useIntl } from 'react-intl'

import { PageHeader, Tabs }                               from '@acx-ui/components'
import { useNavigate, useTenantLink }                     from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType, usePageHeaderExtra } from '@acx-ui/reports/components'
import { filterByAccess }                                 from '@acx-ui/user'

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
  headerExtra: JSX.Element[]
}

function isElementArray (data: JSX.Element | JSX.Element[]
): data is JSX.Element[] {
  return data ? Array.isArray(data) : false
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
      reportName={ReportType.ACCESS_POINT}
      hideHeader={false}
    />,
    headerExtra: usePageHeaderExtra(ReportType.ACCESS_POINT)
  }
  const airtimeReportTab = {
    key: WifiTabsEnum.AIRTIME_REPORT,
    title: $t({ defaultMessage: 'Airtime Utilization Report' }),
    component: <EmbeddedReport
      reportName={ReportType.AIRTIME_UTILIZATION}
      hideHeader={false}
    />,
    headerExtra: usePageHeaderExtra(ReportType.AIRTIME_UTILIZATION)
  }
  return [listTab, apReportTab, airtimeReportTab]
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
  const { component, headerExtra } = tabs.find(({ key }) => key === tab)!
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Access Points' })}
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
