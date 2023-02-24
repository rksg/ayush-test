import { gql } from 'graphql-request'
import _       from 'lodash'
import moment  from 'moment-timezone'

import { networkHealthApi }     from '@acx-ui/analytics/services'
import { useParams }            from '@acx-ui/react-router-dom'
import { APListNode, PathNode } from '@acx-ui/utils'

import { initialValues }               from './NetworkHealthForm/NetworkHealthForm'
import { TestType, ScheduleFrequency } from './types'

import type {
  APListNodes,
  NetworkHealthFormDto,
  NetworkHealthSpec,
  NetworkNodes,
  NetworkPaths,
  MutationResult
} from './types'

export const { useLazyNetworkHealthSpecNamesQuery } = networkHealthApi.injectEndpoints({
  endpoints: (build) => ({
    networkHealthSpecNames: build.query<string[], undefined>({
      query: () => ({
        document: gql`query ServiceGuardSpecNames { allServiceGuardSpecs { name } }`
      }),
      transformResponse: (result: { allServiceGuardSpecs: Array<{ name: string }> }) =>
        result.allServiceGuardSpecs.map(value => value.name)
    })
  })
})

const fetchServiceGuardSpec = gql`
  query FetchServiceGuardSpec ($id: String!) {
    serviceGuardSpec (id: $id) {
      id name type clientType
      configs {
        wlanName wlanUsername
        radio authenticationMethod
        speedTestEnabled pingAddress
        dnsServer tracerouteAddress
        updatedAt
        networkPaths {
          networkNodes {
            ... on NetworkNode { type name }
            ... on APsNode { type list }
          }
        }
      }
      schedule { type frequency day hour timezone }
    }
  }
`

const {
  useNetworkHealthDetailsQuery
} = networkHealthApi.injectEndpoints({
  endpoints: (build) => ({
    networkHealthDetails: build.query<NetworkHealthSpec, { id: string }>({
      query: (variables) => ({
        variables,
        document: fetchServiceGuardSpec
      }),
      transformResponse: (result: { serviceGuardSpec: NetworkHealthSpec }) =>
        result.serviceGuardSpec
    })
  })
})

export function useNetworkHealthSpec () {
  const params = useParams<{ specId: NetworkHealthSpec['id'] }>()
  return useNetworkHealthDetailsQuery(
    { id: String(params.specId) },
    { skip: !Boolean(params.specId) }
  )
}

function isAPListNodes (path: APListNodes | NetworkNodes): path is APListNodes {
  const last = path[path.length - 1]
  return _.has(last, 'list')
}

// TODO:
// Remove when APsSelection input available
function networkNodesToString (nodes: NetworkPaths) {
  return nodes
    .map((path: APListNodes | NetworkNodes) => {
      let aps: APListNode | undefined = undefined
      if (isAPListNodes(path)) {
        aps = path[path.length - 1] as APListNode
      }
      const newPath = ((aps
        ? path.slice(0, path.length - 1)
        : path) as PathNode[])
        .map(node => node.name)
        .join('>')

      return [newPath, aps?.list.join(',')]
        .filter(Boolean)
        .join('|')
    })
    .join('\n')
}

// TODO:
// Remove when APsSelection input available
function stringToNetworkNodes (value: string): NetworkPaths {
  const convert = (line: string): APListNodes | NetworkNodes => {
    const [paths, aps] = line.trim().split('|')
    const [venue, apGroup] = paths.split('>')
    const list = aps?.split(',').filter(Boolean).map(v => v.trim())
    const path: NetworkNodes = [{ type: 'zone', name: venue }]

    if (apGroup) path.push({ type: 'apGroup', name: venue })
    if (list) {
      return (path as APListNodes).concat({ type: 'apMac', list }) as APListNodes
    } else {
      return path
    }
  }
  return value.split('\n').map(convert)
}


