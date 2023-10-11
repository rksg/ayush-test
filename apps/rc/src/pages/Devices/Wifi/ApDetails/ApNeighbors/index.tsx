import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Tabs, Tooltip }    from '@acx-ui/components'
import { InformationSolid } from '@acx-ui/icons'
import { useApContext }     from '@acx-ui/rc/utils'
import { useTenantLink }    from '@acx-ui/react-router-dom'
import { getIntl }          from '@acx-ui/utils'

import ApLldpNeighbors        from './ApLldpNeighbors'
import ApRfNeighbors          from './ApRfNeighbors'
import { ApNeighborTypes }    from './constants'
import * as UI                from './styledComponents'
import { useIsApNeighborsOn } from './useApNeighbors'

export function ApNeighborsTab () {
  const { $t } = useIntl()

  const tabs : {
    key: ApNeighborTypes,
    title: React.ReactNode,
    component: React.ReactNode
  }[] = [
    {
      key: 'rf',
      title: <UI.TabWithHint>
        {$t({ defaultMessage: 'RF Neighbors' })}
        <Tooltip children={<InformationSolid />}
          title={$t({ defaultMessage: 'RF Neighbors managed by this Tenant' })} />
      </UI.TabWithHint>,
      component: <ApRfNeighbors />
    },
    {
      key: 'lldp',
      title: $t({ defaultMessage: 'LLDP Neighbors' }),
      component: <ApLldpNeighbors />
    }
  ]

  const { activeSubTab = tabs[0].key, serialNumber } = useApContext()
  const navigate = useNavigate()
  const isApNeighborsOn = useIsApNeighborsOn()
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
      type='card'
    >
      {tabs.map(({ key, title, component }) =>
        <Tabs.TabPane key={key} tab={title}>{component}</Tabs.TabPane>)
      }
    </Tabs>
    : null
  )
}


export function apNeighborValueRender (
  value?: string | null,
  highlightFn?: (value: string) => React.ReactNode
): string | React.ReactNode {
  if (!value) return getIntl().$t({ defaultMessage: 'N/A' })

  return highlightFn ? highlightFn(value) : value
}
