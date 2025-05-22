import { pick }    from 'lodash'
import { useIntl } from 'react-intl'

import {
  Drawer,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useVenuesListQuery
} from '@acx-ui/rc/services'
import { TenantLink } from '@acx-ui/react-router-dom'

interface AssocVenueDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  usedVenueIds: string[]
}

export interface AssocVenueTableDataType {
  id: string
  name: string
  address: string
}


export const AssocVenueDrawer = (props: AssocVenueDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, usedVenueIds } = props

  const { availableVenues, isLoading, isFetching } = useVenuesListQuery({
    payload: {
      fields: ['name', 'country', 'city', 'id', 'addressLine'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, {
    selectFromResult: ({ data, isLoading, isFetching }) => ({
      isLoading,
      isFetching,
      availableVenues: data?.data.filter(venue => {
        return usedVenueIds.includes(venue.id)
      }).map(item => ({
        ...pick(item, ['id', 'name', 'addressLine']),
        address: `${item.country}, ${item.city}`
      } as AssocVenueTableDataType)) ?? []
    })
  })

  const columns: TableProps<AssocVenueTableDataType>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural> Name' }),
      sorter: false,
      dataIndex: 'name',
      searchable: true,
      render: function (_, row) {
        return (
          <TenantLink to={`/venues/${row.id}/venue-details/overview`}>
            {row.name}</TenantLink>
        )
      }

    }, {
      key: 'addressLine',
      title: $t({ defaultMessage: 'Address' }),
      sorter: false,
      dataIndex: 'addressLine'
    }]

  const onClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Associated <VenuePlural></VenuePlural>' })}
      visible={visible}
      onClose={onClose}
      width={644}
      children={
        <Loader
          states={[
            { isLoading, isFetching }
          ]}
        >
          <Table
            rowKey='id'
            columns={columns}
            dataSource={availableVenues}
          />
        </Loader>
      }
    />
  )
}
