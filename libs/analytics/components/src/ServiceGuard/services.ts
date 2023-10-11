import { useEffect, useState, useCallback } from 'react'

import { Form }          from 'antd'
import { gql }           from 'graphql-request'
import _                 from 'lodash'
import moment            from 'moment-timezone'
import { ValidatorRule } from 'rc-field-form/lib/interface'
import { useIntl }       from 'react-intl'

import { showToast, TableProps, useStepFormContext } from '@acx-ui/components'
import { get }                                       from '@acx-ui/config'
import { useNetworkListQuery }                       from '@acx-ui/rc/services'
import { Network, TableResult }                      from '@acx-ui/rc/utils'
import { useParams }                                 from '@acx-ui/react-router-dom'
import { serviceGuardApi }                           from '@acx-ui/store'
import { TABLE_DEFAULT_PAGE_SIZE, noDataDisplay }    from '@acx-ui/utils'

import { authMethodsByClientType }     from './authMethods'
import { messageMapping, stages }      from './contents'
import { initialValues }               from './ServiceGuardForm/ServiceGuardForm'
import { TestType, ScheduleFrequency } from './types'

import type {
  ServiceGuardFormDto,
  ServiceGuardSpec,
  ServiceGuardConfig,
  ServiceGuardTestResults,
  Pagination,
  TestResultByAP,
  ServiceGuardTest,
  MutationResult,
  MutationUserError,
  MutationResponse,
  ClientType,
  AuthenticationMethod,
  Wlan
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

export type ServiceGuardTableRow = Omit<ServiceGuardSpec, 'configs' | 'tests'> & {
  tests: { items: Pick<ServiceGuardTest, 'id' | 'createdAt' | 'summary'>[] }
  latestTest: Pick<ServiceGuardTest, 'id' | 'createdAt' | 'summary'> | undefined
}

export const {
  useAllServiceGuardSpecsQuery,
  useServiceGuardDetailsQuery,
  useServiceGuardTestQuery,
  useServiceGuardRelatedTestsQuery,
  useServiceGuardTestResultsQuery,
  useWlansQuery
} = serviceGuardApi.injectEndpoints({
  endpoints: (build) => ({
    allServiceGuardSpecs: build.query<ServiceGuardTableRow[], void>({
      query: () => ({
        document: fetchAllServiceGuardSpecs
      }),
      providesTags: [{ type: 'ServiceGuard', id: 'LIST' }],
      transformResponse: (response: { allServiceGuardSpecs: ServiceGuardTableRow[] }) =>
        response.allServiceGuardSpecs
          .map(row => ({ ...row, latestTest: _.get(row, 'tests.items[0]') }))
    }),
    serviceGuardDetails: build.query<ServiceGuardSpec, { id: string }>({
      query: (variables) => ({
        variables,
        document: fetchServiceGuardSpec
      }),
      providesTags: [{ type: 'ServiceGuard', id: 'DETAILS' }],
      transformResponse: (result: { serviceGuardSpec: ServiceGuardSpec }) =>
        result.serviceGuardSpec
    }),
    serviceGuardTest: build.query<ServiceGuardTest, { testId: ServiceGuardTest['id'] }>({
      query: (variables) => ({ variables, document: fetchServiceGuardTest }),
      transformResponse: (result: { serviceGuardTest: ServiceGuardTest }) =>
        result.serviceGuardTest
    }),
    serviceGuardRelatedTests: build.query<
      Record<string, number | string>[],
      { testId: ServiceGuardTest['id'] }
    >({
      query: (variables) => ({ variables, document: fetchServiceGuardRelatedTests }),
      transformResponse: (result: { serviceGuardTest: ServiceGuardTest }) => {
        if (!result.serviceGuardTest) return []
        const {
          id: specId,
          tests: { items }
        } = result.serviceGuardTest.spec
        return items.map(({ id, createdAt, summary }) => ({
          specId, id, createdAt,
          ...((summary.apsTestedCount === 0)
            ? Object.entries(summary).reduce((acc, [key]) => {
              acc[key] = noDataDisplay
              return acc
            }, summary)
            : summary
          )
        }))
      }
    }),
    serviceGuardTestResults: build.query<
      ServiceGuardTestResults,
      { testId: ServiceGuardTest['id']; offset: number; limit: number }
    >({
      query: (variables) => ({ variables, document: fetchServiceGuardTestResults }),
      transformResponse: (result: { serviceGuardTest: ServiceGuardTestResults }) =>
        result.serviceGuardTest
    }),
    wlans: build.query<Wlan[], ClientType>({
      query: (clientType) => ({
        variables: { clientType },
        document: gql`
          query Wlans ($clientType: String!) {
            wlans(paths: [], clientType: $clientType) { name authMethods }
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
        return result.wlans.map(item => ({
          id: item.name,
          name: item.name,
          ready: true,
          associated: true,
          authMethods: item.authMethods.filter(method => methods.includes(method))
        })) as Wlan[]
      }
    })
  })
})

export function useServiceGuardSpec () {
  const params = useParams<{ specId: ServiceGuardSpec['id'] }>()
  return useServiceGuardDetailsQuery(
    { id: String(params.specId) },
    { skip: !Boolean(params.specId) }
  )
}

export function useServiceGuardTest () {
  const params = useParams<{ testId: string }>()
  return useServiceGuardTestQuery(
    { testId: parseInt(params.testId!, 10) },
    { skip: !Boolean(params.testId) })
}

export function useServiceGuardRelatedTests () {
  const params = useParams<{ testId: string }>()
  return useServiceGuardRelatedTestsQuery(
    { testId: parseInt(params.testId!, 10) },
    { skip: !Boolean(params.testId) })
}

export function useServiceGuardTestResults () {
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
    tableQuery: useServiceGuardTestResultsQuery(
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

const payload = {
  fields: ['id', 'name', 'venues', 'aps'],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 10_000 // TODO: handle client with networks more than this
}
export function useNetworks (skipR1 = false) {
  const { form } = useStepFormContext<ServiceGuardFormDto>()
  const clientType = Form.useWatch('clientType', form)
  const wlans = useWlansQuery(clientType, { skip: !clientType })

  const networks = useNetworkListQuery({ payload, params: useParams() }, {
    skip: Boolean(get('IS_MLISA_SA')) || skipR1,
    selectFromResult: (response) => {
      const data = response.isUninitialized
        ? { data: [], page: 1, totalCount: 0 } as TableResult<Network>
        : response.data


      return {
        ...response,
        data: data?.data.map(network => ({
          ..._.pick(network, ['id', 'name']),
          associated: Boolean(network.aps && network.venues.count)
        })) as Wlan[]
      }
    }
  })

  const map = _.merge(
    {},
    _.keyBy(wlans.data, 'name'),
    _.keyBy(networks.data, 'name')
  )

  return {
    states: [networks, wlans],
    map: map,
    networks: Object.values(map).filter(network => network.associated)
  }
}

export function processDtoToPayload (dto: ServiceGuardFormDto) {
  const spec = {
    ..._.omit(dto, ['typeWithSchedule', 'isDnsServerCustom']),
    configs: [{ ..._.omit(dto.configs[0], ['updatedAt']) }]
  }
  return { spec }
}

const mod = (a: number, b: number) => ((a % b) + b) % b

export function specToDto (
  spec?: Omit<ServiceGuardSpec, 'apsCount' | 'userId' | 'tests' | 'configs'> & {
    configs: Omit<ServiceGuardConfig, 'id' | 'specId' | 'updatedAt' | 'createdAt'>[]
  }
): ServiceGuardFormDto | undefined {
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
  spec: Pick<ServiceGuardSpec, 'id'>
}>

type DeleteServiceGuardTestResult = MutationResult<{
  deletedSpecId: ServiceGuardSpec['id']
}>

type RunServiceGuardTestResult = MutationResult<{
  spec: Pick<ServiceGuardSpec,'id'|'tests'>
}>

const {
  useCreateServiceGuardSpecMutation,
  useUpdateServiceGuardSpecMutation,
  useDeleteServiceGuardMutation,
  useRunServiceGuardMutation,
  useCloneServiceGuardMutation
} = serviceGuardApi.injectEndpoints({
  endpoints: (build) => ({
    createServiceGuardSpec: build.mutation<CreateUpdateCloneMutationResult, ServiceGuardFormDto>({
      query: (variables) => ({
        variables: processDtoToPayload(variables),
        document: gql`mutation CreateServiceGuardSpec ($spec: CreateServiceGuardSpecInput!){
          createServiceGuardSpec (spec: $spec) {
            spec { id }
            userErrors { field message }
          }
        }`
      }),
      invalidatesTags: [{ type: 'ServiceGuard', id: 'LIST' }],
      transformResponse: (response: { createServiceGuardSpec: CreateUpdateCloneMutationResult }) =>
        response.createServiceGuardSpec
    }),
    updateServiceGuardSpec: build.mutation<CreateUpdateCloneMutationResult, ServiceGuardFormDto>({
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
        { type: 'ServiceGuard', id: 'LIST' },
        { type: 'ServiceGuard', id: 'DETAILS' }
      ],
      transformResponse: (response: { updateServiceGuardSpec: CreateUpdateCloneMutationResult }) =>
        response.updateServiceGuardSpec
    }),
    deleteServiceGuard: build.mutation<
      DeleteServiceGuardTestResult, Pick<ServiceGuardSpec,'id'>
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
      invalidatesTags: [{ type: 'ServiceGuard', id: 'LIST' }],
      transformResponse: (response: { deleteServiceGuardSpec: DeleteServiceGuardTestResult }) =>
        response.deleteServiceGuardSpec
    }),
    runServiceGuard: build.mutation<
      RunServiceGuardTestResult, Pick<ServiceGuardSpec,'id'>
    >({
      query: (variables) => ({
        variables,
        document: gql`mutation RunServiceGuardTest ($id: String!){
          runServiceGuardTest (id: $id) {
            userErrors { field message }
            spec {
              id
              tests (limit: 1) { items { id } }
            }
          }
        }`
      }),
      invalidatesTags: [{ type: 'ServiceGuard', id: 'LIST' }],
      transformResponse: (response: { runServiceGuardTest: RunServiceGuardTestResult }) =>
        response.runServiceGuardTest
    }),
    cloneServiceGuard: build.mutation<
      CreateUpdateCloneMutationResult, Pick<ServiceGuardSpec, 'id'|'name'>
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
      invalidatesTags: [{ type: 'ServiceGuard', id: 'LIST' }],
      transformResponse: (response: { cloneServiceGuardSpec: CreateUpdateCloneMutationResult }) =>
        response.cloneServiceGuardSpec
    })
  })
})

export function useServiceGuardSpecMutation () {
  const spec = useServiceGuardSpec()
  const editMode = !spec.isUninitialized
  const create = useCreateServiceGuardSpecMutation()
  const update = useUpdateServiceGuardSpecMutation()

  const [submit, response] = editMode ? update : create
  return { editMode, spec, submit, response }
}

export function useRunServiceGuardTestMutation () {
  const [runTest, response] = useRunServiceGuardMutation()
  return { runTest, response }
}

export function useDeleteServiceGuardTestMutation () {
  const [deleteTest, response] = useDeleteServiceGuardMutation()
  return { deleteTest, response }
}

export function useCloneServiceGuardTestMutation () {
  const [cloneTest, response] = useCloneServiceGuardMutation()
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

const { useLazyServiceGuardSpecNamesQuery } = serviceGuardApi.injectEndpoints({
  endpoints: (build) => ({
    serviceGuardSpecNames: build.query<string[], void>({
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
  const [getNames] = useLazyServiceGuardSpecNamesQuery()
  const validator: ValidatorRule['validator'] = useCallback(async (rule, value: string) => {
    if (editMode && initialName === value) return

    const names = await getNames().unwrap()
    if (!names.includes(value)) return

    throw new Error($t(messageMapping.DUPLICATE_NAME_NOT_ALLOWED))
  }, [$t, getNames, editMode, initialName])

  return validator
}
