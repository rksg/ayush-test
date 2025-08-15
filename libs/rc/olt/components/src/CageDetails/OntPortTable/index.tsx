import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import { Table, TableProps }                                    from '@acx-ui/components'
import { formatter }                                            from '@acx-ui/formatter'
import { OltCageStateEnum, OltOntPort, OLT_PSE_SUPPLIED_POWER } from '@acx-ui/olt/utils'
import { noDataDisplay }                                        from '@acx-ui/utils'

import { OltStatus } from '../../OltStatus'

interface OntPortTableProps {
  data?: OltOntPort[]
}

export const OntPortTable = (props: OntPortTableProps) => {
  const { data } = props

  return <Table
    rowKey='portIdx'
    columns={useColumns()}
    dataSource={data}
    stickyHeaders={false}
    rowSelection={{
      type: 'radio'
    }}
  />
}

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<OltOntPort>['columns'] = [
    {
      key: 'portIdx',
      title: $t({ defaultMessage: 'Port' }),
      dataIndex: 'portIdx',
      fixed: 'left',
      width: 40
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'stauts',
      width: 60,
      render: (_, row) => {
        return <Row>
          <OltStatus type='cage' status={row.status} showText />
        </Row>
      }
    },
    {
      key: 'poeUtilization',
      title: $t({ defaultMessage: 'PoE Utilization' }),
      dataIndex: 'poeUtilization',
      render: (_, row) => {
        const percentVal = row.poePower / OLT_PSE_SUPPLIED_POWER
        // eslint-disable-next-line max-len
        return `${formatter('percentFormat')(percentVal)} (${formatter('ratioFormat')([row.poePower, OLT_PSE_SUPPLIED_POWER])} W)`
      }
    },
    {
      key: 'untaggedVlan',
      title: $t({ defaultMessage: 'Untagged VLAN' }),
      dataIndex: 'untaggedVlan',
      align: 'center' as const
    },
    {
      key: 'taggedVlan',
      title: $t({ defaultMessage: 'Tagged VLAN' }),
      dataIndex: 'taggedVlan',
      align: 'center' as const
    },
    {
      key: 'clientCount',
      title: $t({ defaultMessage: 'Client Count' }),
      dataIndex: 'clientCount',
      align: 'center' as const,
      render: (_, row) => {
        // eslint-disable-next-line max-len
        return row.status === OltCageStateEnum.UP ? row?.clientCount : noDataDisplay
      }
    }
  ]

  return columns
}
