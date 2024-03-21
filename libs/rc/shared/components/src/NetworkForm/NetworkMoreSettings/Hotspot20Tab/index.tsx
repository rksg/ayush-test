import { useContext, useState } from 'react'

import { Form, InputNumber, Select, Space, Switch } from 'antd'
import _                                            from 'lodash'
import { useIntl }                                  from 'react-intl'

import { Drawer, Tooltip } from '@acx-ui/components'
// import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }                                                from '@acx-ui/feature-toggle'
// import { QuestionMarkCircleOutlined }                                                                            from '@acx-ui/icons'
import { Table, TableProps }                      from '@acx-ui/components'
import {
  Hotspot20AccessNetworkTypeEnum,
  Hotspot20ConnectionCapability,
  Hotspot20ConnectionCapabilityStatusEnum,
  Hotspot20Ipv4AddressTypeEnum, NetworkSaveData } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import NetworkFormContext from '../../NetworkFormContext'
import * as UI            from '../styledComponents'

import ConnectionCapabilityDrawer from './ConnectionCapabilityDrawer'

const { useWatch } = Form

const defaultConnectionCapabilities = [
  {
    protocol: 'ICMP',
    protocolNumber: 1,
    port: 0,
    status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
  },
  {
    protocol: 'FTP',
    protocolNumber: 6,
    port: 20,
    status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
  },
  {
    protocol: 'SSH',
    protocolNumber: 6,
    port: 22,
    status: Hotspot20ConnectionCapabilityStatusEnum.OPEN
  },
  {
    protocol: 'HTTP',
    protocolNumber: 6,
    port: 80,
    status: Hotspot20ConnectionCapabilityStatusEnum.OPEN
  },
  {
    protocol: 'Used by TLS VPN',
    protocolNumber: 6,
    port: 443,
    status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
  },
  {
    protocol: 'Used by PPTP VPNs',
    protocolNumber: 6,
    port: 1723,
    status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
  },
  {
    protocol: 'VoIP',
    protocolNumber: 6,
    port: 5060,
    status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
  },
  {
    protocol: 'VoIP',
    protocolNumber: 17,
    port: 5060,
    status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
  },
  {
    protocol: 'Used by IKEv2 (IPsec VPN)',
    protocolNumber: 17,
    port: 500,
    status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
  },
  {
    protocol: 'IPsec VPN',
    protocolNumber: 17,
    port: 4500,
    status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
  },
  {
    protocol: 'ESP',
    protocolNumber: 50,
    port: 0,
    status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
  }
] as Hotspot20ConnectionCapability[]

