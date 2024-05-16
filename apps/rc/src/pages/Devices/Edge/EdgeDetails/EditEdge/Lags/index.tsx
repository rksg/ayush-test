import { useContext } from 'react'

import { Form }      from 'antd'
import { useParams } from 'react-router-dom'

import { Loader }                                                                    from '@acx-ui/components'
import { EdgeLagTable }                                                              from '@acx-ui/rc/components'
import { useAddEdgeLagMutation, useDeleteEdgeLagMutation, useUpdateEdgeLagMutation } from '@acx-ui/rc/services'
import { EdgeLag }                                                                   from '@acx-ui/rc/utils'

import { ClusterNavigateWarning } from '../ClusterNavigateWarning'
import { EditEdgeDataContext }    from '../EditEdgeDataProvider'

const Lags = () => {
  const { serialNumber } = useParams()
  const {
    portData, lagData, lagStatus, isFetching,
    clusterInfo, isCluster, clusterConfig
  } = useContext(EditEdgeDataContext)
  const [addEdgeLag] = useAddEdgeLagMutation()
  const [updateEdgeLag] = useUpdateEdgeLagMutation()
  const [deleteEdgeLag] = useDeleteEdgeLagMutation()

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
      <Form disabled={isCluster}>
        <EdgeLagTable
          serialNumber={serialNumber}
          lagList={lagData}
          lagStatusList={lagStatus}
          portList={portData}
          vipConfig={clusterConfig?.virtualIpSettings?.virtualIps}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Form>
    </Loader>
  )
}

export default Lags