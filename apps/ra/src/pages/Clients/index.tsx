import { useIntl } from 'react-intl'

import { useHeaderExtra }             from '@acx-ui/analytics/components'
import { PageHeader, Tabs }           from '@acx-ui/components'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

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
    component: <ClientsList/>,
    headerExtra: useHeaderExtra({ excludeNetworkFilter: true })
  }
  const reportsTab = {
    key: AIClientsTabEnum.REPORTS,
    title: $t({ defaultMessage: 'Wireless Clients Reports' }),
    component: <div>Wireless Clients Reports content</div>,
    headerExtra: useHeaderExtra({ excludeNetworkFilter: true })
  }
  return [clientsTab, reportsTab]
}

export function AIClients ({ tab }:{ tab?: AIClientsTabEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }
  const tabs = useTabs()
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Wireless' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Clients' }) }]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
      }
      extra={tabs.find(({ key }) => key === tab)?.headerExtra}
    />
    {TabComp}
  </>
}
export default AIClients
