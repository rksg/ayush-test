import { DefaultOptionType }         from 'antd/lib/select'
import { omit, groupBy, pick, find } from 'lodash'
import { SingleValueType }           from 'rc-cascader/lib/Cascader'
import { useIntl }                   from 'react-intl'

import {
  useAnalyticsFilter,
  calculateSeverity,
  defaultNetworkPath,
  Incident } from '@acx-ui/analytics/utils'
import { Select, Option, Loader, RadioBand } from '@acx-ui/components'
import { useReportsFilter }                  from '@acx-ui/reports/utils'
import { NetworkPath }                       from '@acx-ui/utils'

import { useIncidentsListQuery } from '../IncidentTable/services'

import { LabelWithSeverityCicle }                   from './LabelWithSeverityCircles'
import { Child, useNetworkFilterQuery, ApOrSwitch } from './services'
import * as UI                                      from './styledComponents'

export type FilterMode = 'ap' | 'switch' | 'both' | 'none'

export const getSupersetRlsClause = (paths?:NetworkPath[],radioBands?:RadioBand[]) => {
  let radioBandClause = ''
  let zoneClause = ''
  let apClause = ''
  let switchGroupClause = ''
  let switchClause = ''
  let networkClause = ''

  if(radioBands?.length){
    radioBandClause = ` "band" in (${radioBands.map(radioBand=>`'${radioBand}'`).join(', ')})`
  }

  if(paths?.length){
    const zoneIds:string[] = []
    const switchGroupIds:string[] = []
    const apMacs:string[] = []
    const switchMacs:string[]=[]
    paths.forEach(path=>{
      if(path.length === 2 && path[1].type === 'zone'){
        zoneIds.push(`'${path[1].name}'`)
      }
      else if(path.length === 2 && path[1].type === 'switchGroup'){
        switchGroupIds.push(`'${path[1].name}'`)
      }
      else if(path.length === 3 && path[2].type === 'AP'){
        apMacs.push(`'${path[2].name}'`)
      }
      else if(path.length === 3 && path[2].type === 'switch'){
        switchMacs.push(`'${path[2].name}'`)
      }
    })
    if(zoneIds.length){
      zoneClause = `"zoneName" in (${zoneIds.join(', ')})`
    }

    if(apMacs.length){
      apClause = `"apMac" in (${apMacs.join(', ')})`
    }

    if(switchGroupIds.length){
      switchGroupClause = `"switchGroupLevelOneName" in (${switchGroupIds.join(', ')})`
    }

    if(switchMacs.length){
      switchClause = `"switchId" in (${switchMacs.join(', ')})`
    }

    if(zoneClause || apClause || switchGroupClause || switchClause){
      networkClause = ` (${[zoneClause,apClause,switchGroupClause,switchClause]
        .filter(item=>item!=='').join(' OR ')})`
    }
  }

  return {
    radioBandClause,
    networkClause
  }
}

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

const getFilterData = (
  data: Child[],
  $t: CallableFunction,
  nodesWithSeverities: VenuesWithSeverityNodes,
  filterMode:string
): Option[] => {
  const venues: { [key: string]: Option } = {}
  for (const { id, name, path, aps, switches } of data) {
    const shouldPushVenue = ()=>{
      if(filterMode==='both')
        return true
      if(filterMode === 'ap' && aps?.length)
        return true
      if(filterMode === 'switch' && switches?.length)
        return true

      return false
    }

    if (shouldPushVenue() && !venues[name]) {
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
        value: JSON.stringify(path).replace(name,id),
        displayLabel: name,
        children: [] as Option[]
      }
    }
    const venue = venues[name]
    if (venue && aps?.length && venue.children && ['ap','both'].includes(filterMode)) {
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
    if (venue && switches?.length && venue.children && ['switch','both'].includes(filterMode)) {
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
// eslint-disable-next-line no-empty-pattern
export const displayRender = ({}, selectedOptions: DefaultOptionType[] | undefined) =>
  selectedOptions?.map((option) => option?.displayLabel || option?.label).join(' / ')
export const onApply = (
  value: SingleValueType | SingleValueType[] | undefined,
  setNetworkPath: CallableFunction
) => {
  const path = !value || value.length === 0
    ? defaultNetworkPath
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
  const { setNetworkPath, filters, raw } = useAnalyticsFilter()
  const { setNetworkPath: setReportsNetworkPath,
    raw: reportsRaw, filters: reportsFilter } = useReportsFilter()
  const { bands: selectedBands } = reportsFilter
  /* eslint-disable react-hooks/rules-of-hooks */
  const incidentsList = withIncidents
    ? useIncidentsListQuery(
      omit({
        ...filters, path: defaultNetworkPath, includeMuted: false
      }, 'filter'),
      {
        selectFromResult: ({ data }) => ({
          data: data ? getSeverityFromIncidents(data) : []
        })
      }
    )
    : { data: [] }

  const networkFilter = { ...filters, shouldQuerySwitch }
  const queryResults = useNetworkFilterQuery(omit(networkFilter, 'path', 'filter'), {
    selectFromResult: ({ data, ...rest }) => ({
      data: data ?
        getFilterData(data, $t, incidentsList.data as VenuesWithSeverityNodes, filterMode) : [],
      ...rest
    })
  })
  const rawVal = filterFor === 'reports' ? reportsRaw : raw
  return (
    <UI.Container>
      <Loader states={[queryResults]}>
        <Select
          placeholder={$t({ defaultMessage: 'Entire Organization' })}
          multiple={multiple}
          showRadioBand={showRadioBand}
          defaultValue={defaultValue || rawVal}
          defaultRadioBand={defaultRadioBand || selectedBands || []}
          isRadioBandDisabled={isRadioBandDisabled}
          radioBandDisabledReason={radioBandDisabledReason}
          value={defaultValue || rawVal}
          options={queryResults.data}
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
          displayRender={displayRender}
          showSearch={{ filter: search }}
          allowClear
        />
      </Loader>
    </UI.Container>
  )
}
