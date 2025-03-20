import { useIntl } from 'react-intl'

import { showActionModal }       from '@acx-ui/components'
import {
  useDeleteEdgeClusterMutation,
  useDeleteEdgeMutation,
  useRebootEdgeMutation,
  useShutdownEdgeMutation,
  useSendOtpMutation,
  useFactoryResetEdgeMutation
} from '@acx-ui/rc/services'
import { EdgeClusterTableDataType, EdgeStatus } from '@acx-ui/rc/utils'

import { showDeleteModal } from '../useEdgeActions'

import * as UI from './styledComponents'

export const useEdgeClusterActions = () => {
  const { $t } = useIntl()
  const [ invokeDeleteEdge ] = useDeleteEdgeMutation()
  const [ invokeRebootEdge ] = useRebootEdgeMutation()
  const [ invokeShutdownEdge ] = useShutdownEdgeMutation()
  const [ invokeDeleteEdgeCluster ] = useDeleteEdgeClusterMutation()
  const [ invokeSendOtp ] = useSendOtpMutation()
  const [ invokeFactoryReset ] = useFactoryResetEdgeMutation()

  const reboot = (data: EdgeStatus[], callback?: () => void) => {
    showActionModal({
      type: 'confirm',
      title: $t(
        {
          defaultMessage: `Reboot "{count, plural,
            one {{name}}
            other {{count} RUCKUS Edges}
          }"?`
        }, { count: data.length, name: data[0].name }
      ),
      content: $t({
        defaultMessage: `Rebooting the RUCKUS Edge will disconnect all connected clients.
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
              invokeRebootEdge({
                params: {
                  venueId: item.venueId,
                  edgeClusterId: item.clusterId,
                  serialNumber: item.serialNumber
                }
              }))
            Promise.all(requests).then(() => callback?.())
          }
        }]
      }
    })
  }

  const shutdown = (data: EdgeStatus[], callback?: () => void) => {
    showActionModal({
      type: 'confirm',
      title: $t(
        {
          defaultMessage: `Shutdown "{count, plural,
            one {{name}}
            other {{count} RUCKUS Edges}
          }"?`
        }, { count: data.length, name: data[0].name }
      ),
      content: $t({
        defaultMessage: `Shutdown will safely end all operations on RUCKUS Edge. You will need to 
        manually restart the device. Are you sure you want to shut down this RUCKUS Edge?`
      }),
      customContent: {
        action: 'CUSTOM_BUTTONS',
        buttons: [{
          text: $t({ defaultMessage: 'Cancel' }),
          type: 'default',
          key: 'cancel'
        }, {
          text: $t({ defaultMessage: 'Shutdown' }),
          type: 'primary',
          key: 'ok',
          closeAfterAction: true,
          handler: () => {
            const requests = data.map(item =>
              invokeShutdownEdge({
                params: {
                  venueId: item.venueId,
                  edgeClusterId: item.clusterId,
                  serialNumber: item.serialNumber
                }
              }))
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
        for(let item of edgeNodes) {
          requests.push(invokeDeleteEdge({
            params: {
              venueId: item.venueId,
              edgeClusterId: item.clusterId,
              serialNumber: item.serialNumber
            }
          }))
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
        const requests = []
        for(let item of data) {
          if(!item.isFirstLevel) {
            requests.push(invokeSendOtp({
              params: {
                venueId: item.venueId,
                edgeClusterId: item.clusterId,
                serialNumber: item.serialNumber
              }
            }))
          }
        }
        Promise.all(requests).then(() => callback?.())
      }
    })
  }

  const sendFactoryReset = (data: EdgeClusterTableDataType[], callback?: () => void) => {
    showActionModal({
      type: 'confirm',
      title: $t(
        // eslint-disable-next-line max-len
        { defaultMessage: 'Reset & Recover the {count, plural, one {Edge} other {Edges}}' },
        { count: data.length }
      ),
      content: (
        <UI.Content>
          <div className='mb-16'>
            {
              $t({
                defaultMessage: 'Are you sure you want to reset and recover this RUCKUS Edge?'
              })
            }
          </div>
          <span className='warning-text'>
            {$t({
              defaultMessage: `Note: Reset & Recover can address anomalies,
              but may not resolve all issues, especially for complex,
              misconfigured, or hardware-related problems.`
            })}
          </span>
        </UI.Content>
      ),
      customContent: {
        action: 'CUSTOM_BUTTONS',
        buttons: [{
          text: $t({ defaultMessage: 'Cancel' }),
          type: 'default',
          key: 'cancel'
        }, {
          text: $t({ defaultMessage: 'Reset' }),
          type: 'primary',
          key: 'ok',
          closeAfterAction: true,
          handler: () => {
            const requests = []
            for(let item of data) {
              if(!item.isFirstLevel) {
                requests.push(invokeFactoryReset({
                  params: {
                    venueId: item.venueId,
                    edgeClusterId: item.clusterId,
                    serialNumber: item.serialNumber
                  }
                }))
              }
            }
            Promise.all(requests).then(() => callback?.())
          }
        }]
      }
    })
  }

  return {
    reboot,
    shutdown,
    deleteNodeAndCluster,
    sendEdgeOnboardOtp,
    sendFactoryReset
  }
}
