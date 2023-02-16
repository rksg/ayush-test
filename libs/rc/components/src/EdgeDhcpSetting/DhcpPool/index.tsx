import { useRef, useState } from 'react'

import { Col, Form, Input, Row } from 'antd'
import _                         from 'lodash'
import { useIntl }               from 'react-intl'

import { Drawer }      from '@acx-ui/components'
import {
  countIpMaxRange, EdgeDhcpPool,
  networkWifiIpRegExp,
  subnetMaskIpRegExp
} from '@acx-ui/rc/utils'
import { getIntl, validationMessages } from '@acx-ui/utils'

import { PoolTable } from './PoolTable'

const initPoolData: Partial<EdgeDhcpPool> = {
  id: '0'
}

type DhcpPoolTableProps = {
  value?: EdgeDhcpPool[]
  onChange?: (data: EdgeDhcpPool[]) => void
}

async function nameValidator (
  value: string,
  dhcpPools: EdgeDhcpPool[],
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


export default function DhcpPoolTable ({
  value,
  onChange
}: DhcpPoolTableProps) {
  const { $t } = useIntl()
  const [form] = Form.useForm<EdgeDhcpPool>()
  const valueMap = useRef<Record<string, EdgeDhcpPool>>(value ? _.keyBy(value, 'id') : {})
  const [visible, setVisible] = useState(false)

  const values = () => Object.values(valueMap.current)

  const handleChanged = () => onChange?.(values())

  const onAddOrEdit = (item?: EdgeDhcpPool) => {
    setVisible(true)
    if (item) form.setFieldsValue(item)
    else form.resetFields()
  }

  const onDelete = (items: EdgeDhcpPool[]) => {
    items.forEach(item => {
      delete valueMap.current[item.id]
    })
    handleChanged()
  }

  const onSubmit = (data: EdgeDhcpPool) => {
    let id = data.id
    if (id === initPoolData.id) { id = data.id = '_NEW_'+String(Date.now()) }
    valueMap.current[id] = data
    handleChanged()
    form.resetFields()
  }

  const onClose = () => {
    setVisible(false)
  }

  const onSave = async (addAnotherPoolChecked: boolean) => {
    try {
      await form.validateFields()
      form.submit()

      if (!addAnotherPoolChecked) {
        onClose()
      }
    } catch (error) {
      // if (error instanceof Error) throw error
    }
  }

  const isEdit = () => form.getFieldValue('id')!=='0' && !_.isUndefined(form.getFieldValue('id'))

  const getContent = <Form
    form={form}
    layout='vertical'
    onFinish={onSubmit}
    initialValues={initPoolData}
  >
    <Form.Item name='id' hidden />

    <Row>
      <Col span={12}>
        <Form.Item
          name='poolName'
          label={$t({ defaultMessage: 'Pool Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (_, value) => nameValidator(value, values(), form.getFieldValue('id')) }
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
            { validator: (_, value) => countIpMaxRange(
              form.getFieldValue('poolStartIp'), value)
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

  return (
    <>
      <PoolTable
        data={values()}
        onAdd={onAddOrEdit}
        onEdit={onAddOrEdit}
        onDelete={onDelete}
      />
      <Drawer
        title={$t({ defaultMessage: 'Add DHCP Pool' })}
        visible={visible}
        onClose={onClose}
        mask={true}
        children={getContent}
        destroyOnClose={true}
        width={475}
        footer={<Drawer.FormFooter
          showAddAnother={!isEdit()}
          buttonLabel={({
            addAnother: $t({ defaultMessage: 'Add another pool' }),
            save: isEdit() ? $t({ defaultMessage: 'Update' }) : $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={onSave}
        />
        }
      />
    </>
  )
}
