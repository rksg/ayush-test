import { useContext } from 'react'

import { Col }     from 'antd'
import { uniqBy }  from 'lodash'
import { useIntl } from 'react-intl'

import { Button, GridRow, Loader }                                 from '@acx-ui/components'
import { Features }                                                from '@acx-ui/feature-toggle'
import { formatter }                                               from '@acx-ui/formatter'
import { EdgePortsTable, useIsEdgeFeatureReady }                   from '@acx-ui/rc/components'
import { EdgeLagStatus, EdgePortStatus, EdgeStatus, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                   from '@acx-ui/react-router-dom'
import { EdgeScopes }                                              from '@acx-ui/types'
import { hasPermission }                                           from '@acx-ui/user'
import { getOpsApi }                                               from '@acx-ui/utils'

import { EdgeClusterDetailsDataContext } from '../EdgeClusterDetailsDataProvider'

interface PortsTabProps {
  isConfigurable: boolean
  portData: EdgePortStatus[]
  lagData: EdgeLagStatus[]
  isLoading: boolean
  handleClickLagName?: () => void
}

export const PortsTab = (props: PortsTabProps) => {
  const { portData, lagData, isLoading, handleClickLagName, isConfigurable } = props
  const { $t } = useIntl()
  const isEdgeDualWanEnabled = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)

  const { clusterId } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/edge/cluster/${clusterId}`)
  const { clusterInfo } = useContext(EdgeClusterDetailsDataContext)

  const handleClick = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/configure`
    })
  }

  const hasUpdatePermission = hasPermission({
    scopes: [EdgeScopes.UPDATE],
    rbacOpsIds: [
      getOpsApi(EdgeUrlsInfo.updatePortConfig)
    ]
  })

  return <GridRow justify='end'>
    {hasUpdatePermission && isConfigurable &&
      <Button
        size='small'
        type='link'
        onClick={handleClick}
      >
        {$t({ defaultMessage: 'Configure Port Settings' })}
      </Button>
    }

    <Col span={24}>
      <Loader states={[{ isLoading }]}>
        <EdgePortsTable
          isClusterLevel
          portData={portData}
          lagData={lagData}
          edgeNodes={clusterInfo!.edgeList!}
          handleClickLagName={handleClickLagName}
          filterables={isEdgeDualWanEnabled
            ? {
              type: true,
              status: true,
              speedKbps: uniqBy(portData.map((port: EdgePortStatus) => ({
                key: port.speedKbps,
                value: formatter('networkSpeedFormat')(port.speedKbps)
              })), 'key'),
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
}
