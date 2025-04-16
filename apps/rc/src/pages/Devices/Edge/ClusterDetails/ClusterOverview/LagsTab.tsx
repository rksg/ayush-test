import { useContext } from 'react'

import { Col }     from 'antd'
import { useIntl } from 'react-intl'


import { Button, GridRow, Loader }                 from '@acx-ui/components'
import { EdgeOverviewLagTable }                    from '@acx-ui/edge/components'
import { Features }                                from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                   from '@acx-ui/rc/components'
import { EdgeLagStatus, EdgeStatus, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }   from '@acx-ui/react-router-dom'
import { EdgeScopes }                              from '@acx-ui/types'
import { hasPermission }                           from '@acx-ui/user'
import { getOpsApi }                               from '@acx-ui/utils'

import { EdgeClusterDetailsDataContext } from '../EdgeClusterDetailsDataProvider'

interface LagsTabProps {
  isConfigurable: boolean
  data: EdgeLagStatus[]
  isLoading?: boolean
}

export const LagsTab = (props: LagsTabProps) => {
  const { data, isLoading = false, isConfigurable } = props
  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const isEdgeDualWanEnabled = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)

  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}`)
  const { clusterInfo } = useContext(EdgeClusterDetailsDataContext)

  const navigateToLagConfigPage = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/edit/lags`
    })
  }

  const hasUpdatePermission = hasPermission({
    scopes: [EdgeScopes.UPDATE],
    rbacOpsIds: [
      getOpsApi(EdgeUrlsInfo.addEdgeLag),
      getOpsApi(EdgeUrlsInfo.updateEdgeLag),
      getOpsApi(EdgeUrlsInfo.deleteEdgeLag)
    ]
  })

  return (
    <GridRow justify='end'>
      {hasUpdatePermission && isConfigurable &&
      <Button
        size='small'
        type='link'
        onClick={navigateToLagConfigPage}
      >
        {$t({ defaultMessage: 'Configure LAG Settings' })}
      </Button>
      }
      <Col span={24}>
        <Loader states={[{ isLoading }]}>
          <EdgeOverviewLagTable
            isClusterLevel
            isConfigurable={isConfigurable}
            data={data}
            edgeNodes={clusterInfo!.edgeList!}
            filterables={isEdgeDualWanEnabled
              ? {
                type: true,
                status: true,
                edgeName: clusterInfo!.edgeList!.map((edge: EdgeStatus) => ({
                  key: edge.serialNumber,
                  value: edge.name
                }))
              }
              : undefined}
          />
        </Loader>
      </Col>
    </GridRow>
  )
}