import { DefaultOptionType } from 'antd/lib/select'
import { omit }              from 'lodash'
import { SingleValueType }   from 'rc-cascader/lib/Cascader'
import { useIntl }           from 'react-intl'

import { useAnalyticsFilter, defaultNetworkPath, calculateSeverity } from '@acx-ui/analytics/utils'
import { NetworkFilter, Option, Loader }                             from '@acx-ui/components'

import { Child, useNetworkFilterQuery, ApOrSwitch } from './services'
import * as UI                                      from './styledComponents'

const getFilterData = (data: Child[], $t: CallableFunction): Option [] => {
  const venues: { [key: string]: Option; } = {}
  for (const { name, path, aps, switches } of data) {
    if (!venues[name]) {
      const severityCircles = getSeverityCircles([...(aps || []), ...(switches || [])])
      venues[name] = {
        label: 
        <UI.LabelContainer>
          <UI.Label>{name}</UI.Label>
          <UI.SeverityContainer>
            { severityCircles.map((severityCircle)=>
              <UI.SeveritySpan severity={severityCircle} />)
            }
          </UI.SeverityContainer>
        </UI.LabelContainer>,
        value: JSON.stringify(path),
        children: [] as Option[]
      }
    }
    const venue = venues[name]
    if(aps?.length && venue.children) {
      const severityCircles = getSeverityCircles(aps)

      venue.children.push({
        label: (
          <UI.NonSelectableItem key={name}>
            <UI.LabelContainer>
              <UI.Label>{$t({ defaultMessage: 'APs' })}</UI.Label>
              <UI.SeverityContainer>
                { severityCircles.map((severityCircle)=>
                  <UI.SeveritySpan severity={severityCircle} />)
                }
              </UI.SeverityContainer>
            </UI.LabelContainer>
          </UI.NonSelectableItem>
        ), // function call
        displayLabel: $t({ defaultMessage: 'APs' }),
        ignoreSelection: true,
        value: `aps${name}`,
        children: aps.map((ap: ApOrSwitch) => ({
          label: (
            <UI.LabelContainer>
              <UI.Label>{ap.name}</UI.Label>
              <UI.SeverityContainer>
                <UI.SeveritySpan severity={calculateSeverity(ap.incidentSeverity) as string} />
              </UI.SeverityContainer>
            </UI.LabelContainer>
          ), //easy straight forward
          value: JSON.stringify([...path, { type: 'AP', name: ap.mac }])
        }))
      })
    }
    if(switches?.length && venue.children) {
      const severityCircles = getSeverityCircles(switches)

      venue.children.push({
        label: (
          <UI.NonSelectableItem key={name}>
            <UI.LabelContainer>
              <UI.Label>{$t({ defaultMessage: 'Switches' })}</UI.Label>
              <UI.SeverityContainer>
                { severityCircles.map((severityCircle)=>
                  <UI.SeveritySpan severity={severityCircle} />)
                }
              </UI.SeverityContainer>
            </UI.LabelContainer>
          </UI.NonSelectableItem>
        ), // function call
        displayLabel: $t({ defaultMessage: 'Switches' }),
        ignoreSelection: true,
        value: `switches${name}`,
        children: switches.map((switchNode: ApOrSwitch) => ({
          label: (
            <UI.LabelContainer>
              <UI.Label>{switchNode.name}</UI.Label>
              <UI.SeverityContainer>
                <UI.SeveritySpan
                  severity={calculateSeverity(switchNode.incidentSeverity) as string}
                />
              </UI.SeverityContainer>
            </UI.LabelContainer>
          ), //easy straight forward
          value: JSON.stringify([...path, { type: 'switch', name: switchNode.mac }])
        }))
      })
    }
  }
  return Object.values(venues)
}

const getSeverityCircles = (
  data: ApOrSwitch[]
) => {
  const severityArray = data.reduce(
    (acc: string[], val: ApOrSwitch) => {
      const severity = calculateSeverity(val.incidentSeverity)
      if(severity && !acc.includes(severity))
        acc.push(severity)
      return acc
    },
    []
  )
  return severityArray
}

