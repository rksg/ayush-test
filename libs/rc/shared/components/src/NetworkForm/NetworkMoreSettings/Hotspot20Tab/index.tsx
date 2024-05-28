import { useContext, useEffect, useRef, useState } from 'react'

import { Form, InputNumber, Select, Switch } from 'antd'
import _, { cloneDeep }                      from 'lodash'
import { useIntl }                           from 'react-intl'

import { Table, TableProps }     from '@acx-ui/components'
import {
  Hotspot20AccessNetworkTypeEnum,
  Hotspot20ConnectionCapability,
  Hotspot20ConnectionCapabilityStatusEnum,
  Hotspot20Ipv4AddressTypeEnum } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import NetworkFormContext from '../../NetworkFormContext'
import * as UI            from '../styledComponents'

import ConnectionCapabilityDrawer from './ConnectionCapabilityDrawer'

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

export function Hotspot20Tab () {
  const { $t } = useIntl()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data } = useContext(NetworkFormContext)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const form = Form.useFormInstance()
  const [editMode, setEditMode] = useState(false)
  const [connectionCapabilityDrawerVisible, setConnectionCapabilityDrawerVisible] = useState(false)
  const [connectionCapabilities, setConnectionCapabilities] =
    useState([] as Hotspot20ConnectionCapability[])
  const [selectedConnectionCapability, setSelectedConnectionCapability] =
    useState(null as unknown as Hotspot20ConnectionCapability)
  const connectionCapibilityMap = useRef<Map<string, number>>()

  const maxConnectionCapibility = 43
  const labelWidth = '250px'

  useEffect(() => {
    if (data && data.hotspot20Settings && data.hotspot20Settings.connectionCapabilities) {
      setConnectionCapabilities(data.hotspot20Settings.connectionCapabilities)
    } else {
      setConnectionCapabilities(defaultConnectionCapabilities)
    }
  }, [data])

  useEffect(() => {
    if (connectionCapabilities) {
      form.setFieldValue(['hotspot20Settings', 'connectionCapabilities'], connectionCapabilities)
      connectionCapibilityMap.current = new Map(connectionCapabilities?.map((cap, i) =>
        [cap.protocolNumber + '_' + cap.port, i]))
    }
  }, [connectionCapabilities, form])

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
  }

  const actions = !editMode ? [{
    label: $t({ defaultMessage: 'Add Protocol' }),
    disabled: connectionCapabilities.length >= maxConnectionCapibility,
    onClick: handleAddAction
  }] : []

  const rowActions: TableProps<Hotspot20ConnectionCapability>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (selectedRows) => {
      return selectedRows.length === 1
    },
    onClick: ([editRow]: Hotspot20ConnectionCapability[], clearSelection: () => void) => {
      setEditMode(true)
      setConnectionCapabilityDrawerVisible(true)
      setSelectedConnectionCapability(editRow)
      clearSelection()
    }
  },{
    label: $t({ defaultMessage: 'Delete' }),
    onClick: ( removedRows: Hotspot20ConnectionCapability[],
      clearSelection: () => void) => {
      if (removedRows.length < connectionCapabilities.length ) {
        let newCapbilities = cloneDeep(connectionCapabilities)
        removedRows.forEach((c) => {
          const idx = connectionCapibilityMap.current?.get(c.protocolNumber + '_' + c.port)as number
          if (idx > -1) {
            newCapbilities = [...newCapbilities.slice(0, idx), ...newCapbilities.slice(idx+1)]
            connectionCapibilityMap.current = new Map(newCapbilities?.map((cap, i) =>
              [cap.protocolNumber + '_' + cap.port, i]))
          }
        })
        setConnectionCapabilities(newCapbilities)
      } else {
        setConnectionCapabilities([])
        connectionCapibilityMap.current?.clear()
      }

      clearSelection()
    }
  }]

  const isValidConnectionCapability = (editMode?: boolean, cap?: Hotspot20ConnectionCapability) => {
    return !!cap?.protocolNumber && !!cap.port &&
      (editMode || !connectionCapibilityMap.current?.has(cap?.protocolNumber + '_' + cap?.port))
  }

  const saveConnectionCapability = (
    editMode?: boolean, capabilityObject?: Hotspot20ConnectionCapability) => {
    if (!capabilityObject) {
      return
    }

    if (editMode) {
      const idx = connectionCapibilityMap.current?.get(
        capabilityObject.protocolNumber + '_' + capabilityObject.port) as number
      if (idx > -1) {
        let newCapbilities = cloneDeep(connectionCapabilities)
        newCapbilities[idx] = capabilityObject
        setConnectionCapabilities(newCapbilities)
      }
    } else {
      setConnectionCapabilities([
        ...connectionCapabilities, capabilityObject
      ])
    }

    resetConnectionCapability()
  }

  const resetConnectionCapability = () => {
    setConnectionCapabilityDrawerVisible(false)
    setEditMode(false)
    setSelectedConnectionCapability(null as unknown as Hotspot20ConnectionCapability)
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
        return row.status && `${_.startCase(_.toLower(row.status))}`
      }
    }
  ]

  const getRowKey = (record: Hotspot20ConnectionCapability): string => {
    return '' + record.protocolNumber?.toString() + '_' + record.port?.toString()
  }

  const getProtocolNumberDisplay = (protocolNumber: number): string => {
    return getProtocolName(protocolNumber) ?
      `${protocolNumber} (${getProtocolName(protocolNumber)})` : `${protocolNumber}`
  }

  const getProtocolName = (protocolNumber: number): string => {
    switch (protocolNumber) {
      case 0: return 'HOPOPT'
      case 1: return 'ICMP'
      case 2: return 'IGMP'
      case 3: return 'GGP'
      case 4: return 'IPv4'
      case 5: return 'ST'
      case 6: return 'TCP'
      case 7: return 'CBT'
      case 8: return 'EGP'
      case 9: return 'IGP'
      case 10: return 'BBN-RCC-MON'
      case 11: return 'NVP-II'
      case 12: return 'PUP'
      case 13: return 'ARGUS'
      case 14: return 'EMCON'
      case 15: return 'XNET'
      case 16: return 'CHAOS'
      case 17: return 'UDP'
      case 18: return 'MUX'
      case 19: return 'DCN-MEAS'
      case 20: return 'HMP'
      case 21: return 'PRM'
      case 22: return 'XNS-IDP'
      case 23: return 'TRUNK-1'
      case 24: return 'TRUNK-2'
      case 25: return 'LEAF-1'
      case 26: return 'LEAF-2'
      case 27: return 'RDP'
      case 28: return 'IRTP'
      case 29: return 'ISO-TP4'
      case 30: return 'NETBLT'
      case 31: return 'MFE-NSP'
      case 32: return 'MERIT-INP'
      case 33: return 'DCCP'
      case 34: return '3PC'
      case 35: return 'IDPR'
      case 36: return 'XTP'
      case 37: return 'DDP'
      case 38: return 'IDPR-CMTP'
      case 39: return 'TP'
      case 40: return 'IL'
      case 41: return 'IPv6'
      case 42: return 'SDRP'
      case 43: return 'IPv6-Route'
      case 44: return 'IPv6-Frag'
      case 45: return 'IDRP'
      case 46: return 'RSVP'
      case 47: return 'GRE'
      case 48: return 'DSR'
      case 49: return 'BNA'
      case 50: return 'ESP'
      case 51: return 'AH'
      case 52: return 'I-NLSP'
      case 53: return 'SWIPE'
      case 54: return 'NARP'
      case 55: return 'Min-IPv4'
      case 56: return 'TLSP'
      case 57: return 'SKIP'
      case 58: return 'IPv6-ICMP'
      case 59: return 'IPv6-NoNxt'
      case 60: return 'IPv6-Opts'
      case 62: return 'CFTP'
      case 64: return 'SAT-EXPAK'
      case 65: return 'KRYPTOLAN'
      case 66: return 'RVD'
      case 67: return 'IPPC'
      case 69: return 'SAT-MON'
      case 70: return 'VISA'
      case 71: return 'IPCV'
      case 72: return 'CPNX'
      case 73: return 'CPHB'
      case 74: return 'WSN'
      case 75: return 'PVP'
      case 76: return 'BR-SAT-MON'
      case 77: return 'SUN-ND'
      case 78: return 'WB-MON'
      case 79: return 'WB-EXPAK'
      case 80: return 'ISO-IP'
      case 81: return 'VMTP'
      case 82: return 'SECURE-VMTP'
      case 83: return 'VINES'
      case 84: return 'IPTM'
      case 85: return 'NSFNET-IGP'
      case 86: return 'DGP'
      case 87: return 'TCF'
      case 88: return 'EIGRP'
      case 89: return 'OSPFIGP'
      case 90: return 'Sprite-RPC'
      case 91: return 'LARP'
      case 92: return 'MTP'
      case 93: return 'AX.25'
      case 94: return 'IPIP'
      case 95: return 'MICP'
      case 96: return 'SCC-SP'
      case 97: return 'ETHERIP'
      case 98: return 'ENCAP'
      case 100: return 'GMTP'
      case 101: return 'IFMP'
      case 102: return 'PNNI'
      case 103: return 'PIM'
      case 104: return 'ARIS'
      case 105: return 'SCPS'
      case 106: return 'QNX'
      case 107: return 'A/N'
      case 108: return 'IPComp'
      case 109: return 'SNP'
      case 110: return 'Compaq-Peer'
      case 111: return 'IPX-in-IP'
      case 112: return 'VRRP'
      case 113: return 'PGM'
      case 115: return 'L2TP'
      case 116: return 'DDX'
      case 117: return 'IATP'
      case 118: return 'STP'
      case 119: return 'SRP'
      case 120: return 'UTI'
      case 121: return 'SMP'
      case 122: return 'SM'
      case 123: return 'PTP'
      case 124: return 'ISIS over IPv4'
      case 125: return 'FIRE'
      case 126: return 'CRTP'
      case 127: return 'CRUDP'
      case 128: return 'SSCOPMCE'
      case 129: return 'IPLT'
      case 130: return 'SPS'
      case 131: return 'PIPE'
      case 132: return 'SCTP'
      case 133: return 'FC'
      case 134: return 'RSVP-E2E-IGNORE'
      case 135: return 'Mobility Header'
      case 136: return 'UDPLite'
      case 137: return 'MPLS-in-IP'
      case 138: return 'manet'
      case 139: return 'HIP'
      case 140: return 'Shim6'
      case 141: return 'WESP'
      case 142: return 'ROHC'
      case 143: return 'Ethernet'
      case 144: return 'AGGFRAG'
      case 145: return 'NSH'
      default:
        return ''
    }
  }

  return (
    <>
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
        initialValue={'PRIVATE'}
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
        initialValue={'SINGLE_NATED_PRIVATE'}
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
          name={['hotspot20Settings', 'connectionCapabilities']}
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
          rowSelection={hasAccess() && { type: 'checkbox' }}
          pagination={{ defaultPageSize: connectionCapabilities?.length, hideOnSinglePage: true }}
        />}
      </div>

      <ConnectionCapabilityDrawer
        visible={connectionCapabilityDrawerVisible}
        editData={selectedConnectionCapability}
        isValidCallBack={isValidConnectionCapability}
        resetCallBack={resetConnectionCapability}
        modalCallBack={saveConnectionCapability}
      />
    </>
  )
}
