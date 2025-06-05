import { useIntl, defineMessage } from 'react-intl'

import { Cascader, Loader }   from '@acx-ui/components'
import { useVenuesListQuery } from '@acx-ui/rc/services'

type VenueFilterProps = {
  setSelectedVenues: CallableFunction,
  selectedVenues: string[]
}

const VenueFilter: React.FC<VenueFilterProps> = ({
  setSelectedVenues,
  selectedVenues
}: VenueFilterProps) => {
  const { $t } = useIntl()
  const venuesQuery = useVenuesListQuery({
    payload: {
      pageSize: 10000,
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })
  const values = selectedVenues.map(venue => [venue])
  return <Loader states={[venuesQuery]} style={{ minWidth: '159px' }}>
    <Cascader
      entityName={{
        singular: defineMessage({ defaultMessage: '<venueSingular></venueSingular>' }),
        plural: defineMessage({ defaultMessage: '<venuePlural></venuePlural>' })
      }}
      placeholder={$t({ defaultMessage: 'All <VenuePlural></VenuePlural>' })}
      multiple
      value={values}
      defaultValue={values}
      options={venuesQuery.data?.data
        ?.map(({ id, name }) => ({ value: id, label: name }))
      }
      onApply={(selectedOptions) => setSelectedVenues(
        (selectedOptions as string[][])?.map(([node]) => node)
      )}
      placement='bottomRight'
      allowClear
    />
  </Loader>
}

export { VenueFilter, VenueFilterProps }
