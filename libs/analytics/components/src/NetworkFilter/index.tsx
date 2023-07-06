import { useState } from 'react'

import { omit, groupBy, pick, find } from 'lodash'
import { SingleValueType }           from 'rc-cascader/lib/Cascader'
import { useIntl }                   from 'react-intl'

import {
  useAnalyticsFilter,
  calculateSeverity,
  defaultNetworkPath,
  Incident } from '@acx-ui/analytics/utils'
import { Cascader, Loader, RadioBand } from '@acx-ui/components'
import type { CascaderOption }         from '@acx-ui/components'
import { useReportsFilter }            from '@acx-ui/reports/utils'
import { NetworkPath, getIntl }        from '@acx-ui/utils'

import { useIncidentsListQuery } from '../IncidentTable/services'

import { Child, useNetworkFilterQuery, ApOrSwitch } from './services'
import { SeverityCircles }                          from './SeverityCircles'
import * as UI                                      from './styledComponents'

export type FilterMode = 'ap' | 'switch' | 'both' | 'none'

export type NodesWithSeverity = Pick<Incident, 'sliceType'> & {
  venueName: string;
  severity: { [key: string]: number };
}
export type VenuesWithSeverityNodes = { [key: string]: NodesWithSeverity[] }
type ConnectedNetworkFilterProps = {
    shouldQuerySwitch : boolean,
    withIncidents?: boolean,
    showRadioBand?: boolean,
    multiple?: boolean,
    filterMode?: FilterMode,
    filterFor?: 'analytics' | 'reports',
    defaultValue?: SingleValueType | SingleValueType[],
    defaultRadioBand?: RadioBand[],
    isRadioBandDisabled?: boolean,
    radioBandDisabledReason?: string
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
  filterMode: FilterMode,
  replaceVenueNameWithId: boolean
): CascaderOption[] => {
  const { $t } = getIntl()
  const venues: { [key: string]: CascaderOption } = {}
  for (const { id, name, path, aps, switches } of data) {
    const shouldPushVenue = ()=>{
      if(filterMode === 'both')
        return true
      if(filterMode === 'ap' && aps?.length)
        return true
      if(filterMode === 'switch' && switches?.length)
        return true

      return false
    }
    // replace venue name with id to be compatible with rc/reports
    const venuePath = replaceVenueNameWithId
      ? [path[0], { ...path[1], name: id }]
      : path
    if (shouldPushVenue() && !venues[name]) {
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
    const venue = venues[name]
    if (venue && aps?.length && venue.children && ['ap','both'].includes(filterMode)) {
      venue.children.push({
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
            label: ap.name,
            extraLabel: <SeverityCircles severityCircles={severityData} />,
            value: JSON.stringify([...venuePath, { type: 'AP', name: ap.mac }])
          }
        })
      })
    }
    if (venue && switches?.length && venue.children && ['switch','both'].includes(filterMode)) {
      venue.children.push({
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
            label: switchNode.name,
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

export { ConnectedNetworkFilter as NetworkFilter }

function ConnectedNetworkFilter (
  { shouldQuerySwitch,
    withIncidents,
    showRadioBand,
    filterMode='both',
    filterFor='analytics',
    multiple,
    defaultValue,
    defaultRadioBand,
    isRadioBandDisabled=false,
    radioBandDisabledReason } : ConnectedNetworkFilterProps
) {
  const { $t } = useIntl()
  const [ open, setOpen ] = useState(false)
  const { setNetworkPath, filters, raw } = useAnalyticsFilter()
  const { setNetworkPath: setReportsNetworkPath,
    raw: reportsRaw, filters: reportsFilter } = useReportsFilter()
  let { bands: selectedBands } = reportsFilter
  const incidentsList = useIncidentsListQuery(
    { ...filters, includeMuted: false },
    {
      skip: !Boolean(withIncidents),
      selectFromResult: ({ data }) => ({
        data: data ? getSeverityFromIncidents(data) : []
      })
    }
  )

  const networkFilter = { ...filters, shouldQuerySwitch }
  const queryResults = useNetworkFilterQuery(omit(networkFilter, 'path', 'filter'), {
    selectFromResult: ({ data, ...rest }) => ({
      data: data ?
        getNetworkFilterData(data, incidentsList.data as VenuesWithSeverityNodes,
          filterMode, true) : [],
      ...rest
    })
  })
  const isReports = filterFor === 'reports'
  let rawVal:string[][] = isReports ? reportsRaw : raw
  // Below condition will avoid empty tags in the filter while switching between AP and Switch reports
  if(filterMode === 'switch'){
    selectedBands=[]
    rawVal=rawVal.filter(value=>{
      return !value[0].includes('zone')
    })
  }else if(filterMode === 'ap'){
    rawVal=rawVal.filter(value=>{
      return !value[0].includes('switchGroup')
    })
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
