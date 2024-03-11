import { useContext } from 'react'

import { Loader }                                                                    from '@acx-ui/components'
import { useAddEdgeLagMutation, useDeleteEdgeLagMutation, useUpdateEdgeLagMutation } from '@acx-ui/rc/services'
import { EdgeLag, EdgeLagStatus }                                                    from '@acx-ui/rc/utils'

import { EdgeLagTable }         from '../../../EdgeLagTable'
import { EdgePortsDataContext } from '../PortDataProvider'

interface LagProps {
  serialNumber: string
  lagStatusList: EdgeLagStatus[]
  isLoading: boolean
}

const Lag = (props: LagProps) => {
  const { serialNumber, lagStatusList, isLoading } = props
  const { portData, lagData: lagList } = useContext(EdgePortsDataContext)
  const [addEdgeLag] = useAddEdgeLagMutation()
  const [updateEdgeLag] = useUpdateEdgeLagMutation()
  const [deleteEdgeLag] = useDeleteEdgeLagMutation()

  const handleAdd = async (serialNumber: string, data: EdgeLag) => {
    const requestPayload = {
      params: { serialNumber },
      payload: data
    }
    await addEdgeLag(requestPayload).unwrap()
  }

  const handleEdit = async (serialNumber: string, data: EdgeLag) => {
    const { id, ...otherInfo } = data
    const requestPayload = {
      params: { serialNumber, lagId: data.id.toString() },
      payload: otherInfo
    }
    await updateEdgeLag(requestPayload).unwrap()
  }

  const handleDelete = async (serialNumber: string, id: string) => {
    deleteEdgeLag({
      params: {
        serialNumber: serialNumber,
        lagId: id
      }
    })
  }

  return (
    <Loader states={[{ isLoading: false, isFetching: isLoading }]}>
      <EdgeLagTable
        serialNumber={serialNumber}
        lagList={lagList}
        lagStatusList={lagStatusList}
        portList={portData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Loader>
  )
}

export default Lag
