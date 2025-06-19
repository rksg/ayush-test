import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Dropdown, PageHeader }                  from '@acx-ui/components'
import { EdgePermissions }                               from '@acx-ui/edge/components'
import { CommonOperation, Device, EdgeUrlsInfo, getUrl } from '@acx-ui/rc/utils'
import { TenantLink }                                    from '@acx-ui/react-router-dom'
import { EdgeScopes }                                    from '@acx-ui/types'
import { filterByAccess, hasPermission }                 from '@acx-ui/user'
import { getOpsApi }                                     from '@acx-ui/utils'

import { EdgeClusterTable } from './EdgeClusterTable'


const Edges = () => {
  const { $t } = useIntl()

  const hasCreatePermission = hasPermission({
    scopes: [EdgeScopes.CREATE],
    rbacOpsIds: [
      getOpsApi(EdgeUrlsInfo.addEdge),
      getOpsApi(EdgeUrlsInfo.addEdgeCluster)
    ]
  })

  return <>
    <PageHeader
      title={$t({ defaultMessage: 'RUCKUS Edge' })}
      extra={hasCreatePermission && <AddMenu />}
    />
    <EdgeClusterTable />
  </>
}

const AddMenu = () => {
  const { $t } = useIntl()

  const menuItems = [
    {
      key: 'add-edge',
      rbacOpsIds: EdgePermissions.addEdgeNode,
      label: <TenantLink to={getUrl({
        feature: Device.Edge,
        oper: CommonOperation.Add
      })}
      >
        {$t({ defaultMessage: 'RUCKUS Edge' })}
      </TenantLink>
    },
    {
      key: 'add-cluster',
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.addEdgeCluster)],
      label: <TenantLink to={getUrl({
        feature: Device.EdgeCluster,
        oper: CommonOperation.Add
      })}
      >
        {$t({ defaultMessage: 'Cluster' })}
      </TenantLink>
    }
  ]


  return <Dropdown
    overlay={<Menu items={filterByAccess(menuItems)} />}
    placement='bottom'
    scopeKey={[EdgeScopes.CREATE]}
  >
    {
      () => <Button type='primary'>
        { $t({ defaultMessage: 'Add' }) }
      </Button>
    }
  </Dropdown>
}

export default Edges
