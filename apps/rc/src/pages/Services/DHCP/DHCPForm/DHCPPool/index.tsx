import { useState, useRef } from 'react'

import { Col, Form, Input, InputNumber, Row, Select, Space, Switch } from 'antd'
import TextArea                                                      from 'antd/lib/input/TextArea'
import _                                                             from 'lodash'
import { useIntl }                                                   from 'react-intl'

import { Drawer }      from '@acx-ui/components'
import {
  DHCPPool,
  LeaseUnit,
  networkWifiIpRegExp,
  subnetMaskIpRegExp,
  validateNetworkBaseIp,
  countIpMaxRange,
  countIpSize,
  IpInSubnetPool,
  IpUtilsService,
  DHCPConfigTypeEnum
} from '@acx-ui/rc/utils'
import { getIntl, validationMessages } from '@acx-ui/utils'

import { PoolTable } from './PoolTable'


const initPoolData: Partial<DHCPPool> = {
  id: '0',
  dhcpOptions: [],
  leaseTime: 24,
  leaseUnit: LeaseUnit.HOURS,
  vlanId: 300
}

type DHCPPoolTableProps = {
  value?: DHCPPool[]
  onChange?: (data: DHCPPool[]) => void,
  dhcpMode: DHCPConfigTypeEnum,
  isDefaultService: boolean | undefined
}

const { Option } = Select

async function nameValidator (
  value: string,
  dhcpPools: DHCPPool[],
  currentId: DHCPPool['id']
) {
  const { $t } = getIntl()
  const matched = dhcpPools.find((item) => item.name === value && currentId !== item.id)
  if (!matched) return

  const entityName = $t({ defaultMessage: 'Pool Name' })
  return Promise.reject($t(validationMessages.duplication, {
    entityName: entityName,
    key: $t({ defaultMessage: 'name' }),
    extra: ''
  }))
}

async function vlanValidator (
  vlanID: number,
  dhcpPools: DHCPPool[],
  currentId: DHCPPool['id'],
  wiredClients: boolean,
  dhcpMode: DHCPConfigTypeEnum
) {
  const { $t } = getIntl()
  const sameVlan = dhcpPools.find((item) => item.vlanId === vlanID && currentId !== item.id)
  if (sameVlan) return Promise.reject($t({ defaultMessage: 'Same VLAN IDs already exists' }))

  if(!wiredClients && vlanID===1){
    return Promise.reject($t({
      defaultMessage: 'VLAN ID can\'t be 1 when NOT allow wired clients' }))
  }

  if(dhcpMode === DHCPConfigTypeEnum.MULTIPLE && vlanID === 1){
    return Promise.reject($t({
      defaultMessage: 'The pool has VLAN ID 1 which is not allowed in \'Multiple AP DHCP\' mode.'
    }))
  }
  return
}


async function subnetValidator (
  subnetAddress: string,
  dhcpPools: DHCPPool[],
  currentId: DHCPPool['id']
) {
  const { $t } = getIntl()
  const sameSubnet = dhcpPools.find(
    (item) =>
      item.subnetAddress === subnetAddress && currentId !== item.id)
  if (sameSubnet)
    return Promise.reject($t({ defaultMessage: 'Same Subnet Address already exists' }))

  return
}


