import { useContext, useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Button, Drawer }                                         from '@acx-ui/components'
import { EPDG, WifiCallingActionPayload, WifiCallingActionTypes } from '@acx-ui/rc/utils'

import WifiCallingFormContext from '../WifiCallingFormContext'


interface WifiCallingDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEditMode: boolean
  serviceName?: string
  serviceIndex: number | undefined
}

const WifiCallingDrawer = (props: WifiCallingDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, isEditMode, serviceIndex } = props
  const [resetField, setResetField] = useState(false)
  const { state, dispatch } = useContext(WifiCallingFormContext)
  const [form] = Form.useForm()
  const title = isEditMode
    ? $t({ defaultMessage: 'Edit ePDG' })
    : $t({ defaultMessage: 'Add ePDG' })

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const content = <Form layout='vertical'
    form={form}
    onFinish={(data: EPDG) => {
      if (isEditMode) {
        dispatch({
          type: WifiCallingActionTypes.UPDATE_EPDG,
          payload: {
            domain: data.domain,
            ip: data.ip,
            id: serviceIndex
          }
        } as WifiCallingActionPayload)
      } else {
        dispatch({
          type: WifiCallingActionTypes.ADD_EPDG,
          payload: {
            domain: data.domain,
            ip: data.ip
          }
        } as WifiCallingActionPayload)
      }

      onClose()
      const clearButton = document?.querySelector('button[title="Clear selection"]')
      // @ts-ignore
      clearButton.click()
    }
    }>
    <Form.Item
      name='domain'
      label={$t({ defaultMessage: 'Domain Name' })}
      rules={[{ required: true }]}
      initialValue={serviceIndex !== undefined ? state.ePDG[serviceIndex].domain : ''}
      children={<Input
        placeholder={$t({ defaultMessage: 'Please enter the domain name' })} />}
    />
    <Form.Item
      name='ip'
      label={$t({ defaultMessage: 'IP Address' })}
      rules={[{ required: true }]}
      initialValue={serviceIndex !== undefined ? state.ePDG[serviceIndex].ip : ''}
      children={<Input
        placeholder={$t({ defaultMessage: 'Please enter the ip address' })} />}
    />
  </Form>

  const footer = [
    <Button key='saveBtn' onClick={() => form.submit()} type={'primary'}>
      {$t({ defaultMessage: 'Save' })}
    </Button>,
    <Button key='cancelBtn' onClick={resetFields}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  ]

  return (
    <Drawer
      title={title}
      visible={visible}
      onClose={onClose}
      children={content}
      // TODO: use Drawer.FormFooter component when ready (https://bitbucket.rks-cloud.com/projects/RKSCLOUD/repos/acx-ui/pull-requests/136/overview)
      footer={footer}
      destroyOnClose={resetField}
      width={'600px'}
    />
  )
}

export default WifiCallingDrawer