const search = (input: string, path: DefaultOptionType[]) : boolean => {
  const item = path.slice(-1)[0]
  return item.ignoreSelection // non-selection implies non-searchable
    ? false
    : (item?.displayLabel as string)?.toLowerCase().includes(input.toLowerCase())
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


// const getFilterData = (data: Child[], $t: CallableFunction): Option [] => {
//   const venues = data.filter(node => node.type === 'zone')
//   const uniqSwGrps = uniqBy(data, 'name').filter(node => node.type === 'switchGroup')
//   const switchGroups = data
//     .filter((node) => node.type === 'switchGroup')
//     .reduce((obj, node) => obj.set(node.name, node), new Map())
//   return [...venues, ...uniqSwGrps].map((node, index) => {
//     const severityCircles = getSeverityCircles([...(node.aps || []), ...(node.switches || [])])
//     const venue = {
//       label: (
//         <UI.LabelContainer>
//           <UI.Label>{node.name}</UI.Label>
//           <UI.SeverityContainer>
//             { severityCircles.map((severityCircle)=>
//               <UI.SeveritySpan severity={severityCircle} />)
//             }
//           </UI.SeverityContainer>
//         </UI.LabelContainer>
//       ), // function call
//       value: JSON.stringify(node.path),
//       children: [] as Option[],
//       displayLabel: node.name
//     }
//     if (node.aps?.length) {
//       const severityCircles = getSeverityCircles(node.aps)
//       venue.children.push({
//         label: (
//           <UI.NonSelectableItem key={index}>
//             <UI.LabelContainer>
//               <UI.Label>{$t({ defaultMessage: 'APs' })}</UI.Label>
//               <UI.SeverityContainer>
//                 { severityCircles.map((severityCircle)=>
//                   <UI.SeveritySpan severity={severityCircle} />)
//                 }
//               </UI.SeverityContainer>
//             </UI.LabelContainer>
//           </UI.NonSelectableItem>
//         ), // function call
//         displayLabel: $t({ defaultMessage: 'APs' }),
//         ignoreSelection: true,
//         value: `aps${index}`,
//         children: node.aps.map((ap: ApOrSwitch) => ({
//           label: (
//             <UI.LabelContainer>
//               <UI.Label>{ap.name}</UI.Label>
//               <UI.SeverityContainer>
//                 <UI.SeveritySpan severity={calculateSeverity(ap.incidentSeverity) as string} />
//               </UI.SeverityContainer>
//             </UI.LabelContainer>
//           ), //easy straight forward
//           displayLabel: ap.name,
//           value: JSON.stringify([...node.path, { type: 'AP', name: ap.mac }])
//         }))
//       })
//     }
//     if (switchGroups.get(node.name)?.switches.length) {
//       const severityCircles = getSeverityCircles(switchGroups.get(node.name).switches)
//       venue.children.push({
//         label: (
//           <UI.NonSelectableItem key={index}>
//             <UI.LabelContainer>
//               <UI.Label>{$t({ defaultMessage: 'Switches' })}</UI.Label>
//               <UI.SeverityContainer>
//                 { severityCircles.map((severityCircle)=>
//                   <UI.SeveritySpan severity={severityCircle} />)
//                 }
//               </UI.SeverityContainer>
//             </UI.LabelContainer>
//           </UI.NonSelectableItem>
//         ), // function call
//         displayLabel: $t({ defaultMessage: 'Switches' }),
//         ignoreSelection: true,
//         value: `switches${index}`,
//         children: switchGroups.get(node.name).switches.map((switchNode: ApOrSwitch) => ({
//           label: (
//             <UI.LabelContainer>
//               <UI.Label>{switchNode.name}</UI.Label>
//               <UI.SeverityContainer>
//                 <UI.SeveritySpan
//                   severity={calculateSeverity(switchNode.incidentSeverity) as string}
//                 />
//               </UI.SeverityContainer>
//             </UI.LabelContainer>
//           ), //easy straight forward
//           displayLabel: switchNode.name,
//           value: JSON.stringify([
//             ...switchGroups.get(node.name).path,
//             { type: 'switch', name: switchNode.mac }
//           ])
//         }))
//       })
//     }
//   }
//   return Object.values(venues)
// }
