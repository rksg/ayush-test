import { useIntl } from 'react-intl'

import { Loader, Table } from '@acx-ui/components'

export const AccessSwitchesTable = () => {

  const { $t } = useIntl()

  const columns = [
    {
      title: $t({ defaultMessage: 'Access Switch' }),
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      key: 'model',
      dataIndex: 'model'
    },
    {
      title: $t({ defaultMessage: 'Dist. Switch' }),
      key: 'switch',
      dataIndex: 'switch'
    },
    {
      title: $t({ defaultMessage: 'Uplink Port' }),
      key: 'port',
      dataIndex: 'port'
    },
    {
      title: $t({ defaultMessage: 'VLAN' }),
      key: 'vlan',
      dataIndex: 'vlan'
    },
    {
      title: $t({ defaultMessage: 'Net Seg Auth Page' }),
      key: 'page',
      dataIndex: 'page'
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