import { useIntl } from 'react-intl'
import { omit } from 'lodash'
import { useAnalyticsFilter, defaultNetworkPath } from '@acx-ui/analytics/utils'
import { NetworkFilter, Option, Loader } from '@acx-ui/components'

import { NetworkHierarchy, useNetworkFilterQuery, ApOrSwitch } from './services'

const nonSelectableNode = (label: string) => (
  <div style={{ width: '100%'}} onClick={e => e.stopPropagation()}>{label}</div>
)
const getFilterData = (data: NetworkHierarchy, $t: CallableFunction): Option [] => {
  const venues = data.children.filter(node => node.type === 'zone')
  const switchGroups = data.children
    .filter(node => node.type === 'switchGroup')
    .reduce((obj, node) => obj.set(node.name, node), new Map())
  return venues.map((node, index) => {
    const venue = {
      label: node.name,
      value: JSON.stringify(node.path),
      children: [] as Option[]
    }
    if(node.aps?.length) {
      venue.children.push({
        label: nonSelectableNode($t({ defaultMessage:'APs' })),
        value: `aps${index}`,
        children: node.aps.map((ap: ApOrSwitch) => ({
          label: ap.name,
          value: JSON.stringify([...node.path, { type: 'AP', name: ap.mac }])
        }))
      })
    }
    if(switchGroups.get(node.name)?.switches.length) {
      venue.children.push({
        label: nonSelectableNode($t({ defaultMessage: 'Switches' })),
        value: `switches${index}`,
        children: switchGroups.get(node.name).switches.map((switchNode: ApOrSwitch) => ({
          label: switchNode.name,
          value: JSON.stringify([
            ...switchGroups.get(node.name).path,
            { type: 'switch', name: switchNode.mac }
          ])
        }))
      })
    }
    return venue
  })
}

function ConnectedNetworkFilter () {
  const { $t } = useIntl()
  const { setNetworkPath, filters, raw }  = useAnalyticsFilter()
  const queryResults = useNetworkFilterQuery(omit(filters, 'path'), {
    selectFromResult: ({ data, ...rest }) => ({
      data: data ? getFilterData(data, $t) : [],
      ...rest
    })
  })
  console.log('render', raw)
  return <Loader states={[queryResults]}>
    <NetworkFilter
      placeholder={$t({ defaultMessage: 'Entire Organization' })}
      multiple={false}
      defaultValue={raw}
      value={raw}
      options={queryResults.data}
      changeOnSelect
      onApply={(value) => {
        if (!value) {
          setNetworkPath(defaultNetworkPath, [])
          return true
        } else {
          const strPath = value?.slice(-1)[0] as string
          let path = []
          if (strPath.startsWith('aps') || strPath.startsWith('switches')) {
            path = JSON.parse(value?.slice(0)[0] as string)
            value = value?.slice(0, 1)
            setNetworkPath(path, value)
            return false
          } else {
            path = JSON.parse(strPath)
            setNetworkPath(path, value)
            return true
          }
        }
      }}
      placement='bottomRight'
    />
  </Loader>
}

export default ConnectedNetworkFilter
