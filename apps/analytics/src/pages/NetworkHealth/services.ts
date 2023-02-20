import { gql } from 'graphql-request'
import _       from 'lodash'

import { networkHealthApi } from '@acx-ui/analytics/services'
import { useParams }        from '@acx-ui/react-router-dom'

import {
  NetworkHealthFormDto,
  NetworkHealthSpec,
  MutationResult,
  NetworkHealthConfig
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
