import { Select }      from 'antd'
import { SelectProps } from 'antd/lib/select'
import { useParams }   from 'react-router-dom'

import { useVenuesListQuery } from '@acx-ui/rc/services'

export function VenueSelector (props: SelectProps) {
  const { tenantId } = useParams()

  const { venueFilterOptions } = useVenuesListQuery({
    params: { tenantId }, payload: {
      fields: ['name', 'country', 'latitude', 'longitude', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }, {
    selectFromResult: ({ data }) => ({
      venueFilterOptions: data?.data.map(v => ({ key: v.id, value: v.name })) || true
    })
  })

  const venueOptions = venueFilterOptions instanceof Array ?
    venueFilterOptions.map(item => ({ label: item.value, value: item.key })) :
    []

  return (
    <Select options={venueOptions} {...props} />
  )
}
