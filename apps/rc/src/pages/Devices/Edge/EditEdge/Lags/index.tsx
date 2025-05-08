import { useContext } from 'react'

import { Form }      from 'antd'
import { useParams } from 'react-router-dom'


import { Loader }                                                                    from '@acx-ui/components'
import { isMultiWanClusterPrerequisite }                                             from '@acx-ui/edge/components'
import { Features }                                                                  from '@acx-ui/feature-toggle'
import { EdgeLagTable, useIsEdgeFeatureReady }                                       from '@acx-ui/rc/components'
import { useAddEdgeLagMutation, useDeleteEdgeLagMutation, useUpdateEdgeLagMutation } from '@acx-ui/rc/services'
import { EdgeLag }                                                                   from '@acx-ui/rc/utils'

import { ClusterNavigateWarning, MultiWanClusterNavigateWarning } from '../ClusterNavigateWarning'
import { EditEdgeDataContext }                                    from '../EditEdgeDataProvider'

const Lags = () => {
  const isEdgeDualWanEnabled = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)

  const { serialNumber } = useParams()
  const {
    portData, lagData, lagStatus, isFetching,
    clusterInfo, isCluster, clusterConfig
  } = useContext(EditEdgeDataContext)
  const [addEdgeLag] = useAddEdgeLagMutation()
  const [updateEdgeLag] = useUpdateEdgeLagMutation()
  const [deleteEdgeLag] = useDeleteEdgeLagMutation()

  // eslint-disable-next-line max-len
  const isMutliWanClusterCondition = isEdgeDualWanEnabled && isMultiWanClusterPrerequisite(clusterInfo)

  const handleAdd = async (serialNumber: string, data: EdgeLag) => {
    const requestPayload = {
      params: {
        serialNumber,
        venueId: clusterInfo?.venueId,
        edgeClusterId: clusterInfo?.clusterId
      },
      payload: data
    }
    await addEdgeLag(requestPayload).unwrap()
  }

  const handleEdit = async (serialNumber: string, data: EdgeLag) => {
    const { id, ...otherInfo } = data
    const requestPayload = {
      params: {
        serialNumber,
        venueId: clusterInfo?.venueId,
        edgeClusterId: clusterInfo?.clusterId,
        lagId: data.id.toString()
      },
      payload: otherInfo
    }
    await updateEdgeLag(requestPayload).unwrap()
  }

  const handleDelete = async (serialNumber: string, id: string) => {
    deleteEdgeLag({
      params: {
        serialNumber,
        venueId: clusterInfo?.venueId,
        edgeClusterId: clusterInfo?.clusterId,
        lagId: id
      }
    })
  }

  return (
    <Loader states={[{ isLoading: false, isFetching }]}>
      {
        isCluster && <ClusterNavigateWarning />
      }
      {
        isMutliWanClusterCondition && <MultiWanClusterNavigateWarning />
      }
      <Form disabled={isCluster || isMutliWanClusterCondition}>
        <EdgeLagTable
          serialNumber={serialNumber}
          lagList={lagData}
          lagStatusList={lagStatus}
          portList={portData}
          vipConfig={clusterConfig?.virtualIpSettings?.virtualIps}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          clusterInfo={clusterInfo!}
        />
      </Form>
    </Loader>
  )
}

export default Lags