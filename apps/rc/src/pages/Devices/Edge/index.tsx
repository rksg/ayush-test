import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Dropdown, PageHeader }                  from '@acx-ui/components'
import { EdgePermissions }                               from '@acx-ui/edge/components'
import { Features }                                      from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady, useIsEdgeReady }         from '@acx-ui/rc/components'
import { CommonOperation, Device, EdgeUrlsInfo, getUrl } from '@acx-ui/rc/utils'
import { TenantLink }                                    from '@acx-ui/react-router-dom'
import { EdgeScopes }                                    from '@acx-ui/types'
import { hasPermission }                                 from '@acx-ui/user'
import { getOpsApi }                                     from '@acx-ui/utils'

import { EdgeClusterTable } from './EdgeClusterTable'
import { OldEdgeListPage }  from './OldEdgeListPage'


const Edges = () => {
  const { $t } = useIntl()
  const isEdgeEnabled = useIsEdgeReady()
  const isEdgeHaEnabled = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE)

  if (!isEdgeEnabled) {
    return <span>{ $t({ defaultMessage: 'RUCKUS Edge is not enabled' }) }</span>
  }

  return isEdgeHaEnabled ?
    <>
      <PageHeader
        title={$t({ defaultMessage: 'RUCKUS Edge' })}
        extra={hasPermission({ scopes: [EdgeScopes.CREATE] }) && <AddMenu />}
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
      })}
      rbacOpsIds={EdgePermissions.addEdgeNode}
      >
        {$t({ defaultMessage: 'RUCKUS Edge' })}
      </TenantLink>
    },
    {
      key: 'add-cluster',
      label: <TenantLink to={getUrl({
        feature: Device.EdgeCluster,
        oper: CommonOperation.Add
      })}
      rbacOpsIds={[getOpsApi(EdgeUrlsInfo.addEdgeCluster)]}
      >
        {$t({ defaultMessage: 'Cluster' })}
      </TenantLink>
    }
  ]

  return (
    <Dropdown overlay={<Menu items={menuItems} />} placement='bottom'>
      {
        () =>
          <Button
            type='primary'
            rbacOpsIds={[
              getOpsApi(EdgeUrlsInfo.addEdgeCluster),
              getOpsApi(EdgeUrlsInfo.addEdge)
            ]}
          >
            { $t({ defaultMessage: 'Add' }) }</Button>
      }
    </Dropdown>
  )
}

export default Edges