export function processDtoToPayload (dto: NetworkHealthFormDto) {
  const spec = {
    ..._.omit(dto, ['typeWithSchedule', 'isDnsServerCustom']),
    configs: [{
      ..._.omit(dto.configs[0], ['updatedAt']),
      // TODO: Handle `networkPaths` when APsSelection input available
      networkPaths: { networkNodes: stringToNetworkNodes(
        dto.configs[0].networkPaths!.networkNodes as unknown as string
      ) }
    }]
  }
  return { spec }
}

const mod = (a: number, b: number) => ((a % b) + b) % b

export function specToDto (spec?: NetworkHealthSpec): NetworkHealthFormDto | undefined {
  if (!spec) return undefined

  const networkPaths = {
    networkNodes: networkNodesToString(spec.configs[0].networkPaths.networkNodes)
  }
  const localTimezone = moment.tz.guess()
  const schedule = { ...(spec.schedule! || initialValues.schedule) }
  const { frequency, day, hour, timezone } = schedule
  const typeWithSchedule = spec.type === TestType.OnDemand ? TestType.OnDemand : frequency!

  if (frequency) {
    const db = moment().tz(timezone!).format('YYYY-MM-DDTHH:mm')
    const local = moment().tz(localTimezone).format('YYYY-MM-DDTHH:mm')
    const differenceInHours = moment(local).diff(moment(db), 'hour', true)
    const totalHours = hour! + differenceInHours
    const rolloverHours = totalHours > 0 ? totalHours - 24 : Math.abs(totalHours)
    const differenceInDays = Math.ceil(rolloverHours / 24) * Math.sign(totalHours)
    schedule.hour = mod(totalHours, 24)
    if (frequency === ScheduleFrequency.Weekly) {
      schedule.day = mod(day! + differenceInDays, 7)
    }
    if (frequency === ScheduleFrequency.Monthly) {
      schedule.day = mod(day! - 1 + differenceInDays, 31) + 1
    }
  }

  return {
    typeWithSchedule,
    isDnsServerCustom: Boolean(spec.configs[0].dnsServer),
    ..._.omit(spec, ['schedule', 'configs']),
    schedule,
    configs: [{
      ...spec.configs[0],
      // TODO:
      // Take `networkPaths` from `spec.configs[0]` when APsSelection input available
      networkPaths
    }]
  }
}

type CreateUpdateMutationResult = MutationResult<{
  spec: Pick<NetworkHealthSpec, 'id'>
}>

const {
  useCreateNetworkHealthSpecMutation,
  useUpdateNetworkHealthSpecMutation
} = networkHealthApi.injectEndpoints({
  endpoints: (build) => ({
    createNetworkHealthSpec: build.mutation<CreateUpdateMutationResult, NetworkHealthFormDto>({
      query: (variables) => ({
        variables: processDtoToPayload(variables),
        document: gql`mutation CreateServiceGuardSpec ($spec: CreateServiceGuardSpecInput!){
          createServiceGuardSpec (spec: $spec) {
            spec { id }
            userErrors { field message }
          }
        }`
      }),
      invalidatesTags: [{ type: 'NetworkHealth', id: 'LIST' }],
      transformResponse: (response: { createServiceGuardSpec: CreateUpdateMutationResult }) =>
        response.createServiceGuardSpec
    }),
    updateNetworkHealthSpec: build.mutation<CreateUpdateMutationResult, NetworkHealthFormDto>({
      query: (variables) => ({
        variables: processDtoToPayload(variables),
        document: gql`mutation UpdateServiceGuardSpec ($spec: UpdateServiceGuardSpecInput!){
          updateServiceGuardSpec (spec: $spec) {
            spec { id }
            userErrors { field message }
          }
        }`
      }),
      invalidatesTags: [{ type: 'NetworkHealth', id: 'LIST' }],
      transformResponse: (response: { updateServiceGuardSpec: CreateUpdateMutationResult }) =>
        response.updateServiceGuardSpec
    })
  })
})

export function useNetworkHealthSpecMutation () {
  const spec = useNetworkHealthSpec()
  const editMode = !spec.isUninitialized
  const create = useCreateNetworkHealthSpecMutation()
  const update = useUpdateNetworkHealthSpecMutation()

  const [submit, response] = editMode ? update : create
  return { editMode, spec, submit, response }
}
