import { useIntl } from 'react-intl'

import { useHeaderExtra }                                                  from '@acx-ui/analytics/components'
import { PageHeader, Tabs, TimeRangeDropDown, TimeRangeDropDownProvider  } from '@acx-ui/components'
import { useNavigate, useTenantLink }                                      from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType }                                      from '@acx-ui/reports/components'
import { DateRange }                                                       from '@acx-ui/utils'

import { ClientsList } from './ClientsList'

export enum AIClientsTabEnum {
  CLIENTS = 'users/wifi/clients',
  REPORTS = 'users/wifi/reports'
}

interface Tab {
  key: AIClientsTabEnum,
  title: string,
  component: JSX.Element,
  headerExtra?: JSX.Element[]
}

const useTabs = () : Tab[] => {
  const { $t } = useIntl()
  const clientsTab = {
    key: AIClientsTabEnum.CLIENTS,
    title: $t({ defaultMessage: 'Clients List' }),
    component: <ClientsList/>
  }
  const reportsTab = {
    key: AIClientsTabEnum.REPORTS,
    title: $t({ defaultMessage: 'Wireless Clients Reports' }),
    component: <EmbeddedReport
      reportName={ReportType.CLIENT}
      hideHeader={false}
    />,
    headerExtra: useHeaderExtra({ excludeNetworkFilter: true })
  }
  return [clientsTab, reportsTab]
}

export function AIClients ({ tab }:{ tab?: AIClientsTabEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const tabs = useTabs()
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }
  return <TimeRangeDropDownProvider availableRanges={[
    DateRange.last24Hours,
    DateRange.last7Days,
    DateRange.last30Days
  ]}>
    <PageHeader
      title={$t({ defaultMessage: 'Wireless' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Clients' }) }]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
      }
      extra={[<TimeRangeDropDown/>]}
    />
    {TabComp}
  </TimeRangeDropDownProvider>
}
export default AIClients
