
import { useState, useContext } from 'react'

import { Checkbox, Col, Form, Input, InputNumber, Row, Select, Space, Switch } from 'antd'
import TextArea                                                                from 'antd/lib/input/TextArea'
import _                                                                       from 'lodash'
import { useIntl }                                                             from 'react-intl'

import { Button }                                            from '@acx-ui/components'
import { Drawer }                                            from '@acx-ui/components'
import { DHCPPool, networkWifiIpRegExp, subnetMaskIpRegExp } from '@acx-ui/rc/utils'
import { validationMessages }                                from '@acx-ui/utils'

import DHCPFormContext from '../DHCPFormContext'

import { PoolOption } from './PoolOption'
import { PoolTable }  from './PoolTable'


const initPoolData: Partial<DHCPPool> = {
  id: 0,
  allowWired: false,
  dhcpOptions: [],
  leaseTime: 24,
  leaseUnit: 'Hours',
  vlan: 300
}
export default function DHCPPoolMain () {
  const { $t } = useIntl()
  const intl = useIntl()
  const { Option } = Select
  const [form] = Form.useForm<DHCPPool>()
  const [ addOn, setAddOn ] = useState(false)
  const { updateSaveState, saveState } = useContext(DHCPFormContext)
  const nameValidator = async (value: string) => {
    const id = form.getFieldValue('id')
    if(_.find(saveState?.dhcpPools, (item)=>{return item.name === value && id !== item.id})){
      const entityName = intl.$t({ defaultMessage: 'Pool Name' })
      const key = 'name'
      return Promise.reject(intl.$t(validationMessages.duplication, { entityName, key }))
    }
    return Promise.resolve()
  }
  const updateSaveData = (data: DHCPPool) => {
    if (data.id === initPoolData.id) {
      data.id = Date.now()
    }

    const findIndex = saveState?.dhcpPools
      .findIndex(item => data.id === item.id)

    //edit
    if (findIndex > -1) { saveState.dhcpPools[findIndex] = data }
    else saveState?.dhcpPools?.push({ ...data })

    //@FIXME: DELETE ...form.getFieldsValue()
    updateSaveState?.({ ...saveState })
    if (addOn) { return form.resetFields() }
    onClose()
  }
  const [visible, setVisible] = useState(false)
  const onClose = () => {
    updateSaveState?.({ ...saveState })
    form.resetFields()
    setVisible(false)
  }

  const isEdit = () => form.getFieldValue('id') !== 0

  const getContent = <Form
    form={form}
    layout='vertical'
    onFinish={updateSaveData}
    initialValues={initPoolData}
  >
    <Form.Item name='id' hidden />

    <Row>
      <Col span={12}>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Pool Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (_, value) => nameValidator(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Description' })}
          children={<TextArea />}
        />
        <Form.Item
          name='allowWired'
          label={$t({ defaultMessage: 'Allow AP wired clients' })}
          valuePropName='checked'
          children={<Switch />}
        />
        <Form.Item
          name='ip'
          label={$t({ defaultMessage: 'IP Address' })}
          rules={[
            { required: true },
            { validator: (_, value) => networkWifiIpRegExp(value) }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='mask'
          label={$t({ defaultMessage: 'Subnet Mask' })}
          rules={[
            { required: true },
            { validator: (_, value) => subnetMaskIpRegExp(value) }
          ]}
          children={<Input />}
        />
        <Form.Item label={$t({ defaultMessage: 'Excluded Range' })}>
          <Space align='start'>
            <Form.Item name='excludedRangeStart'
              rules={[
                { required: false },
                { validator: (_, value) => networkWifiIpRegExp(value) }
              ]}
              children={<Input/>}
            />
            <div style={{ marginTop: 7 }}>-</div>
            <Form.Item
              name='excludedRangeEnd'
              rules={[
                { required: false },
                { validator: (_, value) => networkWifiIpRegExp(value) }
              ]}
              children={<Input />}
            />
          </Space>
        </Form.Item>
        <Form.Item
          name='primaryDNS'
          label={$t({ defaultMessage: 'Primary DNS IP' })}
          rules={[
            { validator: (_, value) => networkWifiIpRegExp(value) }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='secondaryDNS'
          label={$t({ defaultMessage: 'Secondary DNS IP' })}
          rules={[
            { validator: (_, value) => networkWifiIpRegExp(value) }
          ]}
          children={<Input />}
        />
        <Form.Item label={$t({ defaultMessage: 'Lease Time' })}>
          <Space align='start'>
            <Form.Item
              noStyle
              name='leaseTime'
              label={$t({ defaultMessage: 'Lease Time' })}
              rules={[
                { required: true }
              ]}
            >
              <InputNumber data-testid='leaseTime' min={1} max={1440} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item noStyle name='leaseUnit'>
              <Select data-testid='leaseType'>
                <Option value={'Days'}>{$t({ defaultMessage: 'Days' })}</Option>
                <Option value={'Hours'}>{$t({ defaultMessage: 'Hours' })}</Option>
                <Option value={'Minutes'}>{$t({ defaultMessage: 'Minutes' })}</Option>
              </Select>
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item
          name='vlan'
          rules={[
            { required: true }
          ]}
          label={$t({ defaultMessage: 'VLAN' })}
          children={<InputNumber min={1} max={4094} style={{ width: '100%' }} />}
        />
        <Form.Item name='dhcpOptions' style={{ height: 0 }}></Form.Item>
      </Col>
    </Row>
    <Row>
      <Col span={24}>
        <Form.Item
          name='dhcpOptions'
          label={$t({ defaultMessage: 'Add DHCP options:' })}
          children={<PoolOption />}
        />
      </Col>
    </Row>
    <Row align='middle'>
      <Col span={8}>
        {!isEdit() && <Checkbox
          checked={addOn}
          onChange={()=>{setAddOn(!addOn)}}
          children={$t({ defaultMessage: 'Add other pool' })}
        />}
      </Col>
      <Col span={16}>
        <Space style={{ flexDirection: 'row-reverse', display: 'flex' }}>
          <Button key='add'
            htmlType='submit'
            type='secondary'
            children={isEdit() ? $t({ defaultMessage: 'Update' }) : $t({ defaultMessage: 'Add' })}
          />
          <Button key='Cancel'
            type='link'
            onClick={onClose}
            children={$t({ defaultMessage: 'Cancel' })}
          />
        </Space>
      </Col>
    </Row>
  </Form>

  return (
    <>
      <PoolTable
        poolData={saveState?.dhcpPools || []}
        updatePoolData={(poolsData: DHCPPool[]) => {
          updateSaveState({ ...saveState, ...{ dhcpPools: poolsData } })
        }}
        showPoolForm={(selectedPool?: DHCPPool) => {
          setVisible(true)
          setAddOn(false)
          form.setFieldsValue(selectedPool ?? initPoolData)
        }}
      />
      <Drawer
        title={$t({ defaultMessage: 'Add DHCP Pool' })}
        visible={visible}
        onClose={onClose}
        mask={true}
        children={getContent}
        destroyOnClose={true}
        width={900}
      />
    </>

  )

}
