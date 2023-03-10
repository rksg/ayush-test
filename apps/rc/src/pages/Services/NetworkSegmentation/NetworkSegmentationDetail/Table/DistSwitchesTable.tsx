import { useIntl } from 'react-intl'

import { Loader, Table } from '@acx-ui/components'

export const DistSwitchesTable = () => {

  const { $t } = useIntl()

  const columns = [
    {
      title: $t({ defaultMessage: 'Dist. Switch' }),
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
      title: $t({ defaultMessage: 'Access Switches' }),
      key: 'switches',
      dataIndex: 'switches'
    },
    {
      title: $t({ defaultMessage: 'VLAN Range' }),
      key: 'vlanRange',
      dataIndex: 'vlanRange'
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