export function Hotspot20Tab (props: {
  wlanData: NetworkSaveData | null
}) {
  const { $t } = useIntl()
  const { data } = useContext(NetworkFormContext)
  const { wlanData } = props
  const form = Form.useFormInstance()
  const [editMode, setEditMode] = useState(false)
  const [connectionCapabilityDrawerVisible, setConnectionCapabilityDrawerVisible] = useState(false)
  const [connectionCapabilities, setConnectionCapabilities] =
    useState(defaultConnectionCapabilities as Hotspot20ConnectionCapability[])
  const [connectionCapability, setConnectionCapability] =
    useState({} as Hotspot20ConnectionCapability)
  const [drawerForm] = Form.useForm()

  const maxConnectionCapibility = 43
  const labelWidth = '250px'

  const enableRfc5580Tooltip = $t({ defaultMessage:
    'Enabling RFC 5580 allows the RADIUS server to use user location data.' })

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
      { value: key,
        label: Hotspot20AccessNetworkTypeEnum[key as keyof typeof Hotspot20AccessNetworkTypeEnum] }
    )
  }))

  const ipv4AddressTypeOptions = Object.keys(Hotspot20Ipv4AddressTypeEnum).map((key => {
    return (
      { value: key,
        label: Hotspot20Ipv4AddressTypeEnum[key as keyof typeof Hotspot20Ipv4AddressTypeEnum] }
    )
  }))

  const handleAddAction = () => {
    setConnectionCapabilityDrawerVisible(true)
    drawerForm.resetFields()
  }

  const actions = !editMode ? [{
    label: $t({ defaultMessage: 'Add Protocol' }),
    disabled: connectionCapabilities.length >= maxConnectionCapibility,
    onClick: handleAddAction
  }] : []

  const rowActions: TableProps<Hotspot20ConnectionCapability>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: ([editRow]: Hotspot20ConnectionCapability[], clearSelection: () => void) => {
      setEditMode(true)
      setConnectionCapabilityDrawerVisible(true)
      setConnectionCapability(editRow)
      clearSelection()
    }
  },{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: ( [{ protocolNumber, port }]: Hotspot20ConnectionCapability[],
      clearSelection: () => void) => {
      setConnectionCapabilities([
        ...connectionCapabilities.filter((cap: Hotspot20ConnectionCapability) =>
          cap.protocolNumber !== protocolNumber && cap.port !== port
        )
      ])
      clearSelection()
    }
  }]

  const connectionCapabilityValidator = () => {
    if (!connectionCapabilities.length) {
      return Promise.reject($t({ defaultMessage: 'No connection capabilities were added yet' }))
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
      const capabilityIdx = connectionCapabilities
        .findIndex((capability: Hotspot20ConnectionCapability) =>
          capability.port === connectionCapability.port &&
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

  const handleCapabilityClose = () => {
    setConnectionCapabilityDrawerVisible(false)
    setEditMode(false)
    setConnectionCapability({} as Hotspot20ConnectionCapability)
  }

  const tableColumns: TableProps<Hotspot20ConnectionCapability>['columns'] = [
    {
      title: $t({ defaultMessage: 'Protocol' }),
      dataIndex: 'protocol',
      key: 'protocol',
      width: 180
    },
    {
      title: $t({ defaultMessage: 'Protocol No.' }),
      dataIndex: 'protocolNumber',
      key: 'protocolNumber',
      width: 130,
      render: (_data, row) => {
        return row.protocolNumber && getProtocolNumberDisplay(row.protocolNumber)
      }
    },
    {
      title: $t({ defaultMessage: 'Port' }),
      dataIndex: 'port',
      key: 'port',
      width: 80
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (_data, row) => {
        return row.status && `${_.startCase(row.status)}`
      }
    }
  ]

  const getRowKey = (record: Hotspot20ConnectionCapability): string => {
    return '' + record.protocolNumber?.toString() + record.port?.toString()
  }

  const getProtocolNumberDisplay = (protocolNumber: number): string => {
    return getProtocolName(protocolNumber) ??
      `${protocolNumber} (${getProtocolName(protocolNumber)})`
  }

  const getProtocolName = (protocolNumber: number): string => {
    switch (protocolNumber) {
      case 1:
        return 'ICMP'
      case 6:
        return 'TCP'
      case 17:
        return 'UDP'
      case 50:
        return 'ESP'
      default:
        return ''
    }
  }

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
          label={$t({ defaultMessage: 'Accounting Interim Updates' })}
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

      <div style={{ marginBottom: '-53px' }}>
        <Form.Item
          label={$t({ defaultMessage: 'Connection Capabilities ({number})' }, {
            number: connectionCapabilities.length
          })}
          rules={[
            { validator: () => connectionCapabilityValidator() }
          ]}
          children={<></>}
        />
      </div>

      <div style={{ width: '550px' }}>
        { editMode ? <Table
          columns={tableColumns}
          dataSource={connectionCapabilities as Hotspot20ConnectionCapability[]}
          rowKey={getRowKey}
          pagination={{ defaultPageSize: connectionCapabilities?.length, hideOnSinglePage: true }}
        /> : <Table
          columns={tableColumns}
          dataSource={connectionCapabilities as Hotspot20ConnectionCapability[]}
          rowKey={getRowKey}
          actions={filterByAccess(actions)}
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'radio' }}
          pagination={{ defaultPageSize: connectionCapabilities?.length, hideOnSinglePage: true }}
        />}
      </div>

      <ConnectionCapabilityDrawer
        visible={connectionCapabilityDrawerVisible}
        editMode={editMode}
        drawerForm={drawerForm}
        handleDrawerSave={handleConnectionCapabilities}
        handleDrawerClose={handleCapabilityClose}
      />
    </>
  )
}
