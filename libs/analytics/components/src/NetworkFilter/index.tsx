import { useState } from 'react'

import { groupBy, pick, find } from 'lodash'
import { SingleValueType }     from 'rc-cascader/lib/Cascader'
import { useIntl }             from 'react-intl'

import {
  useAnalyticsFilter,
  calculateSeverity,
  defaultNetworkPath,
  Incident } from '@acx-ui/analytics/utils'
import { Cascader, Loader, RadioBand }           from '@acx-ui/components'
import type { CascaderOption }                   from '@acx-ui/components'
import { useReportsFilter }                      from '@acx-ui/reports/utils'
import { NetworkPath, getIntl, AnalyticsFilter } from '@acx-ui/utils'

import { useIncidentsListQuery } from '../IncidentTable/services'
import { useIncidentToggles }    from '../useIncidentToggles'

import { useVenuesHierarchyQuery } from './services'
import { SeverityCircles }         from './SeverityCircles'
import * as UI                     from './styledComponents'

import type { Child, ApOrSwitch } from './services'

export type FilterMode = 'ap' | 'switch' | 'edge' | 'both' | 'none'

export type NodesWithSeverity = Pick<Incident, 'sliceType'> & {
  venueName: string;
  severity: { [key: string]: number };
}

export type VenuesWithSeverityNodes = { [key: string]: NodesWithSeverity[] }
type ConnectedNetworkFilterProps = {
  shouldQuerySwitch: boolean,
  shouldQueryAp: boolean,
  shouldShowOnlyVenues?: boolean,
  withIncidents?: boolean,
  showRadioBand?: boolean,
  multiple?: boolean,
  filterFor?: 'analytics' | 'reports',
  defaultValue?: SingleValueType | SingleValueType[],
  defaultRadioBand?: RadioBand[],
  isRadioBandDisabled?: boolean,
  radioBandDisabledReason?: string,
  overrideFilters? : AnalyticsFilter | {}
}
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
      if (
        severity &&
        !acc.includes(severity) &&
        apOrSwitchWithSeverity.severity[val?.mac]
      )
        acc.push(severity)
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

export const getNetworkFilterData = (
  data: Child[],
  nodesWithSeverities: VenuesWithSeverityNodes,
  replaceVenueNameWithId: boolean,
  shouldShowOnlyVenues?: boolean
): CascaderOption[] => {
  const { $t } = getIntl()
  const venues: { [key: string]: CascaderOption } = {}
  for (const { id, name, aps, switches } of data) {
    const venuePath = [
      ...defaultNetworkPath,
      { type: aps?.length ? 'zone' : 'switchGroup', name: replaceVenueNameWithId ? id : name }
    ]
    if (!venues[name]) {
      const severityData = getSeverityCircles(
        getApsAndSwitches(data, name),
        nodesWithSeverities[name],
        'venue'
      )
      venues[name] = {
        label: name,
        extraLabel: <SeverityCircles severityCircles={severityData} />,
        value: JSON.stringify(venuePath),
        children: [] as CascaderOption[]
      }
    }

    // Don't show APs and switches in the network filter
    if (shouldShowOnlyVenues) continue

    const venue = venues[name]
    if (aps?.length) {
      venue.children!.push({
        label: $t({ defaultMessage: 'APs' }),
        extraLabel: <SeverityCircles
          severityCircles={getSeverityCircles(
            aps,
            nodesWithSeverities[name]
          )}
        />,
        ignoreSelection: true,
        value: `aps${replaceVenueNameWithId ? id : name}`,
        children: aps.map((ap: ApOrSwitch) => {
          const severityData = getSeverityCircles(
            [ap],
            nodesWithSeverities[name]
          )
          return {
            label: `${ap.name} (${ap.mac})`,
            extraLabel: <SeverityCircles severityCircles={severityData} />,
            value: JSON.stringify([...venuePath, { type: 'AP', name: ap.mac }])
          }
        })
      })
    }
    if (switches?.length) {
      venue.children!.push({
        label: $t({ defaultMessage: 'Switches' }),
        extraLabel: <SeverityCircles
          severityCircles={getSeverityCircles(
            switches,
            nodesWithSeverities[name]
          )}
        />,
        ignoreSelection: true,
        value: `switches${replaceVenueNameWithId ? id : name}`,
        children: switches.map((switchNode: ApOrSwitch) => {
          const severityData = getSeverityCircles(
            [switchNode],
            nodesWithSeverities[name]
          )
          return {
            label: `${switchNode.name} (${switchNode.mac})`,
            extraLabel: <SeverityCircles severityCircles={severityData} />,
            value: JSON.stringify([...venuePath, { type: 'switch', name: switchNode.mac }])
          }
        })
      })
    }
  }
  return Object.values(venues).sort((a: CascaderOption, b: CascaderOption) =>
    (a.label as string).localeCompare(b.label as string)
  )
}

export const onApply = (
  value: SingleValueType | SingleValueType[] | undefined,
  setNetworkPath: CallableFunction
) => {
  const path = !value || value.length === 0
    ? []
    : JSON.parse(value?.slice(-1)[0] as string)
  setNetworkPath(path, value || [])
}

/**
 * Modify the raw values based on the provided criteria.
 *
 * @param {string[]} rawVal - The array of raw values to be modified
 * @param {string} queriedData - The text data to compare with
 * @param {string} targetType - The type to match in the raw values
 * @param {string} replacementType - The text to replace in the raw values
 * @return {string[]} The modified raw values array
 */
