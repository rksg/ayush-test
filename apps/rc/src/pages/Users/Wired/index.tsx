import { useEffect, useState } from 'react'

import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { PageHeader, Tabs }                        from '@acx-ui/components'
import { Features, useIsSplitOn }                  from '@acx-ui/feature-toggle'
import { SwitchClientContext, SwitchClientsTable } from '@acx-ui/rc/components'
import {
  useGetApWiredClientsQuery,
  useGetSwitchClientListQuery
} from '@acx-ui/rc/services'
import { usePollingTableQuery } from '@acx-ui/rc/utils'
import { useTenantLink }        from '@acx-ui/react-router-dom'
import { filterByAccess }       from '@acx-ui/user'

import { ApWiredClientTable } from './ApWiredClientTable'



export enum WiredTabsEnum {
  SWITCH_CLIENTS = 'switch/clients',
  AP_CLIENTS = 'wifi/clients'
}

type WiredTab = {
    key: WiredTabsEnum,
    url?: string,
    title: string,
    component: JSX.Element,
    headerExtra: JSX.Element[]
  }

function isElementArray (data: JSX.Element | JSX.Element[]
): data is JSX.Element[] {
  return Array.isArray(data)
}

type WiredTabsInfo = {
  tabs: WiredTab[],
  switchCount: number,
  apWiredCount: number
}

const useTabs = () : WiredTabsInfo => {
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const [ switchCount, setSwitchCount ] = useState(0)
  const [ switchTableQueryFilters, setSwitchTableQueryFilters ] = useState({})
  const [ apWiredCount, setApWiredCount ] = useState(0)


  const switchClientTableQuery = usePollingTableQuery({
    useQuery: useGetSwitchClientListQuery,
    defaultPayload: {
      searchString: '',
      filters: {},
      fields: [ 'clientMac']
    },
    enableRbac: isSwitchRbacEnabled
  })

  // eslint-disable-next-line max-len
  const apWiredClientTableQuery = usePollingTableQuery({
    useQuery: useGetApWiredClientsQuery,
    defaultPayload: {
      searchString: '',
      filters: {},
      fields: [ 'macAddress']
    }
  })


  useEffect(() => {
    setSwitchCount(switchClientTableQuery.data?.totalCount || 0)
  }, [switchClientTableQuery.data])

  useEffect(() => {
    setApWiredCount(apWiredClientTableQuery.data?.totalCount || 0)
  }, [apWiredClientTableQuery.data])


  const { $t } = useIntl()
  const switchClientsTab = {
    key: WiredTabsEnum.SWITCH_CLIENTS,
    title: $t({ defaultMessage: 'Switch Clients ({switchCount})' }, { switchCount }),
    component: <SwitchClientContext.Provider value={{
      setSwitchCount,
      tableQueryFilters: switchTableQueryFilters,
      setTableQueryFilters: setSwitchTableQueryFilters
    }}>
      <SwitchClientsTable filterByVenue={true} filterBySwitch={true} />
    </SwitchClientContext.Provider>,
    headerExtra: []
  }
  const apClientsTab = {
    key: WiredTabsEnum.AP_CLIENTS,
    title: $t({ defaultMessage: 'AP Clients ({apWiredCount})' }, { apWiredCount }),
    component: <ApWiredClientTable />,
    headerExtra: []
  }

  return {
    tabs: [ switchClientsTab, apClientsTab ],
    switchCount,
    apWiredCount
  }
}

export function WiredClientList ({ tab }: { tab: WiredTabsEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('users/wired/')

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tabs.find(({ key }) => key === tab)?.url || tab}`
    })

  const { tabs, switchCount, apWiredCount } = useTabs()
  const { component, headerExtra } = tabs.find(({ key }) => key === tab)!
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Wired ({totalCount})' },
        { totalCount: (switchCount + apWiredCount) })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Clients' }) }]}
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