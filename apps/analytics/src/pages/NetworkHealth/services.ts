import { useEffect } from 'react'

import { gql }     from 'graphql-request'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { networkHealthApi } from '@acx-ui/analytics/services'
import { showToast }        from '@acx-ui/components'
import { useParams }        from '@acx-ui/react-router-dom'

import { messageMapping } from './contents'

import type {
  NetworkHealthFormDto,
  NetworkHealthSpec,
  MutationResult,
  NetworkHealthConfig,
  MutationUserError,
  MutationResponse,
  NetworkHealthTest
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

const configKeys: Array<keyof NetworkHealthFormDto> = [
  'authenticationMethod',
  'dnsServer',
  'pingAddress',
  'radio',
  'speedTestEnabled',
  'tracerouteAddress',
  'wlanName',
  'wlanPassword',
  'wlanUsername',
  'networkPaths'
]

export function processDtoToPayload (dto: NetworkHealthFormDto) {
  const spec = {
    ..._.omit(dto, configKeys.concat(['isDnsServerCustom'])),
    configs: [_.pick(dto, configKeys)]
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
  return {
    isDnsServerCustom: Boolean(spec.configs[0].dnsServer),
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
      'tracerouteAddress',
      'networkPaths'
    ])
  }
}

type CreateUpdateMutationResult = MutationResult<{
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
  useRunNetworkHealthMutation
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
    }),
    deleteNetworkHealth: build.mutation<
      DeleteNetworkHealthTestResult, { id: NetworkHealthSpec['id'] }
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
    runNetworkHealth: build.mutation<RunNetworkHealthTestResult, { id: NetworkHealthSpec['id'] }>({
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
