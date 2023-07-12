import { Form, Input, Modal }       from 'antd'
import { RawIntlProvider, useIntl } from 'react-intl'

import { showActionModal } from '@acx-ui/components'
import {
  useDeleteEdgeMutation,
  useFactoryResetEdgeMutation,
  useRebootEdgeMutation,
  useSendOtpMutation
} from '@acx-ui/rc/services'
import { EdgeStatus, EdgeStatusEnum } from '@acx-ui/rc/utils'
import { getIntl }                    from '@acx-ui/utils'

import * as UI from './styledComponents'


export const useEdgeActions = () => {
  const { $t } = useIntl()
  const [ invokeDeleteEdge ] = useDeleteEdgeMutation()
  const [ invokeRebootEdge ] = useRebootEdgeMutation()
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
            invokeRebootEdge({ params: { serialNumber: data.serialNumber } })
              .then(() => callback?.())
          }
        }]
      }
    })
  }

  const factoryReset = (data: EdgeStatus) => {
    showActionModal({
      type: 'confirm',
      title: $t(
        { defaultMessage: 'Reset and recover "{edgeName}"?' },
        { edgeName: data.name }
      ),
      content: $t({
        defaultMessage: 'Are you sure you want to reset and recover this SmartEdge?'
      }),
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
            invokeFactoryResetEdge({ params: { serialNumber: data.serialNumber } })
          }
        }]
      }
    })
  }

  const deleteEdges = (data: EdgeStatus[], callback?: () => void) => {
    const handleOk = () => (data.length ===1 ?
      invokeDeleteEdge({ params: { serialNumber: data[0].serialNumber } })
        .then(() => callback?.()) :
      invokeDeleteEdge({ payload: data.map(item => item.serialNumber) })
        .then(() => callback?.()))
    showDeleteModal(data, handleOk)
  }

  const sendOtp = (data: EdgeStatus, callback?: () => void) => {
    showActionModal({
      type: 'confirm',
      title: $t({ defaultMessage: 'Send OTP' }),
      content: $t({ defaultMessage: 'Are you sure you want to send OTP?' }),
      onOk: () => {
        invokeSendOtp({ params: { serialNumber: data.serialNumber } })
          .then(() => callback?.())
      }
    })
  }



  return {
    reboot,
    factoryReset,
    deleteEdges,
    sendOtp
  }
}

const showDeleteModal = (data: EdgeStatus[], handleOk?: () => void) => {
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
      $t({ defaultMessage: 'SmartEdge' }) :
      $t({ defaultMessage: 'SmartEdges' }),
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
          $t({ defaultMessage: 'SmartEdge' }) :
          $t({ defaultMessage: 'SmartEdges' }) })}
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
        defaultMessage: `Existing configuration will be wiped. SmartEdge will have a
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

