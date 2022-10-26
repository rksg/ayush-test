import { omit }    from 'lodash'
import { useIntl } from 'react-intl'

import { NetworkFilter, Option, Loader }       from '@acx-ui/components'
import { useDashboardFilter, NetworkNodePath } from '@acx-ui/utils'

import { Child, useVenueFilterQuery } from './services'
import * as UI                        from './styledComponents'


const getFilterData = (data: Child[]): Option [] => {
  const venues: { [key: string]: Option; } = {}
  for (const { name, id } of data) {
    if (!venues[id]) {
      venues[id] = { label: name, value: id }
    }
  }
  return Object.values(venues)
}
function VenueFilter () {
  const { $t } = useIntl()
  const { setNodeFilter, filters } = useDashboardFilter()
  const { filter: { networkNodes } } = filters
  const queryResults = useVenueFilterQuery(omit(filters, 'filter','path'), {
    selectFromResult: ({ data, ...rest }) => {
      return { data: data ? getFilterData(data) : [],
        ...rest
      }
    }
  })
  const value = networkNodes?.map((networkNode: NetworkNodePath) => [networkNode[0].name])
  return (
    <UI.Container>
      <Loader states={[queryResults]}>
        <NetworkFilter
          placeholder={$t({ defaultMessage: 'Entire Organization' })}
          multiple
          defaultValue={value}
          value={value}
          options={queryResults.data}
          onApply={(selectedOptions) => setNodeFilter(selectedOptions as string[][])}
          placement='bottomRight'
        />
      </Loader>
    </UI.Container>
  )
}

export default VenueFilter
