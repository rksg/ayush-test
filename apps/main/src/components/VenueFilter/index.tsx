import { DefaultOptionType } from 'antd/lib/select'
import { omit }              from 'lodash'
import { SingleValueType }   from 'rc-cascader/lib/Cascader'
import { useIntl }           from 'react-intl'

import { NetworkFilter, Option, Loader }   from '@acx-ui/components'
import { useDashboardFilter, NetworkNode } from '@acx-ui/utils'

import { Child, useNetworkFilterQuery } from './services'
import * as UI                          from './styledComponents'


const getFilterData = (data: Child[]): Option [] => {
  const venues: { [key: string]: Option; } = {}
  for (const { name, path } of data) {
    if (!venues[name]) {
      venues[name] = {
        label: name,
        value: JSON.stringify([path?.slice(-1)[0]])
      }
    }
  }
  return Object.values(venues)
}
const search = (input: string, path: DefaultOptionType[]) : boolean => {
  const item = path.slice(-1)[0]
  return (item?.label as string)?.toLowerCase().includes(input.toLowerCase())
}
export const displayRender = ({}, selectedOptions: DefaultOptionType[] | undefined) =>
  selectedOptions
    ?.map(option => option?.displayLabel || option?.label).join(' / ')
export const onApply = (
  selectedOptions: SingleValueType | SingleValueType[] | undefined,
  setNodeFilter: CallableFunction
) => {
  const nodes = selectedOptions?.map(
    (selectedOption) => JSON.parse(selectedOption as string)
  )
  setNodeFilter(nodes)
}

function VenueFilter () {
  const { $t } = useIntl()
  const { setNodeFilter, filters } = useDashboardFilter()
  const { filter } = filters
  const { networkNodes } = filter
  const queryResults = useNetworkFilterQuery(omit(filters, 'filter','path'), {
    selectFromResult: ({ data, ...rest }) => {
      return { data: data ? getFilterData(data) : [],
        ...rest
      }
    }
  })
  return (
    <UI.Container>
      <Loader states={[queryResults]}>
        <NetworkFilter
          placeholder={$t({ defaultMessage: 'Entire Organization' })}
          multiple
          defaultValue={networkNodes?.map((networkNode: NetworkNode) => 
            [JSON.stringify(networkNode)]
          )}
          value={networkNodes?.map((networkNode: NetworkNode) => 
            [JSON.stringify(networkNode)]
          )}
          options={queryResults.data}
          onApply={(selectedOptions) =>
            onApply(selectedOptions, setNodeFilter)
          }
          placement='bottomRight'
          showSearch={{ filter: search }}
        />
      </Loader>
    </UI.Container>
  )
}

export default VenueFilter
