import { useContext } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Table, TableProps } from '@acx-ui/components'
import { SubInterface }      from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../../ClusterConfigWizardDataProvider'
import { InterfaceSettingsFormType }  from '../types'

interface SubInterfaceTableProps {
  portData?: InterfaceSettingsFormType['portSettings']
  portSubInterfaceData?: InterfaceSettingsFormType['portSubInterfaces']
  lagSubInterfaceData?: InterfaceSettingsFormType['lagSubInterfaces']
}

interface SubInterfaceTableData extends SubInterface {
  serialNumber: string
  edgeName: string
}

export const SubInterfaceTable = (props: SubInterfaceTableProps) => {
  const { $t } = useIntl()
  const { portSubInterfaceData = {}, lagSubInterfaceData = {}, portData = {} } = props
  const { clusterInfo } = useContext(ClusterConfigWizardContext)

  const tableData = [] as SubInterfaceTableData[]
  const edgeNodeList = clusterInfo?.edgeList

  Object.entries(portSubInterfaceData).forEach(([serialNumber, subInterfaces = {}]) => {
    Object.entries(subInterfaces).forEach(([portId, subInterface = []]) => {
      subInterface.forEach((subInterface) => {
        // eslint-disable-next-line max-len
        const currentPortInfo = Object.values(portData?.[serialNumber])?.find(item => item[0].id === portId)?.[0]
        tableData.push({
          ...subInterface,
          serialNumber,
          edgeName: edgeNodeList?.find(item => item.serialNumber === serialNumber)?.name ?? '',
          interfaceName: _.capitalize(currentPortInfo?.interfaceName)
        })
      })
    })
  })

  Object.entries(lagSubInterfaceData).forEach(([serialNumber, subInterfaces = {}]) => {
    Object.entries(subInterfaces).forEach(([lagId, subInterface = []]) => {
      subInterface.forEach((subInterface) => {
        tableData.push({
          ...subInterface,
          serialNumber,
          edgeName: edgeNodeList?.find(item => item.serialNumber === serialNumber)?.name ?? '',
          interfaceName: `Lag${lagId}`
        })
      })
    })
  })

  const columns: TableProps<SubInterfaceTableData>['columns'] = [
    {
      title: $t({ defaultMessage: 'RUCKUS Edge' }),
      key: 'edgeName',
      dataIndex: 'edgeName'
    },
    {
      title: $t({ defaultMessage: 'Interface Name' }),
      key: 'interfaceName',
      dataIndex: 'interfaceName'
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'portType',
      dataIndex: 'portType',
      width: 80
    },
    {
      title: $t({ defaultMessage: 'IP Type' }),
      key: 'ipMode',
      dataIndex: 'ipMode',
      width: 80
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip'
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'subnet',
      dataIndex: 'subnet'
    },
    {
      title: $t({ defaultMessage: 'VLAN' }),
      key: 'vlan',
      dataIndex: 'vlan'
    }
  ]

  return (
    <Table
      // eslint-disable-next-line max-len
      rowKey={(row: SubInterfaceTableData) => `${row.serialNumber}-${row.interfaceName}-${row.vlan}`}
      type='form'
      columns={columns}
      dataSource={tableData}
    />
  )
}