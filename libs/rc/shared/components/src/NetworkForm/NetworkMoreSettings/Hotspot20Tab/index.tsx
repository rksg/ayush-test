import { useContext, useState } from 'react'

import { Form, InputNumber, Select, Space, Switch } from 'antd'
import { useIntl }                         from 'react-intl'

import { Drawer, Tooltip }                                                                                               from '@acx-ui/components'
// import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }                                                from '@acx-ui/feature-toggle'
// import { QuestionMarkCircleOutlined }                                                                            from '@acx-ui/icons'
import { Table, TableProps } from '@acx-ui/components'
import { Hotspot20AccessNetworkTypeEnum, Hotspot20ConnectionCapability, Hotspot20Ipv4AddressTypeEnum, NetworkSaveData } from '@acx-ui/rc/utils'

import NetworkFormContext                     from '../../NetworkFormContext'
import * as UI                                from '../styledComponents'
import { filterByAccess, hasAccess } from '@acx-ui/user'
import ConnectionCapabilityContent from './ConnectionCapabilityContent'

const { useWatch } = Form

export function Hotspot20Tab (props: {
  wlanData: NetworkSaveData | null
}) {
  const { $t } = useIntl()
  const { data } = useContext(NetworkFormContext)
  const { wlanData } = props
  const form = Form.useFormInstance()
  const [editMode, setEditMode] = useState(false)
  const [connectionCapabilityDrawerVisible, setConnectionCapabilityDrawerVisible] = useState(false)
  const [connectionCapabilities, setConnectionCapabilities] = useState([] as Hotspot20ConnectionCapability[])
  const [connectionCapability, setConnectionCapability] = useState({} as Hotspot20ConnectionCapability)
  const [drawerForm] = Form.useForm()

  const maxConnectionCapibility = 43;
  const labelWidth = '250px'

  const enableRfc5580Tooltip = $t({ defaultMessage:
    `Enabling RFC 5580 allows the RADIUS server to use user location data.` })

  // const [
  //   enableFastRoaming,
  //   enableAirtimeDecongestion,
  //   enableJoinRSSIThreshold,
  //   enableTransientClientManagement,
  //   enableOce
  // ] = [
  //   useWatch<boolean>(['wlan', 'advancedCustomization', 'enableFastRoaming']),
  //   useWatch<boolean>(['wlan', 'advancedCustomization', 'enableAirtimeDecongestion']),
  //   useWatch<boolean>(['wlan', 'advancedCustomization', 'enableJoinRSSIThreshold']),
  //   useWatch<boolean>(['wlan', 'advancedCustomization', 'enableTransientClientManagement']),
  //   useWatch<boolean>(['wlan', 'advancedCustomization',
  //     'enableOptimizedConnectivityExperience'])
  // ]
  // useEffect(() => {
  //   if(enableAirtimeDecongestion === true) {
  //     form.setFieldValue(['wlan', 'advancedCustomization', 'enableJoinRSSIThreshold'], false)
  //     form.setFieldValue(['wlan','advancedCustomization','joinRSSIThreshold'], undefined)
  //   }
  // }, [enableAirtimeDecongestion, enableJoinRSSIThreshold])
  
  const networkTypeOptions = Object.keys(Hotspot20AccessNetworkTypeEnum).map((key => {
    return (
      { value: key, label: Hotspot20AccessNetworkTypeEnum[key as keyof typeof Hotspot20AccessNetworkTypeEnum] }
    )
  }))

  const ipv4AddressTypeOptions = Object.keys(Hotspot20Ipv4AddressTypeEnum).map((key => {
    return (
      { value: key, label: Hotspot20Ipv4AddressTypeEnum[key as keyof typeof Hotspot20Ipv4AddressTypeEnum] }
    )
  }))

  const handleAddAction = () => {
    setConnectionCapabilityDrawerVisible(true)
    drawerForm.resetFields()
  }

  const handleDrawerClose = () => {
    setConnectionCapabilityDrawerVisible(false)
    setEditMode(false)
    setConnectionCapability({} as Hotspot20ConnectionCapability)
  }

  const actions = !editMode ? [{
    label: $t({ defaultMessage: 'Add Protocol'}),
    disabled: connectionCapabilities.length >= maxConnectionCapibility,
    onClick: handleAddAction
  }] : []

  const rowActions: TableProps<Hotspot20ConnectionCapability>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit'}),
    onClick: ([editRow]: Hotspot20ConnectionCapability[], clearSelection: () => void) => {
      setEditMode(true)
      setConnectionCapabilityDrawerVisible(true)
      setConnectionCapability(editRow)
    }
  },{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: ( [{ protocolNumber, port }]: Hotspot20ConnectionCapability[], clearSelection: () => void) => {
      setConnectionCapabilities([
        ...connectionCapabilities.filter((cap: Hotspot20ConnectionCapability) =>
          cap.protocolNumber !== protocolNumber && cap.port !== port
        )
      ])
    }
  }]

  const connectionCapabilityValidator = () => {
    if (!connectionCapabilities.length) {
      return Promise.reject($t({ defaultMessage: 'No connection capabilities were added yet'}))
    }

    return Promise.resolve()
  }

  const handleConnectionCapabilities = () => {
    setEditMode(false)

    const capabilityObject = {
      protocol: drawerForm.getFieldValue('protocol'),
      protocolNumber: drawerForm.getFieldValue('protocolNumber'),
      port: drawerForm.getFieldValue('port'),
      status: drawerForm.getFieldValue('status')
    }

    if (editMode) {
      const capabilityIdx = connectionCapabilities.findIndex((capability: Hotspot20ConnectionCapability) => 
        capability.port === connectionCapability.port  &&
        capability.protocolNumber === connectionCapability.protocolNumber
      )
      connectionCapabilities[capabilityIdx] = capabilityObject
      setConnectionCapabilities([
        ...connectionCapabilities
      ])
    } else {
      setConnectionCapabilities([
        ...connectionCapabilities, capabilityObject
      ])
    }
  }

  const tableColumns: TableProps<Hotspot20ConnectionCapability>['columns'] = [
    {
      title: $t({ defaultMessage: 'Protocol'}),
      dataIndex: 'protocol',
      key: 'protocol'
    },
    {
      title: $t({ defaultMessage: 'Protocol No.'}),
      dataIndex: 'protocolNumber',
      key: 'protocolNumber'
    },
    {
      title: $t({ defaultMessage: 'Port'}),
      dataIndex: 'port',
      key: 'port'
    },
    {
      title: $t({ defaultMessage: 'Status'}),
      dataIndex: 'status',
      key: 'status'
    }
  ]

  return (
    <>
      <UI.FieldLabel width={labelWidth}>
        <Space align='start'>
          {$t({ defaultMessage: 'Enable RFC 5580 (Location Data)' })}
          <Tooltip.Question
            title={enableRfc5580Tooltip}
            placement='right'
            iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
          />
        </Space>
        <Form.Item
          name='enableRfc5580'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}/>
      </UI.FieldLabel>

      <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
        <UI.LabelOfInput style={{ left: '165px' }}>
          { $t({ defaultMessage: 'Minutes' }) }
        </UI.LabelOfInput>
        <Form.Item
          label={ $t({ defaultMessage: 'Accounting Interim Updates' }) }
          name='accountingInterimUpdates'
          initialValue={5}
          rules={[{
            type: 'number', max: 1440, min: 0,
            required: true,
            message: $t({
              defaultMessage: 'Accounting Interim Updates must be between 0 and 1440'
            })
          }]}
          style={{ marginBottom: '15px' }}
          children={<InputNumber style={{ width: '150px' }} />}
        />
      </div>

      <UI.FieldLabel width={labelWidth}>
        { $t({ defaultMessage: 'Internet Access' }) }
        <Form.Item
          name={['hotspot20Settings','allowInternetAccess']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={true}
          children={<Switch />}
        />
      </UI.FieldLabel>                                   

      <Form.Item
        label={$t({ defaultMessage: 'Access Network Type' })}
        name={['hotspot20Settings', 'accessNetworkType']}
        rules={[{ required: true } ]}
        initialValue={Hotspot20AccessNetworkTypeEnum.PRIVATE}
        children={
          <Select
            style={{ width: '280px', height: '30px', fontSize: '11px' }}
            options={networkTypeOptions}
          />
        }
      />

      <Form.Item
        label={$t({ defaultMessage: 'IPv4 Address' })}
        name={['hotspot20Settings', 'ipv4AddressType']}
        rules={[{ required: true } ]}
        initialValue={Hotspot20Ipv4AddressTypeEnum.SINGLE_NATED_PRIVATE}
        children={
          <Select
            style={{ width: '280px', height: '30px', fontSize: '11px' }}
            options={ipv4AddressTypeOptions}
          />
        }
      />

      <Form.Item
        label={$t({ defaultMessage: 'Connection Capabilities ({number})' }, {
          number: connectionCapabilities.length
        })}
        rules={[
          { validator: () => connectionCapabilityValidator() }
        ]}
        children={<></>}
      />
      <div>
        { editMode ? <Table
          columns={tableColumns}
          dataSource={connectionCapabilities as Hotspot20ConnectionCapability[]}
        /> : <Table
          columns={tableColumns}
          dataSource={connectionCapabilities as Hotspot20ConnectionCapability[]}
          rowKey='ruleName'
          actions={filterByAccess(actions)}
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'radio' }}
        />}
      </div>
      

      <Drawer
        title={editMode
          ? $t({ defaultMessage: 'Edit Protocol' })
          : $t({ defaultMessage: 'Add Protocol' })
        }
        visible={connectionCapabilityDrawerVisible}
        destroyOnClose={true}
        onClose={handleDrawerClose}
        children={<ConnectionCapabilityContent
          drawerForm={drawerForm}
        />}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            onCancel={handleDrawerClose}
            onSave={async () => {
              try {
                await drawerForm.validateFields()
                handleConnectionCapabilities()
                drawerForm.resetFields()
                handleDrawerClose()
              } catch (error) {
                if (error instanceof Error) throw error
              }
            }}
          />
        }
        width={400}
      />      
    </>
  )
}
