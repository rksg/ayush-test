import { useIntl } from 'react-intl'

import { Table, TableProps }                                 from '@acx-ui/components'
import { AccessSwitch, DistributionSwitch, WebAuthTemplate } from '@acx-ui/rc/utils'

interface AccessSwitchesTableProps extends Omit<TableProps<AccessSwitch>, 'columns'> {
  distributionSwitchInfos?: DistributionSwitch[]
  templateList?: WebAuthTemplate[]
}

export const AccessSwitchesTable = (props: AccessSwitchesTableProps) => {

  const { $t } = useIntl()

  const columns: TableProps<AccessSwitch>['columns'] = [
    {
      title: $t({ defaultMessage: 'Access Switch' }),
      key: 'name',
      dataIndex: 'name',
      fixed: 'left'
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      key: 'model',
      dataIndex: 'model'
    },
    {
      title: $t({ defaultMessage: 'Dist. Switch' }),
      key: 'distributionSwitchId',
      dataIndex: 'distributionSwitchId',
      render: (data, row) => {
        const dsId = row.distributionSwitchId
        return props.distributionSwitchInfos?.find(ds => ds.id === dsId)?.name || dsId
      }
    },
    {
      title: $t({ defaultMessage: 'Uplink Port' }),
      key: 'uplinkInfo',
      dataIndex: ['uplinkInfo', 'uplinkId'],
      render: (data, row) => {
        return row.uplinkInfo ? `${row.uplinkInfo.uplinkType} ${data}` : ''
      }
    },
    {
      title: $t({ defaultMessage: 'VLAN' }),
      key: 'vlanId',
      dataIndex: 'vlanId'
    },
    {
      title: $t({ defaultMessage: 'Net Seg Auth Page' }),
      key: 'webAuthPageType',
      dataIndex: 'webAuthPageType',
      render: (data, row) => {
        if (row.webAuthPageType === 'USER_DEFINED') {
          return $t({ defaultMessage: 'custom' })
        }
        return props.templateList?.find(tp => tp.id === row.templateId)?.name || data
      }
    }
  ]

  return (
    <Table {...props}
      columns={columns}
      rowKey='id'
    />
  )
}
