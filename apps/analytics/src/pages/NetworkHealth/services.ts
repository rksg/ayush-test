import { useEffect, useState, useCallback } from 'react'

import { Form }          from 'antd'
import { gql }           from 'graphql-request'
import _                 from 'lodash'
import moment            from 'moment-timezone'
import { ValidatorRule } from 'rc-field-form/lib/interface'
import { useIntl }       from 'react-intl'

import { networkHealthApi }                          from '@acx-ui/analytics/services'
import { showToast, TableProps, useStepFormContext } from '@acx-ui/components'
import { useParams }                                 from '@acx-ui/react-router-dom'
import { TABLE_DEFAULT_PAGE_SIZE }                   from '@acx-ui/utils'

import { authMethodsByClientType }     from './authMethods'
import { messageMapping, stages }      from './contents'
import { initialValues }               from './NetworkHealthForm/NetworkHealthForm'
import { TestType, ScheduleFrequency } from './types'

import type {
  NetworkHealthFormDto,
  NetworkHealthSpec,
  NetworkHealthConfig,
  NetworkHealthTestResults,
  Pagination,
  TestResultByAP,
  NetworkHealthTest,
  MutationResult,
  MutationUserError,
  MutationResponse,
  ClientType,
  AuthenticationMethod
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
        id
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
  useNetworkHealthDetailsQuery,
  useNetworkHealthTestQuery,
  useNetworkHealthRelatedTestsQuery,
  useNetworkHealthTestResultsQuery,
  useWlan2AuthMethodsQuery
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
      providesTags: [{ type: 'NetworkHealth', id: 'DETAILS' }],
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
    }),
    wlan2AuthMethods: build.query<Record<string, AuthenticationMethod[]>, ClientType>({
      query: (clientType) => ({
        variables: { clientType, paths: [] },
        document: gql`
          query Wlans ($paths: [JSON!]!, $clientType: String!) {
            wlans(paths: $paths, clientType: $clientType) { name authMethods }
          }
        `
      }),
      transformResponse: (result: {
        wlans: Array<{
          name: string
          authMethods: AuthenticationMethod[]
        }>
      }, meta, clientType) => {
        const methods = authMethodsByClientType[clientType].map(item => item.code)
        return Object.fromEntries(result.wlans.map(item => [
          item.name,
          item.authMethods.filter(method => methods.includes(method))
        ]))
      }
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

export function useWlanAuthMethodsMap () {
  const { form } = useStepFormContext<NetworkHealthFormDto>()
  const clientType = Form.useWatch('clientType', form)
  return useWlan2AuthMethodsQuery(clientType, { skip: !clientType })
}

export function processDtoToPayload (dto: NetworkHealthFormDto) {
  const spec = {
    ..._.omit(dto, ['typeWithSchedule', 'isDnsServerCustom']),
    configs: [{ ..._.omit(dto.configs[0], ['updatedAt']) }]
  }
  return { spec }
}

const mod = (a: number, b: number) => ((a % b) + b) % b

export function specToDto (
  spec?: Omit<NetworkHealthSpec, 'apsCount' | 'userId' | 'tests' | 'configs'> & {
    configs: Omit<NetworkHealthConfig, 'id' | 'specId' | 'updatedAt' | 'createdAt'>[]
  }
): NetworkHealthFormDto | undefined {
  if (!spec) return undefined

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
    ..._.omit(spec, ['schedule']),
    schedule
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
      invalidatesTags: [
        { type: 'NetworkHealth', id: 'LIST' },
        { type: 'NetworkHealth', id: 'DETAILS' }
      ],
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
