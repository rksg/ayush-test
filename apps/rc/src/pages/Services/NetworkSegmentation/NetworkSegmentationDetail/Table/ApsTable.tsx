import { useIntl } from 'react-intl'

import { Loader, Table } from '@acx-ui/components'

export const ApsTable = () => {

  const { $t } = useIntl()

  const columns = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      key: 'model',
      dataIndex: 'model'
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      key: 'mac',
      dataIndex: 'mac'
    },
    {
      title: $t({ defaultMessage: 'Available Ports' }),
      key: 'ports',
      dataIndex: 'ports'
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