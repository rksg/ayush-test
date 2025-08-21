import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import { Table, TableProps, Tooltip }           from '@acx-ui/components'
import { arraySizeSort, defaultSort, sortProp } from '@acx-ui/rc/utils'

export interface VenueTemplateTableDataType {
  venueId: string
  venueName: string
  customerCount: number
  selectedNetworks: {
    networkId: string
    networkName: string
  }[]
}

interface VenueTemplateTableProps {
  data: VenueTemplateTableDataType[]
}

export const VenueTemplateTable = (props: VenueTemplateTableProps) => {
  const { data = [] } = props
  const { $t } = useIntl()

  const columns: TableProps<VenueTemplateTableDataType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Template Name' }),
      key: 'venueName',
      dataIndex: 'venueName',
      sorter: { compare: sortProp('venueName', defaultSort) },
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Customers' }),
      key: 'customerCount',
      dataIndex: 'customerCount',
      sorter: { compare: sortProp('customerCount', defaultSort) },
      render: (_, row) => (row.customerCount ?? 0)
    },
    {
      title: $t({ defaultMessage: 'Selected Networks' }),
      key: 'selectedNetworks',
      dataIndex: 'selectedNetworks',
      sorter: { compare: sortProp('selectedNetworks', arraySizeSort) },
      render: (_, row) => (
        row.selectedNetworks?.length ?
          <Tooltip
            title={row.selectedNetworks.map(item => (
              <Row key={item.networkId}>
                {item.networkName}
              </Row>
            ))}
            children={row.selectedNetworks.length}
            dottedUnderline
          /> :
          0
      )
    }
  ]

  return (
    <Table
      rowKey='venueId'
      columns={columns}
      dataSource={data}
    />
  )
}