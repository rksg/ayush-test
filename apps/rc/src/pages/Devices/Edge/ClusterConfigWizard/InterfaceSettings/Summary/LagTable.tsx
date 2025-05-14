import { ReactNode, useContext } from 'react'

import { Col, Row } from 'antd'
import _            from 'lodash'
import { useIntl }  from 'react-intl'

import { Table, TableProps, Tooltip }                                                                 from '@acx-ui/components'
import { Features }                                                                                   from '@acx-ui/feature-toggle'
import { CheckMark }                                                                                  from '@acx-ui/icons'
import { useIsEdgeFeatureReady }                                                                      from '@acx-ui/rc/components'
import { EdgeIpModeEnum, EdgeLag, EdgePortTypeEnum, getEdgePortDisplayName, getEdgePortIpModeString } from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../../ClusterConfigWizardDataProvider'
import { InterfaceSettingsFormType }  from '../types'

interface LagTableProps {
  data: InterfaceSettingsFormType['lagSettings']
  portSettings?: InterfaceSettingsFormType['portSettings']
}

interface LagTableData {
  serialNumber: string
  edgeName: string
  lagName: string
  lagType: string
  adminStatus:string
  lagMembers: EdgeLag['lagMembers']
  portType: EdgePortTypeEnum
  ipMode: EdgeIpModeEnum
  ip?: string
  corePortEnabled?: boolean
  accessPortEnabled?: boolean
}

export const LagTable = (props: LagTableProps) => {
  const { data, portSettings } = props
  const { $t } = useIntl()
  const { clusterInfo } = useContext(ClusterConfigWizardContext)
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)

  const tableData = [] as LagTableData[]

  for(let lagSettings of data) {
    if(!lagSettings.lags || lagSettings.lags.length === 0) continue
    const targetNode = clusterInfo?.edgeList?.find(item =>
      item.serialNumber === lagSettings.serialNumber)
    for(let lag of lagSettings.lags) {
      tableData.push({
        serialNumber: targetNode?.serialNumber ?? '',
        edgeName: targetNode?.name ?? '',
        lagName: `Lag${lag.id}`,
        lagType: `${lag.lagType} (${_.capitalize(lag.lacpMode)})`,
        adminStatus: lag.lagEnabled ?
          $t({ defaultMessage: 'Enabled' }) :
          $t({ defaultMessage: 'Disabled' }),
        lagMembers: lag.lagMembers,
        portType: lag.portType,
        ipMode: lag.ipMode,
        ip: lag.ip,
        corePortEnabled: lag.corePortEnabled,
        accessPortEnabled: lag.accessPortEnabled
      })
    }
  }

  const columns: TableProps<LagTableData>['columns'] = [
    {
      title: $t({ defaultMessage: 'RUCKUS Edge' }),
      key: 'edgeName',
      dataIndex: 'edgeName'
    },
    {
      title: $t({ defaultMessage: 'LAG Name' }),
      key: 'lagName',
      dataIndex: 'lagName'
    },
    {
      title: $t({ defaultMessage: 'LAG Type' }),
      key: 'lagType',
      dataIndex: 'lagType'
    },
    {
      title: $t({ defaultMessage: 'LAG Members' }),
      key: 'lagMembers',
      dataIndex: 'lagMembers',
      render: (_data, row) => {
        const lagMemberSize = row.lagMembers?.length
        return lagMemberSize ?
          <Tooltip
            title={getToolTipContent(row.serialNumber, row.lagMembers)}
            children={lagMemberSize}
          /> :
          0
      },
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'portType',
      dataIndex: 'portType'
    },
    {
      title: $t({ defaultMessage: 'IP Type' }),
      key: 'ipMode',
      dataIndex: 'ipMode',
      render: (_data, { ipMode }) => getEdgePortIpModeString($t, ipMode)
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip',
      render: (_data, { ipMode }) => ipMode !== EdgeIpModeEnum.DHCP ? _data : ''
    },
    {
      title: $t({ defaultMessage: 'Admin Status' }),
      key: 'adminStatus',
      dataIndex: 'adminStatus'
    },
    ...(
      isEdgeCoreAccessSeparationReady ?
        [
          {
            title: $t({ defaultMessage: 'Core Port' }),
            align: 'center' as const,
            key: 'corePortEnabled',
            dataIndex: 'corePortEnabled',
            render: (_data: ReactNode, row: LagTableData) => {
              return row.corePortEnabled && <CheckMark width={20} height={20} />
            }
          },
          {
            title: $t({ defaultMessage: 'Access Port' }),
            align: 'center' as const,
            key: 'accessPortEnabled',
            dataIndex: 'accessPortEnabled',
            render: (_data: ReactNode, row: LagTableData) => {
              return row.accessPortEnabled && <CheckMark width={20} height={20} />
            }
          }
        ]
        : []
    )
  ]

  const getToolTipContent = (
    serialNumber: string,
    lagMembers: EdgeLag['lagMembers']
  ) => {
    const portList = portSettings?.[serialNumber] ?
      Object.values(portSettings?.[serialNumber]).flat() :
      []
    return lagMembers?.map(
      lagmember =>
        <Row key={lagmember.portId}>
          <Col>
            {
              `${getEdgePortDisplayName((portList.find(port =>
                port.id === lagmember.portId)))} (${lagmember.portEnabled ?
                $t({ defaultMessage: 'Enabled' }) :
                $t({ defaultMessage: 'Disabled' })})`
            }
          </Col>
        </Row>

    )
  }

  return (
    <Table
      rowKey={(row: LagTableData) => `${row.serialNumber}-${row.lagName}`}
      type='form'
      columns={columns}
      dataSource={tableData}
    />
  )
}