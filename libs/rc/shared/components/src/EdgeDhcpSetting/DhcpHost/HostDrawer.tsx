
import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { Drawer }                            from '@acx-ui/components'
import { EdgeDhcpHost, networkWifiIpRegExp } from '@acx-ui/rc/utils'
import { getIntl, validationMessages }       from '@acx-ui/utils'

import { useDrawerControl } from '..'

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
  const { visible, setVisible, onAddOrEdit, data, allHost } = props
  const { form, onSubmit, onSave, onClose } = useDrawerControl({
    visible,
    setVisible,
    data,
    initData: initHostData,
    onAddOrEdit
  })

  const getTitle = () => {
    return $t({ defaultMessage: '{operation} Host' },
      { operation: !!data ? $t({ defaultMessage: 'Edit' }) :
        $t({ defaultMessage: 'Add' }) })
  }

  const drawerContent = <Form
    form={form}
    layout='vertical'
    onFinish={onSubmit}
    initialValues={initHostData}
  >
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
                nameValidator(value, allHost, form.getFieldValue('id'))
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
    showAddAnother={!!!data}
    buttonLabel={({
      addAnother: $t({ defaultMessage: 'Add another host' }),
      save: !!data ? $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' })
    })}
    onCancel={onClose}
    onSave={onSave}
  />

  return (
    <Drawer
      title={getTitle()}
      visible={visible}
      onClose={onClose}
      children={drawerContent}
      destroyOnClose={true}
      width={475}
      footer={drawerFooter}
    />
  )
}