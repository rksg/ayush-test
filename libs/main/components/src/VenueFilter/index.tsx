import { useIntl, defineMessage } from 'react-intl'

import { Cascader, Loader }   from '@acx-ui/components'
import { useVenuesListQuery } from '@acx-ui/rc/services'
import { useParams }          from '@acx-ui/react-router-dom'
import { useDashboardFilter } from '@acx-ui/utils'

import * as UI from './styledComponents'

type Venue = { id: string, name: string }

const transformResult = (data: Venue[]) => data.map(
  ({ id, name }) => ({ label: name, value: id })
)

export function VenueFilter () {
  const { $t } = useIntl()
  const { setNodeFilter, venueIds } = useDashboardFilter()
  const value = venueIds.map((id: string) => [id])

  const queryResults = useVenuesListQuery({
    params: { ...useParams() },
    payload: {
      fields: ['name', 'id'],
      filters: {},
      sortField: 'name',
      sortOrder: 'ASC',
      pageSize: 10000 //ACX-25572
    }
  }, {
    selectFromResult: ({ data, ...rest }) => {
      return { data: data ? transformResult(data?.data as Venue[]) : [],
        ...rest
      }
    }
  })

  return (
    <UI.Container>
      <Loader states={[queryResults]}>
        <Cascader
          entityName={{
            singular: defineMessage({ defaultMessage: 'venue' }),
            plural: defineMessage({ defaultMessage: 'venues' })
          }}
          placeholder={$t({ defaultMessage: 'Entire Organization' })}
          multiple
          defaultValue={value}
          value={value}
          options={queryResults.data}
          onApply={(selectedOptions) => setNodeFilter(selectedOptions as string[][])}
          placement='bottomLeft'
          allowClear
        />
      </Loader>
    </UI.Container>
  )
}
