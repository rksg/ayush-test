
import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { Drawer }                                                                from '@acx-ui/components'
import { EdgeDhcpPool, IpInSubnetPool, networkWifiIpRegExp, subnetMaskIpRegExp } from '@acx-ui/rc/utils'
import { getIntl, validationMessages }                                           from '@acx-ui/utils'

import { useDrawerControl } from '..'

interface PoolDrawerProps {
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  onAddOrEdit: (item: EdgeDhcpPool) => void
  data?: EdgeDhcpPool
  allPool?: EdgeDhcpPool[]
}

const initPoolData: Partial<EdgeDhcpPool> = {
  id: '0'
}

async function nameValidator (
  value: string,
  dhcpPools: EdgeDhcpPool[] = [],
  currentId: EdgeDhcpPool['id']
) {
  const { $t } = getIntl()
  const matched = dhcpPools.find((item) => item.poolName === value && currentId !== item.id)
  if (!matched) return

  const entityName = $t({ defaultMessage: 'Pool Name' })
  return Promise.reject($t(validationMessages.duplication, {
    entityName: entityName,
    key: $t({ defaultMessage: 'name' }),
    extra: ''
  }))
}

export const PoolDrawer = (props: PoolDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, onAddOrEdit, data, allPool } = props

  const { form, onSubmit, onSave, onClose } = useDrawerControl({
    visible,
    setVisible,
    data,
    initData: initPoolData,
    onAddOrEdit
  })

  const getTitle = () => {
    return $t({ defaultMessage: '{operation} DHCP Pool' },
      { operation: !!data ? $t({ defaultMessage: 'Edit' }) :
        $t({ defaultMessage: 'Add' }) })
  }


  const drawerContent = <Form
    form={form}
    layout='vertical'
    onFinish={onSubmit}
    initialValues={initPoolData}
  >
    <Row>
      <Col span={12}>
        <Form.Item
          name='poolName'
          label={$t({ defaultMessage: 'Pool Name' })}
          rules={[
            { required: true },
            { max: 15 },
            {
              validator: (_, value) =>
                nameValidator(value, allPool, form.getFieldValue('id'))
            }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item
          name='subnetMask'
          label={$t({ defaultMessage: 'Subnet Mask' })}
          rules={[
            { required: true },
            { validator: (_, value) => subnetMaskIpRegExp(value) }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='poolStartIp'
          label={$t({ defaultMessage: 'Start IP Address' })}
          rules={[
            { required: true },
            { validator: (_, value) => networkWifiIpRegExp(value) }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='poolEndIp'
          label={$t({ defaultMessage: 'End IP Address' })}
          rules={[
            { required: true },
            { validator: (_, value) => networkWifiIpRegExp(value) },
            {
              validator: (_, value) => IpInSubnetPool(
                value,
                form.getFieldValue('poolStartIp'),
                form.getFieldValue('subnetMask')
              )
            }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='gatewayIp'
          label={$t({ defaultMessage: 'Gateway' })}
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
      addAnother: $t({ defaultMessage: 'Add another pool' }),
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