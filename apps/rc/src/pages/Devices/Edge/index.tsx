import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Dropdown, PageHeader }                           from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { CommonOperation, Device, getUrl }                        from '@acx-ui/rc/utils'
import { TenantLink }                                             from '@acx-ui/react-router-dom'
import { filterByAccess }                                         from '@acx-ui/user'

import { EdgeClusterTable } from './EdgeClusterTable'
import { OldEdgeListPage }  from './OldEdgeListPage'


const Edges = () => {
  const { $t } = useIntl()
  const isEdgeEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES)
  const isEdgeHaEnabled = useIsSplitOn(Features.EDGE_HA_TOGGLE)

  if (!isEdgeEnabled) {
    return <span>{ $t({ defaultMessage: 'SmartEdge is not enabled' }) }</span>
  }

  return isEdgeHaEnabled ?
    <>
      <PageHeader
        title={$t({ defaultMessage: 'SmartEdge' })}
        extra={filterByAccess([<AddMenu />])}
      />
      <EdgeClusterTable />
    </>
    : <OldEdgeListPage />
}

const AddMenu = () => {
  const { $t } = useIntl()

  const menuItems = [
    {
      key: 'add-edge',
      label: <TenantLink to={getUrl({
        feature: Device.Edge,
        oper: CommonOperation.Add
      })}>
        {$t({ defaultMessage: 'SmartEdge' })}
      </TenantLink>
    },
    {
      key: 'add-cluster',
      label: <TenantLink to={getUrl({
        feature: Device.EdgeCluster,
        oper: CommonOperation.Add
      })}>
        {$t({ defaultMessage: 'Cluster' })}
      </TenantLink>
    }
  ]

  return (
    <Dropdown overlay={<Menu items={menuItems} />} placement='bottom'>
      {
        () => <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
      }
    </Dropdown>
  )
}

export default Edges
