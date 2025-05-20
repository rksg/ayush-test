import { Form, Input, Modal }       from 'antd'
import { RawIntlProvider, useIntl } from 'react-intl'

import { showActionModal }  from '@acx-ui/components'
import { Features }         from '@acx-ui/feature-toggle'
import {
  useDeleteEdgeMutation,
  useFactoryResetEdgeMutation,
  useRebootEdgeMutation,
  useSendOtpMutation,
  useShutdownEdgeMutation
} from '@acx-ui/rc/services'
import { EdgeStatus, EdgeStatusEnum,
  useIsEdgeReady as useIsEdgeReadyFromUtils,
  useIsEdgeFeatureReady as useIsEdgeFeatureReadyFromUtils
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import * as UI from './styledComponents'

export const useIsEdgeReady = () => {
  return useIsEdgeReadyFromUtils()
}

export const useIsEdgeFeatureReady = (featureFlagKey: Features) => {
  return useIsEdgeFeatureReadyFromUtils(featureFlagKey)
}

export const useEdgeActions = () => {
  const { $t } = useIntl()
  const [ invokeDeleteEdge ] = useDeleteEdgeMutation()
  const [ invokeRebootEdge ] = useRebootEdgeMutation()
  const [ invokeShutdownEdge ] = useShutdownEdgeMutation()
  const [ invokeFactoryResetEdge ] = useFactoryResetEdgeMutation()
  const [ invokeSendOtp ] = useSendOtpMutation()

  const reboot = (data: EdgeStatus, callback?: () => void) => {
    showActionModal({
      type: 'confirm',
      title: $t(
        { defaultMessage: 'Reboot "{edgeName}"?' },
        { edgeName: data.name }
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
            invokeRebootEdge({
              params: {
                venueId: data.venueId,
                edgeClusterId: data.clusterId,
                serialNumber: data.serialNumber
              }
            }).then(() => callback?.())
          }
        }]
      }
    })
  }

  const shutdown = (data: EdgeStatus, callback?: () => void) => {
    showActionModal({
      type: 'confirm',
      title: $t(
        { defaultMessage: 'Shutdown "{edgeName}"?' },
        { edgeName: data.name }
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
            invokeShutdownEdge({
              params: {
                venueId: data.venueId,
                edgeClusterId: data.clusterId,
                serialNumber: data.serialNumber
              }
            }).then(() => callback?.())
          }
        }]
      }
    })
  }

  const factoryReset = (data: EdgeStatus, callback?: () => void) => {
    showActionModal({
      type: 'confirm',
      title: $t(
        { defaultMessage: 'Reset & Recover "{edgeName}"?' },
        { edgeName: data.name }
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
      )
      ,
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
            invokeFactoryResetEdge({
              params: {
                venueId: data.venueId,
                edgeClusterId: data.clusterId,
                serialNumber: data.serialNumber
              }
            }).then(() => callback?.())
          }
        }]
      }
    })
  }

  const deleteEdges = (data: EdgeStatus[], callback?: () => void) => {
    const handleOk = () => {
      const requests = []
      if(data.length > 0) {
        for(let item of data) {
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

  const sendOtp = (data: EdgeStatus, callback?: () => void) => {
    showActionModal({
      type: 'confirm',
      title: $t({ defaultMessage: 'Send OTP' }),
      content: $t({ defaultMessage: 'Are you sure you want to send OTP?' }),
      onOk: () => {
        invokeSendOtp({
          params: {
            venueId: data.venueId,
            edgeClusterId: data.clusterId,
            serialNumber: data.serialNumber
          }
        }).then(() => callback?.())
      }
    })
  }



  return {
    reboot,
    shutdown,
    factoryReset,
    deleteEdges,
    sendOtp
  }
}

export const showDeleteModal = (data: EdgeStatus[], handleOk?: () => void) => {
  const intl = getIntl()
  const { $t } = intl
  const modal = Modal.confirm({})
  const dataCount = data.length
  const hasOperationalEdge = data.some(item => item.deviceStatus === EdgeStatusEnum.OPERATIONAL)
  const confirmText = 'Delete'

  const title = $t({
    defaultMessage: `Delete "{count, plural,
      one {{entityValue}}
      other {{count} {formattedEntityName}}
    }"?`
  }, {
    count: dataCount,
    formattedEntityName: dataCount === 1 ?
      $t({ defaultMessage: 'RUCKUS Edge' }) :
      $t({ defaultMessage: 'RUCKUS Edges' }),
    entityValue: data[0].name
  })

  const content = <UI.Content>
    <div className='mb-16'>
      {$t({
        defaultMessage: `Are you sure you want to delete {count, plural,
              one {this}
              other {these}
            } {formattedEntityName}?`
      }, {
        count: dataCount,
        formattedEntityName: dataCount === 1 ?
          $t({ defaultMessage: 'RUCKUS Edge' }) :
          $t({ defaultMessage: 'RUCKUS Edges' }) })}
    </div>
    {
      hasOperationalEdge &&
      <Form>
        <Form.Item
          label={
            $t({ defaultMessage: 'Type the word "{text}" to confirm:' },
              { text: confirmText })
          }
        >
          <Input onChange={(e) => {
            const disabled = e.target.value.toLowerCase() !== confirmText.toLowerCase()
            modal.update({
              okButtonProps: { disabled }
            })
          }} />
        </Form.Item>
      </Form>
    }
    <span className='warning-text'>
      {$t({
        defaultMessage: `Existing configuration will be wiped. RUCKUS Edge will have a
      reboot and roll back to the initial firmware version.`
      })}
    </span>
  </UI.Content>

  const config = {
    icon: <> </>,
    title: title,
    content: content,
    cancelText: $t({ defaultMessage: 'Cancel' }),
    okText: $t({ defaultMessage: 'Delete' }),
    okButtonProps: { disabled: hasOperationalEdge },
    onOk: handleOk
  }
  modal.update({
    ...config,
    content: <RawIntlProvider value={intl} children={config.content} />
  })
}
