import { useIntl } from 'react-intl'

import { Table } from '@acx-ui/components'

export const VenueTable = () => {

  const { $t } = useIntl()

  const columns = [
    {
      title: $t({ defaultMessage: 'Persona Group' }),
      key: 'personaGroup',
      dataIndex: 'personaGroup'
    },
    {
      title: $t({ defaultMessage: 'Number of Personas' }),
      key: 'personas',
      dataIndex: 'personas'
    },
    {
      title: $t({ defaultMessage: 'DPSK Pool' }),
      key: 'pool',
      dataIndex: 'pool'
    },
    {
      title: $t({ defaultMessage: 'DPSK Networks' }),
      key: 'networks',
      dataIndex: 'networks'
    }
  ]

  return (
    <Table
      type='form'
      columns={columns}
    />
  )
}