import { useEffect } from 'react'

import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { Drawer }                            from '@acx-ui/components'
import { EdgeDhcpHost, networkWifiIpRegExp } from '@acx-ui/rc/utils'
import { getIntl, validationMessages }       from '@acx-ui/utils'

interface HostDrawerProps {
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  onAddOrEdit: (item: EdgeDhcpHost) => void
  data?: EdgeDhcpHost
  allHost?: EdgeDhcpHost[]
}

const initHostData: Partial<EdgeDhcpHost> = {
  id: '0'
}

async function nameValidator (
  value: string,
  dhcpHosts: EdgeDhcpHost[] = [],
  currentId: EdgeDhcpHost['id']
) {
  const { $t } = getIntl()
  const matched = dhcpHosts.find((item) => item.hostName === value && currentId !== item.id)
  if (!matched) return

  const entityName = $t({ defaultMessage: 'Host Name' })
  return Promise.reject($t(validationMessages.duplication, {
    entityName: entityName,
    key: $t({ defaultMessage: 'name' }),
    extra: ''
  }))
}

export const HostDrawer = (props: HostDrawerProps) => {
  const { $t } = useIntl()
  const [form] = Form.useForm()

  useEffect(() => {
    if(props.visible) {
      form.resetFields()
      form.setFieldsValue(props.data)
    }
  }, [props.visible, form, props.data])

  const getTitle = () => {
    return $t({ defaultMessage: '{operation} Host' },
      { operation: !!props.data ? $t({ defaultMessage: 'Edit' }) :
        $t({ defaultMessage: 'Add' }) })
  }

  const onClose = () => {
    props.setVisible(false)
  }

  const onSave = async (addAnotherHostChecked: boolean) => {
    try {
      await form.validateFields()
      form.submit()

      if (!addAnotherHostChecked) {
        onClose()
      }
    } catch (error) {
      // if (error instanceof Error) throw error
    }
  }

  const onSubmit = (data: EdgeDhcpHost) => {
    let id = data.id
    if (id === initHostData.id) { id = data.id = '_NEW_'+String(Date.now()) }
    props.onAddOrEdit(data)
    form.resetFields()
  }

  const drawerContent = <Form
    form={form}
    layout='vertical'
    onFinish={onSubmit}
    initialValues={initHostData}
  >
    <Form.Item name='id' hidden />

    <Row>
      <Col span={12}>
        <Form.Item
          name='hostName'
          label={$t({ defaultMessage: 'Host Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            {
              validator: (_, value) =>
                nameValidator(value, props.allHost, form.getFieldValue('id'))
            }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item
          name='mac'
          label={$t({ defaultMessage: 'MAC Address' })}
          rules={[
            { required: true }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='fixedAddress'
          label={$t({ defaultMessage: 'Fixed Address' })}
          rules={[
            { required: true },
            { validator: (_, value) => networkWifiIpRegExp(value) }
          ]}
          children={<Input />}
        />
      </Col>
    </Row>
  </Form>

  const drawerFooter = <Drawer.FormFooter
    showAddAnother={!!!props.data}
    buttonLabel={({
      addAnother: $t({ defaultMessage: 'Add another host' }),
      save: !!props.data ? $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' })
    })}
    onCancel={onClose}
    onSave={onSave}
  />

  return (
    <Drawer
      title={getTitle()}
      visible={props.visible}
      onClose={onClose}
      mask={true}
      children={drawerContent}
      destroyOnClose={true}
      width={475}
      footer={drawerFooter}
    />
  )
}