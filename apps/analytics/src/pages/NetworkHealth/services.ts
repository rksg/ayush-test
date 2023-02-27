import { useState } from 'react'

import { gql } from 'graphql-request'
import _       from 'lodash'

import { networkHealthApi }        from '@acx-ui/analytics/services'
import { TableProps }              from '@acx-ui/components'
import { useParams }               from '@acx-ui/react-router-dom'
import { APListNode, PathNode }    from '@acx-ui/utils'
import { TABLE_DEFAULT_PAGE_SIZE } from '@acx-ui/utils'

import { stages } from './contents'

import type {
  APListNodes,
  NetworkHealthFormDto,
  NetworkHealthSpec,
  NetworkNodes,
  NetworkPaths,
  MutationResult,
  NetworkHealthConfig,
  NetworkHealthTest,
  UserErrors,
  NetworkHealthTestResults,
  Pagination,
  TestResultByAP
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

const compareFields = `
  apsSuccessCount
  apsTestedCount
  avgPingTime
  avgUpload
  avgDownload
`

const compareFieldsFn = (stage: string) => `
  ${stage}Success :apsSuccessCount(stage: ${stage})
  ${stage}Failure :apsFailureCount(stage: ${stage})
  ${stage}Error :apsErrorCount(stage: ${stage})
  ${stage}NA :apsNACount(stage: ${stage})
  ${stage}Pending :apsPendingCount(stage: ${stage})
`

const fetchServiceGuardTest = gql`
  query FetchServiceGuardTest($testId: Float!) {
    serviceGuardTest(id: $testId) {
      id
      createdAt
      spec {
        specId: id
        name
        type
        apsCount
        clientType
      }
      config {
        wlanName
        wlanUsername
        dnsServer
        pingAddress
        tracerouteAddress
        speedTestEnabled
        radio
        authenticationMethod
      }
      summary {
        apsFailureCount
        apsErrorCount
        apsPendingCount
        ${compareFields}
        ${Object.keys(stages).map(stage => compareFieldsFn(stage)).join('\n')}}
      previousTest {
        summary {
          ${compareFields}
        }
      }
      wlanAuthSettings {
        wpaVersion
      }
    }
  }
`

const fetchServiceGuardRelatedTests = gql`
  query FetchServiceGuardRelatedTests($testId: Float!) {
    serviceGuardTest(id: $testId) {
      spec {
        id
        tests {
          items {
            createdAt
            id
            summary {
              apsTestedCount
              apsSuccessCount
              apsFailureCount
              apsErrorCount
            }
          }
        }
      }
    }
  }
`

const runServiceGuardTest = gql`
  mutation RunNetworkHealthTest ($specId: String!){
    runServiceGuardTest (id: $specId) {
      userErrors { field message }
      spec {
        id name type apsCount userId clientType
        tests (limit: 1) {
          items {
            id createdAt
            summary { apsTestedCount apsSuccessCount apsPendingCount }
          }
        }
        schedule {
          nextExecutionTime
        }
      }
    }
  }
`

const fetchServiceGuardTestResults = gql`
  query ServiceGuardResults($testId: Float!, $offset: Int, $limit: Int) {
    serviceGuardTest(id: $testId) {
      config { authenticationMethod pingAddress tracerouteAddress speedTestEnabled }
      spec {
        specId: id
        name
        type
        apsCount
        clientType
      }
      wlanAuthSettings {
        wpaVersion
      }
      aps (offset: $offset, limit: $limit) {
        total
        size
        items {
          apName
          apMac
          ${Object.keys(stages).join('\n')}
          pingReceive
          pingTotal
          avgPingTime
          error
          speedTestFailure
          speedTestServer
          download
          upload
          tracerouteLog
          state
          clients {
            failure {
              failedMsgId messageIds ssid radio reason failureType
            }
          }
          stationAp {
            name
            mac
            snr
          }
        }
      }
    }
  }
`
const {
  useNetworkHealthDetailsQuery,
  useNetworkHealthTestQuery,
  useNetworkHealthRelatedTestsQuery,
  useNetworkHealthTestResultsQuery
} = networkHealthApi.injectEndpoints({
  endpoints: (build) => ({
    networkHealthDetails: build.query<NetworkHealthSpec, { id: string }>({
      query: (variables) => ({
        variables,
        document: fetchServiceGuardSpec
      }),
      transformResponse: (result: { serviceGuardSpec: NetworkHealthSpec }) =>
        result.serviceGuardSpec
    }),
    networkHealthTest: build.query<NetworkHealthTest, { testId: NetworkHealthTest['id'] }>({
      query: (variables) => ({ variables, document: fetchServiceGuardTest }),
      transformResponse: (result: { serviceGuardTest: NetworkHealthTest }) =>
        result.serviceGuardTest
    }),
    networkHealthRelatedTests: build.query<
      Record<string, number | string>[],
      { testId: NetworkHealthTest['id'] }
    >({
      query: (variables) => ({ variables, document: fetchServiceGuardRelatedTests }),
      transformResponse: (result: { serviceGuardTest: NetworkHealthTest }) => {
        if (!result.serviceGuardTest) return []
        const {
          id: specId,
          tests: { items }
        } = result.serviceGuardTest.spec
        return items.map(({ id, createdAt, summary }) => ({ specId, id, createdAt, ...summary }))
      }
    }),
    networkHealthTestResults: build.query<
    NetworkHealthTestResults,
      { testId: NetworkHealthTest['id']; offset: number; limit: number }
    >({
      query: (variables) => ({ variables, document: fetchServiceGuardTestResults }),
      transformResponse: (result: { serviceGuardTest: NetworkHealthTestResults }) =>
        result.serviceGuardTest
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

export function useNetworkHealthTest () {
  const params = useParams<{ testId: string }>()
  return useNetworkHealthTestQuery(
    { testId: parseInt(params.testId!, 10) },
    { skip: !Boolean(params.testId) })
}

export function useNetworkHealthRelatedTests () {
  const params = useParams<{ testId: string }>()
  return useNetworkHealthRelatedTestsQuery(
    { testId: parseInt(params.testId!, 10) },
    { skip: !Boolean(params.testId) })
}

export function useNetworkHealthTestResults () {
  const params = useParams<{ testId: string }>()
  const DEFAULT_PAGINATION = {
    page: 1,
    pageSize: TABLE_DEFAULT_PAGE_SIZE,
    defaultPageSize: TABLE_DEFAULT_PAGE_SIZE,
    total: 0
  }
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION)
  const handleTableChange: TableProps<TestResultByAP>['onChange'] = (
    customPagination
  ) => {
    const paginationDetail = {
      page: customPagination.current,
      pageSize: customPagination.pageSize
    } as Pagination

    setPagination({ ...pagination, ...paginationDetail })
  }
  return {
    tableQuery: useNetworkHealthTestResultsQuery(
      {
        testId: parseInt(params.testId!, 10),
        offset: (pagination.page - 1) * pagination.pageSize,
        limit: pagination.pageSize
      },
      { skip: !Boolean(params.testId) }
    ),
    onPageChange: handleTableChange,
    pagination
  }
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

type CreateUpdateMutationResult = MutationResult<{
  spec: Pick<NetworkHealthSpec, 'id'>
}>

type RunNetworkHealthTestResult = MutationResult<{
  spec: NetworkHealthSpec,
  userErrors: UserErrors
}>

export const {
  useCreateNetworkHealthSpecMutation,
  useUpdateNetworkHealthSpecMutation,
  useRunNetworkHealthTestMutation
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
      invalidatesTags: [{ type: 'NetworkHeath', id: 'LIST' }],
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
      invalidatesTags: [{ type: 'NetworkHeath', id: 'LIST' }],
      transformResponse: (response: { updateServiceGuardSpec: CreateUpdateMutationResult }) =>
        response.updateServiceGuardSpec
    }),
    runNetworkHealthTest: build.mutation<
      RunNetworkHealthTestResult, { specId: NetworkHealthSpec['id'] }
    >({
      query: (variables) => ({ variables, document: runServiceGuardTest }),
      transformResponse: (response: { runServiceGuardTest: RunNetworkHealthTestResult }) =>
        response.runServiceGuardTest
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
