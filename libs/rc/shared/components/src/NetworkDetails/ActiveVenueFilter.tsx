import { useIntl, defineMessage } from 'react-intl'

import { Cascader, Loader }   from '@acx-ui/components'
import { useVenuesListQuery } from '@acx-ui/rc/services'
import { useParams }          from '@acx-ui/react-router-dom'

import { useGetNetwork } from './services'

export function ActiveVenueFilter ({
  setSelectedVenues,
  selectedVenues
}: {
  setSelectedVenues: CallableFunction,
  selectedVenues: string[]
}) {
  const { $t } = useIntl()
  const { networkId } = useParams()
  const networkQuery = useGetNetwork()
  const venuesQuery = useVenuesListQuery({
    params: { networkId },
    payload: {
      pageSize: 10000,
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })
  const activeVenues = networkQuery.data?.venues?.map(({ venueId }) => venueId)
  const values = selectedVenues.map(venue => [venue])
  return <Loader states={[networkQuery, venuesQuery]} style={{ minWidth: '159px' }}>
    <Cascader
      entityName={{
        singular: defineMessage({ defaultMessage: 'venue' }),
        plural: defineMessage({ defaultMessage: 'venues' })
      }}
      placeholder={$t({ defaultMessage: 'All Active Venues' })}
      multiple
      value={values}
      defaultValue={values}
      options={venuesQuery.data?.data
        ?.filter(({ id }) => activeVenues?.includes(id))
        .map(({ id, name }) => ({ value: id, label: name }))
      }
      onApply={(selectedOptions) => setSelectedVenues(
        (selectedOptions as string[][])?.map(([node]) => node)
      )}
      placement='bottomRight'
      allowClear
    />
  </Loader>
}
