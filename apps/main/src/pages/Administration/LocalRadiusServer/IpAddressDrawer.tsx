import { useEffect, useState } from 'react'

import { Form, Input } from 'antd'
import { isEqual }     from 'lodash'
import { useIntl }     from 'react-intl'

import { Drawer, showToast }                   from '@acx-ui/components'
import { useUpdateRadiusClientConfigMutation } from '@acx-ui/rc/services'
import { ClientConfig, cliIpAddressRegExp }    from '@acx-ui/rc/utils'

interface IpAddressDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  editMode?: boolean
  editIpAddress?: string
  clientConfig: ClientConfig
}

interface httpErrorResponse {
  status: number
}

export function IpAddressDrawer (props: IpAddressDrawerProps) {
  const { $t } = useIntl()
  const { visible, setVisible, editMode = false, clientConfig, editIpAddress } = props
  const [form] = Form.useForm()
  const [resetField, setResetField] = useState(false)
  const [updateConfig] = useUpdateRadiusClientConfigMutation()

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  useEffect(()=>{
    if (editIpAddress !== null && visible) {
      form.setFieldValue('singleIpAddress', editIpAddress)
    }
  }, [editIpAddress, visible])

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const ipAddressExistCheck = (value: string) =>{
    if (value !== editIpAddress && clientConfig.ipAddress
      && clientConfig.ipAddress.filter(item => isEqual(item, value)).length !== 0) {
      return Promise.reject($t({ defaultMessage: 'IP Address already exists' }))
    }
    return Promise.resolve()
  }

  const content = <Form layout='vertical' form={form}>
    <Form.Item
      name='singleIpAddress'
      label={$t({ defaultMessage: 'IP Address' })}
      rules={[
        { required: true },
        { validator: (_, value) => cliIpAddressRegExp(value) },
        { validator: (_, value) => ipAddressExistCheck(value) }
      ]}
      validateFirst
      hasFeedback
      children={<Input/>}/>
  </Form>

  return (
    <Drawer
      // eslint-disable-next-line max-len
      title={editMode ? $t({ defaultMessage: 'Edit Incoming IP Address' }): $t({ defaultMessage: 'Add Incoming IP Address' })}
      visible={visible}
      onClose={() => setVisible(false)}
      children={content}
      footer={
        <Drawer.FormFooter
          showAddAnother={!editMode}
          buttonLabel={({
            save: $t({ defaultMessage: 'Apply' }),
            addAnother: $t({ defaultMessage: 'Add Another IP Address' })
          })}
          onCancel={resetFields}
          onSave={async (addAnotherRuleChecked: boolean) => {
            try {
              await form.validateFields()
              const ipAddress = form.getFieldValue('singleIpAddress')
              if(editMode) {
                if(ipAddress !== editIpAddress) {
                  await updateConfig({
                    payload: {
                      // eslint-disable-next-line max-len
                      ipAddress: clientConfig.ipAddress?.filter((e) => e !== editIpAddress).concat(ipAddress)
                    }
                  }).unwrap()
                }
              }else {
                await updateConfig({ payload: {
                  // eslint-disable-next-line max-len
                  ipAddress: clientConfig.ipAddress ? clientConfig.ipAddress?.concat(ipAddress) : ipAddress
                } }).unwrap()
              }
              if (!addAnotherRuleChecked) {
                onClose()
              } else {
                form.resetFields()
              }

              showToast({
                type: 'success',
                content: $t(
                  // eslint-disable-next-line max-len
                  { defaultMessage: 'IP Address {ipAddress} was {editMode, select, true {updated} other {added}}',
                    description: 'Translation strings - IP Address, was' },
                  { ipAddress, editMode }
                )
              })

            } catch(error) {
              if (error instanceof Error){
                throw error
              }
              const errorResponse = error as httpErrorResponse
              if(errorResponse.status) {
                if (errorResponse.status === 409) {
                  showToast({
                    type: 'error',
                    // eslint-disable-next-line max-len
                    content: $t({ defaultMessage: 'IP Address is already used by another tenant' })
                  })
                }
              }
            }
          }}
        />
      }
      destroyOnClose={resetField}
      width={400}
    />
  )
}