export default function DHCPPoolTable ({
  value,
  onChange,
  dhcpMode,
  isDefaultService
}: DHCPPoolTableProps) {
  const { $t } = useIntl()
  const [form] = Form.useForm<DHCPPool>()
  const valueMap = useRef<Record<string, DHCPPool>>(value ? _.keyBy(value, 'id') : {})
  const [visible, setVisible] = useState(false)
  const [vlanEnable, setVlanEnable] = useState(true)
  const [leaseUnit, setLeaseUnit] = useState(LeaseUnit.HOURS)
  const [previousVal, setPreviousVal] = useState(300)
  const values = () => Object.values(valueMap.current)

  const handleChanged = () => onChange?.(values())

  const onAddOrEdit = (item?: DHCPPool) => {
    setVisible(true)
    if (item) {
      if(item.vlanId===1){
        item.allowWired = true
        setVlanEnable(false)
      }else{
        item.allowWired = false
        setVlanEnable(true)
      }
      form.setFieldsValue(item)
      setLeaseUnit(item.leaseUnit||LeaseUnit.HOURS)
    }
    else form.resetFields()
  }

  const onDelete = (items: DHCPPool[]) => {
    items.forEach(item => {
      delete valueMap.current[item.id]
    })
    handleChanged()
  }

  const onSubmit = (data: DHCPPool) => {
    let id = data.id
    if (id === initPoolData.id) { id = data.id = '_NEW_'+String(Date.now()) }
    data.numberOfHosts = IpUtilsService.countIpRangeSize(data.startIpAddress, data.endIpAddress)
    valueMap.current[id] = data
    handleChanged()
    form.resetFields()
  }

  const onClose = () => {
    setVisible(false)
  }

  const isEdit = () => form.getFieldValue('id')!=='0' && !_.isUndefined(form.getFieldValue('id'))

  const getContent = <Form
    form={form}
    layout='vertical'
    onFinish={onSubmit}
    initialValues={initPoolData}
  >
    <Form.Item name='id' children={<></>} hidden />

    <Row>
      <Col span={12}>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Pool Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (_, value) => nameValidator(value, values(), form.getFieldValue('id')) }
          ]}
          validateFirst
          hasFeedback
          children={<Input/>}
        />
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Description' })}
          rules={[
            { max: 255 }
          ]}
          children={<TextArea />}
        />
        <Form.Item
          name='allowWired'
          label={$t({ defaultMessage: 'Allow AP wired clients' })}
          valuePropName='checked'
          children={<Switch
            onChange={(checked: boolean)=>{
              if(checked){
                form.setFieldsValue({ vlanId: 1 })
                setVlanEnable(false)
              } else {
                form.setFieldsValue({ vlanId: previousVal })
                setVlanEnable(true)
              }
            }}/>}
        />
        <Form.Item
          name='subnetAddress'
          label={$t({ defaultMessage: 'Subnet Address' })}
          rules={[
            { required: true },
            { validator: (_, value) => networkWifiIpRegExp(value) },
            { validator: (_, value) => subnetValidator(value, values(), form.getFieldValue('id')) },
            // eslint-disable-next-line max-len
            { validator: (_, value) => validateNetworkBaseIp(value, form.getFieldValue('subnetMask')) }
          ]}
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
          name='startIpAddress'
          label={$t({ defaultMessage: 'Start Host Address' })}
          rules={[
            { required: true },
            { validator: (_, value) => networkWifiIpRegExp(value) },
            { validator: (_, value) => {
              if (!value) {
                return Promise.reject($t(validationMessages.ipNotInSubnetPool))
              }
              return IpInSubnetPool(
                value,
                form.getFieldValue('subnetAddress'),
                form.getFieldValue('subnetMask'))
            } }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='endIpAddress'
          label={$t({ defaultMessage: 'End Host Address' })}
          rules={[
            { required: true },
            { validator: (_, value) => networkWifiIpRegExp(value) },
            { validator: (_, value) => {
              if (!value) {
                return Promise.reject($t(validationMessages.ipRangeInvalid))
              }
              return countIpMaxRange(form.getFieldValue('startIpAddress'), value)
            } },
            { validator: (_, value) => {
              if(dhcpMode===DHCPConfigTypeEnum.MULTIPLE){
                if(countIpSize(form.getFieldValue('startIpAddress'), value) <= 10){
                  // eslint-disable-next-line max-len
                  return Promise.reject($t({ defaultMessage: 'Needs to reserve 10 IP addresses per pool for DHCP Servers and gateways in the Multiple mode' }))
                }
              }
              else if(dhcpMode===DHCPConfigTypeEnum.HIERARCHICAL){
                if(countIpSize(form.getFieldValue('startIpAddress'), value) <= 2){
                  // eslint-disable-next-line max-len
                  return Promise.reject($t({ defaultMessage: 'Needs to reserve 2 IP addresses per pool for DHCP Servers and gateways in the Hierarchical mode' }))
                }
              }
              return Promise.resolve()
            }
            }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='primaryDnsIp'
          label={$t({ defaultMessage: 'Primary DNS IP' })}
          rules={[
            { validator: (_, value) => networkWifiIpRegExp(value) }
          ]}
          children={<Input />}
        />
        <Form.Item
          name='secondaryDnsIp'
          label={$t({ defaultMessage: 'Secondary DNS IP' })}
          rules={[
            { validator: (_, value) => networkWifiIpRegExp(value) },
            { validator: (_, value) => {
              if(value && !form.getFieldValue('primaryDnsIp')){
                return Promise.reject($t({ defaultMessage:
                  'Please fill the Primary DNS IP field first' }))
              }
              return Promise.resolve()
            } }
          ]}
          children={<Input />}
        />
        <Form.Item label={$t({ defaultMessage: 'Lease Time' })}>
          <Space align='start'>
            <Form.Item
              noStyle
              name='leaseTime'
              label={$t({ defaultMessage: 'Lease Time' })}
              validateTrigger='onChange'
              rules={[
                { required: true },
                { validator: (_, value) => {
                  if(value<(leaseUnit === LeaseUnit.HOURS?1:5) ||
                    value >(leaseUnit === LeaseUnit.HOURS?24:1440)){
                    return Promise.reject($t({ defaultMessage:
                      'Value must between 5-1440 minutes or 1-24 hours' }))
                  }
                  return Promise.resolve()
                } }
              ]}
            >
              <InputNumber data-testid='leaseTime'
                min={leaseUnit === LeaseUnit.HOURS?1:5}
                max={leaseUnit === LeaseUnit.HOURS?24:1440}
                style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item noStyle name='leaseUnit'>
              <Select data-testid='leaseType' onChange={(value)=>setLeaseUnit(value)}>
                <Option value={'leaseTimeHours'}>{$t({ defaultMessage: 'Hours' })}</Option>
                <Option value={'leaseTimeMinutes'}>{$t({ defaultMessage: 'Minutes' })}</Option>
              </Select>
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item
          name='vlanId'
          rules={[
            { required: true },
            { validator: (_, value) => vlanValidator(
              value,
              values(),
              form.getFieldValue('id'),
              form.getFieldValue('allowWired'), dhcpMode) }
          ]}

          label={$t({ defaultMessage: 'VLAN' })}
          children={<InputNumber
            disabled={!vlanEnable}
            onChange={(val)=>{
              setPreviousVal(val)
            }}
            min={1}
            max={4094} />}
        />
        <Form.Item name='dhcpOptions' children={<></>} style={{ height: 0 }} />
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
        isDefaultService={isDefaultService}
      />
      <Drawer
        title={isEdit()? $t({ defaultMessage: 'Edit DHCP Pool' }):
          $t({ defaultMessage: 'Add DHCP Pool' })}
        visible={visible}
        onClose={onClose}
        children={getContent}
        destroyOnClose={true}
        width={900}
        footer={<Drawer.FormFooter
          showAddAnother={!isEdit()&&values().length<3}
          buttonLabel={({
            addAnother: $t({ defaultMessage: 'Add another pool' }),
            save: isEdit() ? $t({ defaultMessage: 'Update' }) : $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={async (addAnotherPoolChecked: boolean) => {
            try {
              await form.validateFields()
              form.submit()

              if (!addAnotherPoolChecked) {
                onClose()
              }
            } catch (error) {
              // if (error instanceof Error) throw error
            }
          }}
        />
        }
      />
    </>
  )
}
