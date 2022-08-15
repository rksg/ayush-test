import { useIntl } from 'react-intl'

import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { NetworkFilter, Option, Loader } from '@acx-ui/components'

import { NetworkHierarchy, useNetworkFilterQuery } from './services'

const getFilterData = (data: NetworkHierarchy): Option [] => {
  return data?.children.map((node, index) => ({
    value: JSON.stringify(node.path),
    label: node.name,
    children: node.aps ? [{
      label: 'APs',
      value: index,
      children: node.aps.map(ap => ({ label: ap.name, value: ap.mac }))
    }]
    : []
  }))
}
function ConnectedNetworkFilter () {
  const { $t } = useIntl()
 
  const queryResults = useNetworkFilterQuery(useAnalyticsFilter(), {
    selectFromResult: ({ data, ...rest }) => ({
      data: getFilterData(data!),
      ...rest
    })
  })
  return (<Loader states={[queryResults]}>
    <NetworkFilter
      placeholder={$t({ defaultMessage: 'Entire Organization' })}
      multiple={false}
      defaultValue={[]}
      options={queryResults.data}
      onApply={() => {}}
      placement='bottomRight'
    />
  </Loader>)
}

export default ConnectedNetworkFilter
