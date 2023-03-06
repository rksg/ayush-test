import { useCallback, useEffect } from 'react'

import { gql }           from 'graphql-request'
import _                 from 'lodash'
import { ValidatorRule } from 'rc-field-form/lib/interface'
import { useIntl }       from 'react-intl'

import { networkHealthApi }     from '@acx-ui/analytics/services'
import { showToast }            from '@acx-ui/components'
import { useParams }            from '@acx-ui/react-router-dom'
import { APListNode, PathNode } from '@acx-ui/utils'

import { messageMapping } from './contents'

import type {
  APListNodes,
  NetworkHealthFormDto,
  NetworkHealthSpec,
  NetworkNodes,
  NetworkPaths,
  MutationResult,
  NetworkHealthConfig,
  MutationUserError,
  MutationResponse,
  NetworkHealthTest
} from './types'

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

const fetchAllServiceGuardSpecs = gql`
  query FetchAllServiceGuardSpecs {
    allServiceGuardSpecs {
      id
      name
      type
      apsCount
      userId
      clientType
      schedule { nextExecutionTime }
      tests(limit: 1) {
        items {
          id
          createdAt
          summary { apsTestedCount apsSuccessCount apsPendingCount }
        }
      }
    }
  }`

export type NetworkHealthTableRow = Omit<NetworkHealthSpec, 'configs' | 'tests'> & {
  tests: { items: Pick<NetworkHealthTest, 'id' | 'createdAt' | 'summary'>[] }
  latestTest: Pick<NetworkHealthTest, 'id' | 'createdAt' | 'summary'> | undefined
}

