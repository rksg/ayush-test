import { useContext } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Drawer }          from '@acx-ui/components'
import {
  domainNameRegExp,
  serverIpAddressRegExp,
  WifiCallingActionPayload,
  WifiCallingActionTypes
} from '@acx-ui/rc/utils'

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
  const { state, dispatch } = useContext(WifiCallingFormContext)
  const [form] = Form.useForm()
  const title = isEditMode
    ? $t({ defaultMessage: 'Edit ePDG' })
    : $t({ defaultMessage: 'Add ePDG' })

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const content = <Form layout='vertical'
    form={form}
  >
    <Form.Item
      name='domain'
      label={$t({ defaultMessage: 'Domain Name' })}
      rules={[
        { required: true },
        { validator: (_, value) => domainNameRegExp(value) }
      ]}
      initialValue={serviceIndex !== undefined ? state.ePDG[serviceIndex].domain : ''}
      children={<Input
        placeholder={$t({ defaultMessage: 'Please enter the domain name' })} />}
    />
    <Form.Item
      name='ip'
      label={$t({ defaultMessage: 'IP Address' })}
      rules={[
        { required: true },
        { validator: (_, value) => serverIpAddressRegExp(value) }
      ]}
      initialValue={serviceIndex !== undefined ? state.ePDG[serviceIndex].ip : ''}
      children={<Input
        placeholder={$t({ defaultMessage: 'Please enter the ip address' })} />}
    />
  </Form>

  return (
    <Drawer
      title={title}
      visible={visible}
      onClose={onClose}
      children={content}
      footer={
        <Drawer.FormFooter
          showAddAnother={!isEditMode}
          buttonLabel={({
            addAnother: $t({ defaultMessage: 'Add another ePDG' }),
            save: $t({ defaultMessage: 'Save' })
          })}
          onCancel={onClose}
          onSave={async (addAnotherRuleChecked: boolean) => {
            try {
              await form.validateFields()

              if (isEditMode) {
                dispatch({
                  type: WifiCallingActionTypes.UPDATE_EPDG,
                  payload: {
                    domain: form.getFieldValue('domain'),
                    ip: form.getFieldValue('ip'),
                    id: serviceIndex
                  }
                } as WifiCallingActionPayload)
              } else {
                dispatch({
                  type: WifiCallingActionTypes.ADD_EPDG,
                  payload: {
                    domain: form.getFieldValue('domain'),
                    ip: form.getFieldValue('ip')
                  }
                } as WifiCallingActionPayload)
              }


              form.submit()

              if (!addAnotherRuleChecked) {
                onClose()
              }
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
      destroyOnClose={true}
      width={'600px'}
    />
  )
}

export default WifiCallingDrawer
