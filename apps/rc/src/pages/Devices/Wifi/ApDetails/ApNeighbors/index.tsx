import { defineMessage, useIntl, MessageDescriptor } from 'react-intl'
import { useNavigate }                               from 'react-router-dom'

import { Tabs }                   from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { useApContext }           from '@acx-ui/rc/utils'
import { useTenantLink }          from '@acx-ui/react-router-dom'

import ApLldpNeighbors from './ApLldpNeighbors'
import ApRfNeighbors   from './ApRfNeighbors'


type ApNeighborTypes = 'lldp' | 'rf'

const tabs : {
  key: ApNeighborTypes,
  title: MessageDescriptor,
  component: React.ReactNode
}[] = [
  {
    key: 'lldp',
    title: defineMessage({ defaultMessage: 'LLDP Neighbors' }),
    component: <ApLldpNeighbors />
  },
  {
    key: 'rf',
    title: defineMessage({ defaultMessage: 'RF Neighbors' }),
    component: <ApRfNeighbors />
  }
]

export function ApNeighborsTab () {
  const { $t } = useIntl()
  const { activeSubTab = tabs[0].key, serialNumber } = useApContext()
  const navigate = useNavigate()
  const isApNeighborsOn = useIsSplitOn(Features.WIFI_EDA_NEIGHBORS_TOGGLE)
  const basePath = useTenantLink(`/devices/wifi/${serialNumber}/details/neighbors/`)
  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (isApNeighborsOn
    ? <Tabs
      onChange={onTabChange}
      destroyInactiveTabPane={true}
      activeKey={activeSubTab}
      type='second'
    >
      {tabs.map(({ key, title, component }) =>
        <Tabs.TabPane tab={$t(title)} key={key} >{component}</Tabs.TabPane>)}
    </Tabs>
    : null
  )
}