export const {
  useAllNetworkHealthSpecsQuery,
  useNetworkHealthDetailsQuery
} = networkHealthApi.injectEndpoints({
  endpoints: (build) => ({
    allNetworkHealthSpecs: build.query<NetworkHealthTableRow[], void>({
      query: () => ({
        document: fetchAllServiceGuardSpecs
      }),
      providesTags: [{ type: 'NetworkHealth', id: 'LIST' }],
      transformResponse: (response: { allServiceGuardSpecs: NetworkHealthTableRow[] }) =>
        response.allServiceGuardSpecs
          .map(row => ({ ...row, latestTest: _.get(row, 'tests.items[0]') }))
    }),
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

const configKeys: Array<keyof NetworkHealthFormDto> = [
  'authenticationMethod',
  'dnsServer',
  'pingAddress',
  'radio',
  'speedTestEnabled',
  'tracerouteAddress',
  'wlanName',
  'wlanPassword',
  'wlanUsername'
]

export function processDtoToPayload (dto: NetworkHealthFormDto) {
  const spec = {
    // TODO:
    // Add `networkPaths` into `configKeys` when APsSelection input available
    ..._.omit(dto, configKeys.concat(['isDnsServerCustom', 'networkPaths'])),
    configs: [{
      ..._.pick(dto, configKeys),
      networkPaths: { networkNodes: stringToNetworkNodes(dto.networkPaths.networkNodes) }
    }]
  }
  return { spec }
}

export function specToDto (spec?: Pick<NetworkHealthSpec, 'id' | 'clientType' | 'name' | 'type'> & {
  configs: Pick<
    NetworkHealthConfig,
    'authenticationMethod' | 'dnsServer' | 'pingAddress' | 'radio' | 'speedTestEnabled' |
    'tracerouteAddress' | 'wlanName' | 'wlanPassword' | 'wlanUsername' |
    'networkPaths'
  >[]
}): NetworkHealthFormDto | undefined {
  if (!spec) return undefined
  const networkPaths = {
    networkNodes: networkNodesToString(spec.configs[0].networkPaths.networkNodes)
  }
  return {
    isDnsServerCustom: Boolean(spec.configs[0].dnsServer),
    // TODO:
    // Take `networkPaths` from `spec.configs[0]` when APsSelection input available
    networkPaths,
    ..._.pick(spec, ['id', 'name', 'type', 'clientType']),
    ..._.pick(spec.configs[0], [
      'radio',
      'wlanName',
      'authenticationMethod',
      'wlanPassword',
      'wlanUsername',
      'speedTestEnabled',
      'dnsServer',
      'pingAddress',
      'tracerouteAddress'
    ])
  }
}

type CreateUpdateCloneMutationResult = MutationResult<{
  spec: Pick<NetworkHealthSpec, 'id'>
}>

type DeleteNetworkHealthTestResult = MutationResult<{
  deletedSpecId: NetworkHealthSpec['id']
}>

type RunNetworkHealthTestResult = MutationResult<{
  spec: Pick<NetworkHealthSpec,'id'|'tests'>
}>

const {
  useCreateNetworkHealthSpecMutation,
  useUpdateNetworkHealthSpecMutation,
  useDeleteNetworkHealthMutation,
  useRunNetworkHealthMutation,
  useCloneNetworkHealthMutation
} = networkHealthApi.injectEndpoints({
  endpoints: (build) => ({
    createNetworkHealthSpec: build.mutation<CreateUpdateCloneMutationResult, NetworkHealthFormDto>({
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
      transformResponse: (response: { createServiceGuardSpec: CreateUpdateCloneMutationResult }) =>
        response.createServiceGuardSpec
    }),
    updateNetworkHealthSpec: build.mutation<CreateUpdateCloneMutationResult, NetworkHealthFormDto>({
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
      transformResponse: (response: { updateServiceGuardSpec: CreateUpdateCloneMutationResult }) =>
        response.updateServiceGuardSpec
    }),
    deleteNetworkHealth: build.mutation<
      DeleteNetworkHealthTestResult, Pick<NetworkHealthSpec,'id'>
    >({
      query: (variables) => ({
        variables,
        document: gql`
          mutation DeleteServiceGuardSpec ($id: String!) {
            deleteServiceGuardSpec (id: $id) {
              deletedSpecId
              userErrors { field message }
            }
          }
        `
      }),
      invalidatesTags: [{ type: 'NetworkHealth', id: 'LIST' }],
      transformResponse: (response: { deleteServiceGuardSpec: DeleteNetworkHealthTestResult }) =>
        response.deleteServiceGuardSpec
    }),
    runNetworkHealth: build.mutation<
      RunNetworkHealthTestResult, Pick<NetworkHealthSpec,'id'>
    >({
      query: (variables) => ({
        variables,
        document: gql`mutation RunNetworkHealthTest ($id: String!){
          runServiceGuardTest (id: $id) {
            userErrors { field message }
            spec {
              id
              tests (limit: 1) { items { id } }
            }
          }
        }`
      }),
      invalidatesTags: [{ type: 'NetworkHealth', id: 'LIST' }],
      transformResponse: (response: { runServiceGuardTest: RunNetworkHealthTestResult }) =>
        response.runServiceGuardTest
    }),
    cloneNetworkHealth: build.mutation<
      CreateUpdateCloneMutationResult, Pick<NetworkHealthSpec, 'id'|'name'>
    >({
      query: (variables) => ({
        variables,
        document: gql`mutation CloneServiceGuardSpec ($name: String!, $id: String!){
          cloneServiceGuardSpec (name: $name, id: $id) {
            spec { id }
            userErrors { field message }
          }
        }`
      }),
      invalidatesTags: [{ type: 'NetworkHealth', id: 'LIST' }],
      transformResponse: (response: { cloneServiceGuardSpec: CreateUpdateCloneMutationResult }) =>
        response.cloneServiceGuardSpec
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

export function useRunNetworkHealthTestMutation () {
  const [runTest, response] = useRunNetworkHealthMutation()
  return { runTest, response }
}

export function useDeleteNetworkHealthTestMutation () {
  const [deleteTest, response] = useDeleteNetworkHealthMutation()
  return { deleteTest, response }
}

export function useCloneNetworkHealthTestMutation () {
  const [cloneTest, response] = useCloneNetworkHealthMutation()
  return { cloneTest, response }
}

export function useMutationResponseEffect <
  Result extends { userErrors?: MutationUserError[] }
> (
  response: MutationResponse<Result>,
  onOk?: (result: MutationResponse<Result>) => void
) {
  const { $t } = useIntl()

  useEffect(() => {
    if (!response.data) return

    if (!response.data.userErrors) {
      onOk?.(response)
    } else {
      const key = response.data.userErrors[0].message as keyof typeof messageMapping
      const errorMessage = $t(messageMapping[key])
      showToast({ type: 'error', content: errorMessage })
    }
  }, [$t, response, onOk])
}

const { useLazyNetworkHealthSpecNamesQuery } = networkHealthApi.injectEndpoints({
  endpoints: (build) => ({
    networkHealthSpecNames: build.query<string[], void>({
      query: () => ({
        document: gql`query ServiceGuardSpecNames { allServiceGuardSpecs { name } }`
      }),
      transformResponse: (result: { allServiceGuardSpecs: Array<{ name: string }> }) =>
        result.allServiceGuardSpecs.map(value => value.name)
    })
  })
})
export function useDuplicateNameValidator (editMode = false, initialName?: string) {
  const { $t } = useIntl()
  const [getNames] = useLazyNetworkHealthSpecNamesQuery()
  const validator: ValidatorRule['validator'] = useCallback(async (rule, value: string) => {
    if (editMode && initialName === value) return

    const names = await getNames().unwrap()
    if (!names.includes(value)) return

    throw new Error($t(messageMapping.DUPLICATE_NAME_NOT_ALLOWED))
  }, [$t, getNames, editMode, initialName])

  return validator
}
