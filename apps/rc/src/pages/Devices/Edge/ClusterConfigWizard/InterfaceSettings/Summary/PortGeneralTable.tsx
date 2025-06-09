import { ReactNode, useContext } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'


import { Table, TableProps }                                         from '@acx-ui/components'
import { Features }                                                  from '@acx-ui/feature-toggle'
import { CheckMark }                                                 from '@acx-ui/icons'
import { useIsEdgeFeatureReady }                                     from '@acx-ui/rc/components'
import { EdgeIpModeEnum, EdgePortTypeEnum, getEdgePortIpModeString } from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../../ClusterConfigWizardDataProvider'
import { InterfaceSettingsFormType }  from '../types'

interface PortGeneralTableProps {
  data: InterfaceSettingsFormType['portSettings']
}

interface PortGeneralTableData {
  serialNumber: string
  edgeName: string
  interfaceName: string
  adminStatus: string
  portType: EdgePortTypeEnum
  ipMode: EdgeIpModeEnum
  ip?: string
  corePortEnabled?: boolean
  accessPortEnabled?: boolean
}

export const PortGeneralTable = (props: PortGeneralTableProps) => {
  const { data } = props
  const { $t } = useIntl()
  const { clusterInfo } = useContext(ClusterConfigWizardContext)
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)

  const tableData = [] as PortGeneralTableData[]

  for(let [serialNumber, portSettings] of Object.entries(data)) {
    const targetNode = clusterInfo?.edgeList?.find(item =>
      item.serialNumber === serialNumber)
    for(let portSetting of Object.values(portSettings).flat()) {
      if(portSetting.portType === EdgePortTypeEnum.UNCONFIGURED) continue
      tableData.push({
        serialNumber: serialNumber,
        edgeName: targetNode?.name ?? '',
        interfaceName: _.capitalize(portSetting.interfaceName ?? ''),
        adminStatus: portSetting.enabled ?
          $t({ defaultMessage: 'Enabled' }) :
          $t({ defaultMessage: 'Disabled' }),
        portType: portSetting.portType,
        ipMode: portSetting.ipMode,
        ip: portSetting.ip,
        corePortEnabled: portSetting.corePortEnabled,
        accessPortEnabled: portSetting.accessPortEnabled
      })
    }
  }


  const columns: TableProps<PortGeneralTableData>['columns'] = [
    {
      title: $t({ defaultMessage: 'RUCKUS Edge' }),
      key: 'edgeName',
      dataIndex: 'edgeName'
    },
    {
      title: $t({ defaultMessage: 'Port' }),
      key: 'interfaceName',
      dataIndex: 'interfaceName'
    },
    {
      title: $t({ defaultMessage: 'Admin Status' }),
      key: 'adminStatus',
      dataIndex: 'adminStatus'
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
    ...(
      isEdgeCoreAccessSeparationReady ?
        [
          {
            title: $t({ defaultMessage: 'Core Port' }),
            align: 'center' as const,
            key: 'corePortEnabled',
            dataIndex: 'corePortEnabled',
            render: (_data: ReactNode, row: PortGeneralTableData) => {
              return row.corePortEnabled && <CheckMark width={20} height={20} />
            }
          },
          {
            title: $t({ defaultMessage: 'Access Port' }),
            align: 'center' as const,
            key: 'accessPortEnabled',
            dataIndex: 'accessPortEnabled',
            render: (_data: ReactNode, row: PortGeneralTableData) => {
              return row.accessPortEnabled && <CheckMark width={20} height={20} />
            }
          }
        ]
        : []
    )
  ]

  return (
    <Table
      rowKey={(row: PortGeneralTableData) => `${row.serialNumber}-${row.interfaceName}`}
      type='form'
      columns={columns}
      dataSource={tableData}
    />
  )
}