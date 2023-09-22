import { useIntl } from 'react-intl'

import { PageHeader, Tabs }           from '@acx-ui/components'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { ClientsList }                                  from './ClientsList'
import { TimeRangeDropDown, TimeRangeDropDownProvider } from './TimeRangeDropdown'

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
    component: <div>Wireless Clients Reports content</div>
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
  return <TimeRangeDropDownProvider>
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
