import { useIntl } from 'react-intl'

import { Loader, Table } from '@acx-ui/components'

export const AssignedSegmentsTable = () => {

  const { $t } = useIntl()

  const columns = [
    {
      title: $t({ defaultMessage: 'Segment #' }),
      key: 'segments',
      dataIndex: 'segments',
      fixed: 'left' as const
    },
    {
      title: $t({ defaultMessage: 'Persona' }),
      key: 'persona',
      dataIndex: 'persona'
    },
    {
      title: $t({ defaultMessage: 'Devices' }),
      key: 'devices',
      dataIndex: 'devices'
    },
    {
      title: $t({ defaultMessage: 'AP' }),
      key: 'ap',
      dataIndex: 'ap'
    },
    {
      title: $t({ defaultMessage: 'Switch' }),
      key: 'switch',
      dataIndex: 'switch'
    },
    {
      title: $t({ defaultMessage: 'Assigned Port' }),
      key: 'port',
      dataIndex: 'port'
    }
  ]

  return (
    <Loader>
      <Table
        columns={columns}
        rowKey='serialNumber'
      />
    </Loader>
  )
}