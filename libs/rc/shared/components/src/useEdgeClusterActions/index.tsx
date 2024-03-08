import { useIntl } from 'react-intl'

import { showActionModal }                                                            from '@acx-ui/components'
import {
  useDeleteEdgeClusterMutation,
  useDeleteEdgeMutation,
  useRebootEdgeMutation,
  useSendOtpMutation
} from '@acx-ui/rc/services'
import { EdgeClusterTableDataType, EdgeStatus }                                       from '@acx-ui/rc/utils'

import { showDeleteModal } from '../useEdgeActions'

export const useEdgeClusterActions = () => {
  const { $t } = useIntl()
  const [ invokeDeleteEdge ] = useDeleteEdgeMutation()
  const [ invokeRebootEdge ] = useRebootEdgeMutation()
  const [ invokeDeleteEdgeCluster ] = useDeleteEdgeClusterMutation()
  const [ invokeSendOtp ] = useSendOtpMutation()

  const reboot = (data: EdgeStatus[], callback?: () => void) => {
    showActionModal({
      type: 'confirm',
      title: $t(
        {
          defaultMessage: `Reboot "{count, plural,
            one {{name}}
            other {{count} SmartEdges}
          }"?`
        }, { count: data.length, name: data[0].name }
      ),
      content: $t({
        defaultMessage: `Rebooting the SmartEdge will disconnect all connected clients.
          Are you sure you want to reboot?`
      }),
      customContent: {
        action: 'CUSTOM_BUTTONS',
        buttons: [{
          text: $t({ defaultMessage: 'Cancel' }),
          type: 'default',
          key: 'cancel'
        }, {
          text: $t({ defaultMessage: 'Reboot' }),
          type: 'primary',
          key: 'ok',
          closeAfterAction: true,
          handler: () => {
            const requests = data.map(item =>
              invokeRebootEdge({ params: { serialNumber: item.serialNumber } }))
            Promise.all(requests).then(() => callback?.())
          }
        }]
      }
    })
  }

  const deleteNodeAndCluster = (data: EdgeClusterTableDataType[], callback?: () => void) => {
    const handleOk = () => {
      const requests = []
      const clusters = data.filter(item => item.isFirstLevel)
      const edgeNodes = data.filter(item => !item.isFirstLevel)
      if(clusters.length > 0) {
        for(let item of clusters) {
          requests.push(invokeDeleteEdgeCluster({
            params: {
              venueId: item.venueId,
              clusterId: item.clusterId
            }
          }))
        }
      }
      if(edgeNodes.length > 0) {
        if(edgeNodes.length === 1) {
          requests.push(invokeDeleteEdge({ params: { serialNumber: edgeNodes[0].serialNumber } }))
        } else {
          requests.push(invokeDeleteEdge({ payload: edgeNodes.map(item => item.serialNumber) }))
        }
      }
      Promise.all(requests).then(() => callback?.())
    }
    showDeleteModal(data, handleOk)
  }

  const sendEdgeOnboardOtp = (data: EdgeClusterTableDataType[], callback?: () => void) => {
    showActionModal({
      type: 'confirm',
      title: $t({ defaultMessage: 'Send OTP' }),
      content: $t({ defaultMessage: 'Are you sure you want to send OTP?' }),
      onOk: () => {
        console.log(data)
        const requests = []
        for(let item of data) {
          if(!item.isFirstLevel) {
            requests.push(invokeSendOtp({ params: { serialNumber: item.serialNumber } }))
          }
        }
        Promise.all(requests).then(() => callback?.())
      }
    })
  }

  return {
    reboot,
    deleteNodeAndCluster,
    sendEdgeOnboardOtp
  }
}
