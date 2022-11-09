import { omit }    from 'lodash'
import { useIntl } from 'react-intl'

import { NetworkFilter, Loader }               from '@acx-ui/components'
import { useDashboardFilter, NetworkNodePath } from '@acx-ui/utils'
import { useVenuesListQuery }                  from '@acx-ui/rc/services'
import { useTableQuery }                       from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

type Venue = { id: string, name: string }

const transformResult = (data: Venue[]) => data.map(
  ({ id, name }) => ({ label: name, value: id })
)

export function VenueFilter () {
  const { $t } = useIntl()
  const { setNodeFilter, filters } = useDashboardFilter()
  const { filter: { networkNodes } } = filters
  const value = networkNodes?.map((networkNode: NetworkNodePath) => [networkNode[0].name])
  const queryResults = useTableQuery({
    useQuery: useVenuesListQuery,
    defaultPayload :{
      fields: ['name', 'id'],
      filters: {},
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })
  return (
    <UI.Container>
      <Loader states={[queryResults]}>
        <NetworkFilter
          placeholder={$t({ defaultMessage: 'Entire Organization' })}
          multiple
          defaultValue={value}
          value={value}
          options={transformResult(queryResults.data?.data as Venue[] || [])}
          onApply={(selectedOptions) => setNodeFilter(selectedOptions as string[][])}
          placement='bottomRight'
        />
      </Loader>
    </UI.Container>
  )
}