export const modifyRawValue = (
  rawVal:string[], queriedData: string, targetType: string, replacementType: string
) => {
  const newRawVal = rawVal.map(value => {
    if (value.startsWith('[') && value.endsWith(']')) {
      return JSON.parse(value)
        .map((item: { name: string, type: string }) => {
          return item.type === targetType
            && queriedData.includes(`{"type":"${item.type}","name":"${item.name}"}`)
            ? item
            : (item.type === 'zone' || item.type === 'switchGroup')
              ? { ...item, type: replacementType } : item
        })
    }
    return value
  }).map(item => Array.isArray(item) ? JSON.stringify(item) : item)
  // Should return [] if the queried data does not contain the selected node path present in rawVal
  return newRawVal.some(value => queriedData.includes(value))
    ? newRawVal
    : []
}

export { ConnectedNetworkFilter as NetworkFilter }

function ConnectedNetworkFilter ({
  shouldQuerySwitch,
  shouldQueryAp,
  shouldShowOnlyVenues,
  withIncidents,
  showRadioBand,
  filterFor='analytics',
  multiple,
  defaultValue,
  defaultRadioBand,
  isRadioBandDisabled=false,
  radioBandDisabledReason,
  overrideFilters = {}
} : ConnectedNetworkFilterProps) {
  const { $t } = useIntl()
  const toggles = useIncidentToggles()
  const [ open, setOpen ] = useState(false)
  const { setNetworkPath, filters, raw } = useAnalyticsFilter()
  const { setNetworkPath: setReportsNetworkPath,
    raw: reportsRaw, filters: reportsFilter } = useReportsFilter()
  let { bands: selectedBands } = reportsFilter
  const incidentsList = useIncidentsListQuery(
    { ...filters, ...overrideFilters, toggles, includeMuted: false, filter: {} },
    {
      skip: !Boolean(withIncidents),
      selectFromResult: ({ data }) => ({
        data: data ? getSeverityFromIncidents(data) : []
      })
    }
  )
  const incidents = incidentsList.data as VenuesWithSeverityNodes
  const queryResults = useVenuesHierarchyQuery({
    startDate: filters.startDate,
    endDate: filters.endDate,
    range: filters.range,
    ...overrideFilters,
    shouldQuerySwitch,
    shouldQueryAp
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: data ? getNetworkFilterData(data, incidents, true, shouldShowOnlyVenues) : [],
      ...rest
    })
  })

  const isReports = filterFor === 'reports'
  let rawVal:string[] = isReports ? reportsRaw : raw

  if(isReports){
    // Below condition will avoid empty tags in the filter while switching between AP and Switch reports
    if(!shouldQueryAp){
      selectedBands=[]
      rawVal=rawVal.filter(value=>{
        return !value[0].includes('zone')
      })
    }
    if(!shouldQuerySwitch){
      rawVal=rawVal.filter(value=>{
        return !value[0].includes('switchGroup')
      })
    }
  } else {
    const dataText = queryResults.data
      .filter(Boolean)
      .map(({ value }) => value)
      .join(',')

    if(!shouldQueryAp && shouldQuerySwitch){
      rawVal = modifyRawValue(rawVal, dataText, 'zone', 'switchGroup')
    } else if(shouldQueryAp){
      rawVal = modifyRawValue(rawVal, dataText, 'switchGroup', 'zone')
    }
  }

  return (
    <UI.Container $open={open}>
      <Loader states={[queryResults]}>
        <Cascader
          placeholder={$t({ defaultMessage: 'Entire Organization' })}
          multiple={multiple}
          checkable={multiple}
          menuMaxWidth='460px'
          labelMaxWidth='150px'
          showRadioBand={showRadioBand}
          defaultValue={defaultValue || rawVal}
          defaultRadioBand={defaultRadioBand || selectedBands || []}
          isRadioBandDisabled={isRadioBandDisabled}
          radioBandDisabledReason={radioBandDisabledReason}
          value={defaultValue || rawVal}
          options={queryResults.data}
          dropdownAlign={{ overflow: { adjustX: false, adjustY: false } }}
          onApply={(value,bands) => {
            if(showRadioBand || multiple){
              let paths:NetworkPath[]=[]
              if(value?.length){
                value.forEach(item => {
                  const lastElement = (item as SingleValueType).slice(-1)[0] as string
                  if(lastElement.includes('{')){
                    const fullPath:NetworkPath=JSON.parse(lastElement)
                    paths.push(fullPath)
                  }else{
                    const isSwitchGroup = lastElement.indexOf('switches') === 0
                    const firstElement = (item as SingleValueType)[0] as string
                    const fullPath:NetworkPath=JSON.parse(firstElement)
                    if(isSwitchGroup && fullPath[1]){
                      fullPath[1].type = 'switchGroup'
                    }
                    paths.push(fullPath)
                  }
                })
              }else{
                paths.push(defaultNetworkPath)
              }
              setReportsNetworkPath(paths, (bands || []) as RadioBand[], value || [])
            }else{
              onApply(value, setNetworkPath)
            }
          }}
          allowClear
          open={open}
          onDropdownVisibleChange={setOpen}
        />
      </Loader>
    </UI.Container>
  )
}
