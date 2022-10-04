import { DefaultOptionType }         from 'antd/lib/select'
import { omit, groupBy, pick, find } from 'lodash'
import { SingleValueType }           from 'rc-cascader/lib/Cascader'
import { useIntl }                   from 'react-intl'

import { useAnalyticsFilter, defaultNetworkPath, Incident } from '@acx-ui/analytics/utils'
import { calculateSeverity }                                from '@acx-ui/analytics/utils'
import { NetworkFilter, Option, Loader }                    from '@acx-ui/components'

import { useIncidentsListQuery } from '../IncidentTable/services'

import { LabelWithSeverityCicle }                   from './LabelWithSeverityCircles'
import { Child, useNetworkFilterQuery, ApOrSwitch } from './services'
import * as UI                                      from './styledComponents'

export type NodesWithSeverity = Pick<Incident, 'sliceType'> & {
  venueName: string;
  severity: { [key: string]: number };
}
export type VenuesWithSeverityNodes = { [key: string]: NodesWithSeverity[] }

const getSeverityFromIncidents = (
  incidentsList: Incident[]
): VenuesWithSeverityNodes =>
  groupBy(
    incidentsList.map((incident: Incident) => ({
      ...pick(incident, ['sliceType', 'path']),
      severity: {
        [find(incident.path, { type: incident.sliceType })?.name ?? '']:
          incident.severity
      },
      venueName:
        find(incident.path, { type: 'zone' })?.name ??
        find(incident.path, { type: 'switchGroup' })?.name ??
        ''
    })),
    'venueName'
  )
const getSeverityCircles = (
  nodes: ApOrSwitch[],
  venueWiseSeverities: NodesWithSeverity[],
  nodeType?: string
) => {
  if (!venueWiseSeverities) return
  let severityArray = nodes.reduce((acc: string[], val: ApOrSwitch) => {
    venueWiseSeverities.forEach((apOrSwitchWithSeverity: NodesWithSeverity) => {
      const severity = calculateSeverity(apOrSwitchWithSeverity.severity[val?.mac])
      if (severity && !acc.includes(severity)) acc.push(severity)
    })
    return acc
  }, [])
  if (nodeType === 'venue')
    venueWiseSeverities.forEach((venue: NodesWithSeverity) => {
      if (venue.sliceType === 'zone') {
        const severity = calculateSeverity(venue?.severity[venue.venueName])
        if (severity && !severityArray.includes(severity)) severityArray.push(severity)
      }
    })
  return severityArray.sort()
}
const getApsAndSwitches = ( data: Child[], name : string) =>
  data.reduce((acc : ApOrSwitch[] | [], datum : Child) => {
    const { aps, switches } = datum
    if(datum.name === name)
      acc = [...acc,...(aps || []), ...(switches || [])]
    return acc
  }, [] )

const getFilterData = (
  data: Child[],
  $t: CallableFunction,
  nodesWithSeverities: VenuesWithSeverityNodes
): Option[] => {
  const venues: { [key: string]: Option } = {}
  for (const { name, path, aps, switches } of data) {
    if (!venues[name]) {
      venues[name] = {
        label: (
          <LabelWithSeverityCicle
            severityCircles={getSeverityCircles(
              getApsAndSwitches(data, name),
              nodesWithSeverities[name],
              'venue'
            )}
            name={name}
          />
        ),
        value: JSON.stringify(path),
        displayLabel: name,
        children: [] as Option[]
      }
    }
    const venue = venues[name]
    if (aps?.length && venue.children) {
      venue.children.push({
        label: (
          <UI.NonSelectableItem key={name}>
            <LabelWithSeverityCicle
              severityCircles={getSeverityCircles(
                aps,
                nodesWithSeverities[name]
              )}
              name={$t({ defaultMessage: 'APs' })}
            />
          </UI.NonSelectableItem>
        ),
        displayLabel: $t({ defaultMessage: 'APs' }),
        ignoreSelection: true,
        value: `aps${name}`,
        children: aps.map((ap: ApOrSwitch) => {
          return {
            label: (
              <LabelWithSeverityCicle
                severityCircles={getSeverityCircles(
                  [ap],
                  nodesWithSeverities[name]
                )}
                name={ap.name}
              />
            ),
            displayLabel: ap.name,
            value: JSON.stringify([...path, { type: 'AP', name: ap.mac }])
          }
        })
      })
    }
    if (switches?.length && venue.children) {
      venue.children.push({
        label: (
          <UI.NonSelectableItem key={name}>
            <LabelWithSeverityCicle
              severityCircles={getSeverityCircles(
                switches,
                nodesWithSeverities[name]
              )}
              name={$t({ defaultMessage: 'Switches' })}
            />
          </UI.NonSelectableItem>
        ),
        displayLabel: $t({ defaultMessage: 'Switches' }),
        ignoreSelection: true,
        value: `switches${name}`,
        children: switches.map((switchNode: ApOrSwitch) => {
          return {
            label: (
              <LabelWithSeverityCicle
                severityCircles={getSeverityCircles(
                  [switchNode],
                  nodesWithSeverities[name]
                )}
                name={switchNode.name}
              />
            ),
            displayLabel: switchNode.name,
            value: JSON.stringify([...path, { type: 'switch', name: switchNode.mac }])
          }
        })
      })
    }
  }
  return Object.values(venues).sort((a: Option, b: Option) =>
    a.displayLabel && b.displayLabel
      ? a.displayLabel.toString().localeCompare(b.displayLabel.toString())
      : 0
  )
}

const search = (input: string, path: DefaultOptionType[]): boolean => {
  const item = path.slice(-1)[0]
  return item.ignoreSelection // non-selection implies non-searchable
    ? false
    : (item?.displayLabel as string)?.toLowerCase().includes(input.toLowerCase())
}
export const displayRender = ({}, selectedOptions: DefaultOptionType[] | undefined) =>
  selectedOptions?.map((option) => option?.displayLabel || option?.label).join(' / ')
export const onApply = (
  value: SingleValueType | SingleValueType[] | undefined,
  setNetworkPath: CallableFunction
) => {
  const path = !value ? defaultNetworkPath : JSON.parse(value?.slice(-1)[0] as string)
  setNetworkPath(path, value || [])
}

function ConnectedNetworkFilter () {
  const { $t } = useIntl()
  const { setNetworkPath, filters, raw } = useAnalyticsFilter()
  const incidentsList = useIncidentsListQuery(({ ...filters, path: defaultNetworkPath }), {
    selectFromResult: ({ data }) => ({
      data: data ? getSeverityFromIncidents(data) : []
    })
  })
  const queryResults = useNetworkFilterQuery(omit(filters, 'path'), {
    selectFromResult: ({ data, ...rest }) => ({
      data: data ? getFilterData(data, $t, incidentsList.data as VenuesWithSeverityNodes) : [],
      ...rest
    })
  })
  return (
    <UI.Container>
      <Loader states={[queryResults]}>
        <NetworkFilter
          placeholder={$t({ defaultMessage: 'Entire Organization' })}
          multiple={false}
          defaultValue={raw}
          value={raw}
          options={queryResults.data}
          onApply={(value) => onApply(value, setNetworkPath)}
          placement='bottomRight'
          displayRender={displayRender}
          showSearch={{ filter: search }}
        />
      </Loader>
    </UI.Container>
  )
}

export default ConnectedNetworkFilter
