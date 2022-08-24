import { DefaultOptionType } from 'antd/lib/select'
import { omit, uniqBy }      from 'lodash'
import { SingleValueType }   from 'rc-cascader/lib/Cascader'
import { useIntl }           from 'react-intl'

import { useAnalyticsFilter, defaultNetworkPath } from '@acx-ui/analytics/utils'
import { NetworkFilter, Option, Loader }          from '@acx-ui/components'

import { Child, useNetworkFilterQuery, ApOrSwitch } from './services'
import * as UI                                      from './styledComponents'


const getFilterData = (data: Child[], $t: CallableFunction): Option [] => {
  const venues = data.filter(node => node.type === 'zone')
  const uniqSwGrps = uniqBy(data, 'name').filter(node => node.type === 'switchGroup')
  const switchGroups = data
    .filter(node => node.type === 'switchGroup')
    .reduce((obj, node) => obj.set(node.name, node), new Map())
  return [...venues, ...uniqSwGrps].map((node, index) => {
    const venue = {
      label: node.name,
      value: JSON.stringify(node.path),
      children: [] as Option[]
    }
    if(node.aps?.length) {
      venue.children.push({
        label: <UI.NonSelectableItem key={index}>
          {$t({ defaultMessage: 'APs' })}
        </UI.NonSelectableItem>,
        displayLabel: $t({ defaultMessage: 'APs' }),
        ignoreSelection: true,
        value: `aps${index}`,
        children: node.aps.map((ap: ApOrSwitch) => ({
          label: ap.name,
          value: JSON.stringify([...node.path, { type: 'AP', name: ap.mac }])
        }))
      })
    }
    if(switchGroups.get(node.name)?.switches.length) {
      venue.children.push({
        label: <UI.NonSelectableItem key={index}>
          {$t({ defaultMessage: 'Switches' })}
        </UI.NonSelectableItem>,
        displayLabel: $t({ defaultMessage: 'Switches' }),
        ignoreSelection: true,
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
const search = (input: string, path: DefaultOptionType[]) : boolean => {
  const item = path.slice(-1)[0]
  return item.ignoreSelection // non-selection implies non-searchable
    ? false
    : (item?.label as string)?.toLowerCase().includes(input.toLowerCase())
}
export const displayRender = ({}, selectedOptions: DefaultOptionType[] | undefined) => 
  selectedOptions
    ?.map(option => option?.displayLabel || option?.label).join(' / ')
export const onApply = (
  value: SingleValueType | SingleValueType[] | undefined,
  setNetworkPath: CallableFunction
) => {
  const path = !value
    ? defaultNetworkPath
    : JSON.parse(value?.slice(-1)[0] as string)
  setNetworkPath(path, value || [])
}

function ConnectedNetworkFilter () {
  const { $t } = useIntl()
  const { setNetworkPath, filters, raw } = useAnalyticsFilter()
  const queryResults = useNetworkFilterQuery(omit(filters, 'path'), {
    selectFromResult: ({ data, ...rest }) => ({
      data: data ? getFilterData(data, $t) : [],
      ...rest
    })
  }) 
  return <UI.Container>
    <Loader states={[queryResults]}>
      <NetworkFilter
        placeholder={$t({ defaultMessage: 'Entire Organization' })}
        multiple={false}
        defaultValue={raw}
        value={raw} 
        options={queryResults.data}
        onApply={value => onApply(value, setNetworkPath)}
        placement='bottomRight'
        displayRender={displayRender}
        showSearch={{ filter: search }}
      />
    </Loader>
  </UI.Container>
}

export default ConnectedNetworkFilter
