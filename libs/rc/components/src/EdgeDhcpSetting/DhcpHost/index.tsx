import { useEffect, useRef, useState } from 'react'

import { Col, Form, Input, Row } from 'antd'
import _                         from 'lodash'
import { useIntl }               from 'react-intl'

import { Drawer }       from '@acx-ui/components'
import {
  EdgeDhcpHost,
  networkWifiIpRegExp
} from '@acx-ui/rc/utils'
import { getIntl, validationMessages } from '@acx-ui/utils'

import { HostTable } from './HostTable'

const initPoolData: Partial<EdgeDhcpHost> = {
  id: '0'
}

type DhcpHostTableProps = {
  value?: EdgeDhcpHost[]
  onChange?: (data: EdgeDhcpHost[]) => void
}

async function nameValidator (
  value: string,
  dhcpHosts: EdgeDhcpHost[],
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


export default function DHCPHostTable ({
  value,
  onChange
}: DhcpHostTableProps) {
  const { $t } = useIntl()
  const [form] = Form.useForm<EdgeDhcpHost>()
  const valueMap = useRef<Record<string, EdgeDhcpHost>>(value ? _.keyBy(value, 'id') : {})
  const [visible, setVisible] = useState(false)
  const values = () => Object.values(valueMap.current)
  const handleChanged = () => onChange?.(values())

  useEffect(() => {
    if(value) {
      valueMap.current = _.keyBy(value, 'id')
    }
  }, [value])

  const onAddOrEdit = (item?: EdgeDhcpHost) => {
    setVisible(true)
    if (item) form.setFieldsValue(item)
    else form.resetFields()
  }

  const onDelete = (items: EdgeDhcpHost[]) => {
    items.forEach(item => {
      delete valueMap.current[item.id]
    })
    handleChanged()
  }

  const onSubmit = (data: EdgeDhcpHost) => {
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
          name='hostName'
          label={$t({ defaultMessage: 'Host Name' })}
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

  return (
    <>
      <HostTable
        data={values()}
        onAdd={onAddOrEdit}
        onEdit={onAddOrEdit}
        onDelete={onDelete}
      />
      <Drawer
        title={$t({ defaultMessage: 'Add Host' })}
        visible={visible}
        onClose={onClose}
        mask={true}
        children={getContent}
        destroyOnClose={true}
        width={475}
        footer={<Drawer.FormFooter
          showAddAnother={!isEdit()}
          buttonLabel={({
            addAnother: $t({ defaultMessage: 'Add another host' }),
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
