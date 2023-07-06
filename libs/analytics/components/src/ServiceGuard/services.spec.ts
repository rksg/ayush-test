import _ from 'lodash'

import {
  serviceGuardApi as api,
  serviceGuardApiURL as apiUrl,
  Provider,
  store
} from '@acx-ui/store'
import { act, mockGraphqlMutation, mockGraphqlQuery, renderHook, waitFor, screen } from '@acx-ui/test-utils'

import * as fixtures          from './__tests__/fixtures'
import {
  specToDto,
  useServiceGuardSpec,
  useServiceGuardTestResults,
  useServiceGuardTest,
  useServiceGuardRelatedTests,
  useAllServiceGuardSpecsQuery,
  useServiceGuardSpecMutation,
  useDeleteServiceGuardTestMutation,
  useRunServiceGuardTestMutation,
  useCloneServiceGuardTestMutation,
  useMutationResponseEffect
} from './services'
import {
  TestResultByAP,
  AuthenticationMethod,
  Band,
  ClientType,
  TestType,
  NetworkPaths,
  Schedule,
  ScheduleFrequency,
  ServiceGuardFormDto,
  ServiceGuardConfig,
  ServiceGuardSpec,
  MutationResponse,
  MutationUserError
} from './types'

import type { TableCurrentDataSource } from 'antd/lib/table/interface'

const networkNodes = [[
  { type: 'zone', name: 'VENUE' },
  { type: 'apMac', list: ['00:00:00:00:00:00'] }
]] as NetworkPaths

beforeEach(() => store.dispatch(api.util.resetApiState()))

describe('useServiceGuardSpec', () => {
  it('load spec data if specId in URL', async () => {
    mockGraphqlQuery(apiUrl, 'FetchServiceGuardSpec', { data: fixtures.fetchServiceGuardSpec })

    const { result } = renderHook(useServiceGuardSpec, {
      wrapper: Provider,
      route: { params: { specId: 'spec-id' } }
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(fixtures.fetchServiceGuardSpec.serviceGuardSpec)
  })

  it('does not load spec data if specId not in URL', () => {
    const { result } = renderHook(useServiceGuardSpec, { wrapper: Provider })
    expect(result.current.isUninitialized).toBe(true)
  })
})

describe('useServiceGuardTest', () => {
  it('load test data if testId in URL', async () => {
    mockGraphqlQuery(apiUrl, 'FetchServiceGuardTest', { data: fixtures.fetchServiceGuardTest })
    const { result } = renderHook(useServiceGuardTest, {
      wrapper: Provider,
      route: { params: { testId: 'test-id' } }
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(fixtures.fetchServiceGuardTest.serviceGuardTest)
  })
  it('does not load test data if testId not in URL', () => {
    const { result } = renderHook(useServiceGuardTest, { wrapper: Provider })
    expect(result.current.isUninitialized).toBe(true)
  })
})

describe('useServiceGuardRelatedTests', () => {
  it('load test data if testId in URL', async () => {
    mockGraphqlQuery(
      apiUrl, 'FetchServiceGuardRelatedTests', { data: fixtures.fetchServiceGuardRelatedTests })
    const { result } = renderHook(useServiceGuardRelatedTests, {
      wrapper: Provider,
      route: { params: { testId: 'test-id' } }
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([
      {
        id: 2,
        specId: 'specId',
        createdAt: '2023-02-15T00:00:00.000Z',
        apsErrorCount: 1,
        apsFailureCount: 1,
        apsSuccessCount: 1,
        apsTestedCount: 3
      },
      {
        id: 1,
        specId: 'specId',
        createdAt: '2023-02-14T00:00:00.000Z',
        apsErrorCount: '--',
        apsFailureCount: '--',
        apsSuccessCount: '--',
        apsTestedCount: '--'
      }
    ])
  })
  it('handle null result', async () => {
    mockGraphqlQuery(
      apiUrl, 'FetchServiceGuardRelatedTests', { data: { serviceGuardTest: null } })
    const { result } = renderHook(useServiceGuardRelatedTests, {
      wrapper: Provider,
      route: { params: { testId: 'test-id' } }
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
  it('does not load test data if testId not in URL', () => {
    const { result } = renderHook(useServiceGuardRelatedTests, { wrapper: Provider })
    expect(result.current.isUninitialized).toBe(true)
  })
})

describe('useAllServiceGuardSpecsQuery', () => {
  it('should return empty data', async () => {
    mockGraphqlQuery(
      apiUrl, 'FetchAllServiceGuardSpecs', { data: { allServiceGuardSpecs: [] } })
    const { result } = renderHook(() => useAllServiceGuardSpecsQuery(), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
  it('should return correct data', async () => {
    mockGraphqlQuery(
      apiUrl, 'FetchAllServiceGuardSpecs', { data: fixtures.fetchAllServiceGuardSpecs })
    const { result } = renderHook(() => useAllServiceGuardSpecsQuery(), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data)
      .toEqual(fixtures.fetchAllServiceGuardSpecs.allServiceGuardSpecs
        .map(row => ({ ...row, latestTest: _.get(row, 'tests.items[0]') })))
  })
})

it('useRunServiceGuardTestMutation', async () => {
  mockGraphqlMutation(apiUrl, 'RunServiceGuardTest', { data: fixtures.runServiceGuardTest })
  const { result } = renderHook(() => useRunServiceGuardTestMutation(), { wrapper: Provider })
  act(() => {
    result.current.runTest({ id: fixtures.runServiceGuardTest.runServiceGuardTest.spec.id })
  })
  await waitFor(() => expect(result.current.response.isSuccess).toBe(true))
  expect(result.current.response.data).toEqual(fixtures.runServiceGuardTest.runServiceGuardTest)
})

it('useDeleteServiceGuardTestMutation', async () => {
  mockGraphqlMutation(apiUrl, 'DeleteServiceGuardSpec', { data: fixtures.deleteServiceGuard })
  const { result } = renderHook(() => useDeleteServiceGuardTestMutation(), { wrapper: Provider })
  act(() => {
    result.current.deleteTest({ id: fixtures.runServiceGuardTest.runServiceGuardTest.spec.id })
  })
  await waitFor(() => expect(result.current.response.isSuccess).toBe(true))
  expect(result.current.response.data).toEqual(fixtures.deleteServiceGuard.deleteServiceGuardSpec)
})

it('useCloneServiceGuardTestMutation', async () => {
  mockGraphqlMutation(apiUrl, 'CloneServiceGuardSpec', { data: fixtures.cloneServiceGuard })
  const { result } = renderHook(() => useCloneServiceGuardTestMutation(), { wrapper: Provider })
  act(() => {
    result.current.cloneTest({
      id: fixtures.cloneServiceGuard.cloneServiceGuardSpec.spec.id,
      name: 'test-name'
    })
  })
  await waitFor(() => expect(result.current.response.isSuccess).toBe(true))
  expect(result.current.response.data).toEqual(fixtures.cloneServiceGuard.cloneServiceGuardSpec)
})

describe('useServiceGuardSpecMutation', () => {
  it('handles create mutation', async () => {
    const dto: ServiceGuardFormDto = {
      isDnsServerCustom: true,
      configs: [{
        dnsServer: '10.10.10.10',
        tracerouteAddress: '10.10.10.10',
        pingAddress: '10.10.10.10',
        wlanName: 'WLAN Name',
        radio: Band.Band6,
        authenticationMethod: AuthenticationMethod.WPA3_PERSONAL,
        wlanPassword: '12345',
        wlanUsername: 'user',
        networkPaths: { networkNodes }
      }],
      schedule: {
        type: 'service_guard',
        timezone: 'Asia/Tokyo',
        frequency: null,
        day: null,
        hour: null
      },
      typeWithSchedule: TestType.OnDemand,
      type: TestType.OnDemand,
      clientType: ClientType.VirtualWirelessClient,
      name: 'Test Name'
    }
    const { result } = renderHook(
      useServiceGuardSpecMutation,
      { wrapper: Provider }
    )

    const expected = { spec: { id: 'spec-id' }, userErrors: null }
    mockGraphqlMutation(apiUrl, 'CreateServiceGuardSpec', {
      data: { createServiceGuardSpec: expected }
    })

    expect(result.current.editMode).toBe(false)

    act(() => { result.current.submit(dto) })
    await waitFor(() => expect(result.current.response.isSuccess).toBe(true))

    expect(result.current.response.data).toEqual(expected)
  })

  it('handles update mutation', async () => {
    const dto: ServiceGuardFormDto = {
      id: 'spec-id',
      isDnsServerCustom: true,
      configs: [{
        dnsServer: '10.10.10.10',
        tracerouteAddress: '10.10.10.10',
        pingAddress: '10.10.10.10',
        wlanName: 'WLAN Name',
        radio: Band.Band6,
        authenticationMethod: AuthenticationMethod.WPA3_PERSONAL,
        wlanPassword: '12345',
        wlanUsername: 'user',
        networkPaths: { networkNodes }
      }],
      schedule: {
        type: 'service_guard',
        timezone: 'Asia/Tokyo',
        frequency: null,
        day: null,
        hour: null
      },
      typeWithSchedule: TestType.OnDemand,
      type: TestType.OnDemand,
      clientType: ClientType.VirtualWirelessClient,
      name: 'Test Name'
    }

    mockGraphqlQuery(apiUrl, 'FetchServiceGuardSpec', { data: fixtures.fetchServiceGuardSpec })

    const { result } = renderHook(useServiceGuardSpecMutation, {
      wrapper: Provider,
      route: { params: { specId: 'spec-id' } }
    })

    await waitFor(() => expect(result.current.spec.isSuccess).toBe(true))

    const expected = { spec: { id: 'spec-id' }, userErrors: null }
    mockGraphqlMutation(apiUrl, 'UpdateServiceGuardSpec', {
      data: { updateServiceGuardSpec: expected }
    })

    expect(result.current.editMode).toBe(true)

    act(() => { result.current.submit(dto) })
    await waitFor(() => expect(result.current.response.isSuccess).toBe(true))

    expect(result.current.response.data).toEqual(expected)
  })
})

describe('specToDto', () => {
  const spec = {
    id: 'spec-id',
    clientType: ClientType.VirtualWirelessClient,
    schedule: null,
    type: TestType.OnDemand,
    name: 'Test Name',
    configs: [{
      authenticationMethod: AuthenticationMethod.WPA3_PERSONAL,
      dnsServer: '10.10.10.10',
      pingAddress: '10.10.10.10',
      radio: Band.Band6,
      tracerouteAddress: '10.10.10.10',
      wlanName: 'WLAN Name',
      wlanPassword: '12345',
      wlanUsername: 'user',
      networkPaths: { networkNodes }
    }]
  }

  it('process spec of GraphQL result to dto for on-demand spec', () => {
    const dto = specToDto(spec)
    expect(dto).toMatchSnapshot()
  })

  describe('process spec of GraphQL result to dto for scheduled spec', () => {
    const scheduledSpec = { ...spec, type: TestType.Scheduled }
    const mockDailySchedule: Schedule = {
      type: 'service_guard',
      frequency: ScheduleFrequency.Daily,
      day: null,
      hour: 1,
      timezone: 'Asia/Singapore'
    }
    const mockWeeklySchedule: Schedule = {
      type: 'service_guard',
      frequency: ScheduleFrequency.Weekly,
      day: 0,
      hour: 2,
      timezone: 'Asia/Singapore'
    }
    const mockMonthlySchedule: Schedule = {
      type: 'service_guard',
      frequency: ScheduleFrequency.Monthly,
      day: 18,
      hour: 20,
      timezone: 'Asia/Singapore'
    }
    let specToDtoFn: (
      spec?: Omit<ServiceGuardSpec, 'apsCount' | 'userId' | 'tests' | 'configs'> & {
        configs: Omit<ServiceGuardConfig, 'id' | 'specId' | 'updatedAt' | 'createdAt'>[]
      }
    ) => ServiceGuardFormDto | undefined

    afterEach(() => {
      jest.useRealTimers()
    })

    describe('convert convert db timezone to local (UTC+5.5)', () => {
      const timezone = 'Asia/Calcutta'
      beforeEach(() => {
        jest.resetModules()
        jest.doMock('moment-timezone', () => {
          const moment = jest.requireActual('moment-timezone')
          moment.tz.guess = () => timezone
          return moment
        })
        specToDtoFn = require('./services').specToDto
        jest.useFakeTimers()
        jest.setSystemTime(new Date(Date.parse('2021-05-01')))
      })

      it('should fetch day and time correctly for daily schedule from UTC+1', () => {
        const dailySchedule = {
          ...mockDailySchedule,
          hour: 20,
          timezone: 'Europe/London'
        }
        const dto = specToDtoFn({ ...scheduledSpec, schedule: dailySchedule })
        const expectedResult = { ...dailySchedule, hour: 0.5 }
        expect(dto!.schedule).toEqual(expectedResult)
      })

      it('should fetch day and time correctly for weekly schedule from UTC+9', () => {
        const weeklySchedule = {
          ...mockWeeklySchedule,
          day: 0,
          hour: 3,
          timezone: 'Asia/Tokyo'
        }
        const dto = specToDtoFn({ ...scheduledSpec, schedule: weeklySchedule })
        const expectedResult = { ...weeklySchedule, day: 6, hour: 23.5 }
        expect(dto!.schedule).toEqual(expectedResult)
      })

      it('should fetch day and time correctly for weekly schedule from UTC-7', () => {
        const weeklySchedule = {
          ...mockWeeklySchedule,
          day: 6,
          hour: 20,
          timezone: 'America/Vancouver'
        }
        const dto = specToDtoFn({ ...scheduledSpec, schedule: weeklySchedule })
        const expectedResult = { ...weeklySchedule, day: 0, hour: 8.5 }
        expect(dto!.schedule).toEqual(expectedResult)
      })

      it('should fetch day and time correctly for weekly schedule from UTC-4', () => {
        const weeklySchedule = {
          ...mockWeeklySchedule,
          day: 6,
          hour: 3,
          timezone: 'America/New_York'
        }
        const dto = specToDtoFn({ ...scheduledSpec, schedule: weeklySchedule })
        const expectedResult = { ...weeklySchedule, day: 6, hour: 12.5 }
        expect(dto!.schedule).toEqual(expectedResult)
      })

      it('should fetch day and time correctly for monthly schedule from UTC-4', () => {
        const monthlySchedule = {
          ...mockMonthlySchedule,
          day: 31,
          hour: 23,
          timezone: 'America/New_York'
        }
        const dto = specToDtoFn({ ...scheduledSpec, schedule: monthlySchedule })
        const expectedResult = { ...monthlySchedule, day: 1, hour: 8.5 }
        expect(dto!.schedule).toEqual(expectedResult)
      })

      it('should fetch day and time correctly for monthly schedule from UTC-7', () => {
        const monthlySchedule = {
          ...mockMonthlySchedule,
          day: 1,
          hour: 15,
          timezone: 'America/Los_Angeles'
        }
        const dto = specToDtoFn({ ...scheduledSpec, schedule: monthlySchedule })
        const expectedResult = { ...monthlySchedule, day: 2, hour: 3.5 }
        expect(dto!.schedule).toEqual(expectedResult)
      })

      it('should fetch day and time correctly for monthly schedule from UTC+8', () => {
        const monthlySchedule = {
          ...mockMonthlySchedule,
          day: 1,
          hour: 1,
          timezone: 'Asia/Singapore'
        }
        const dto = specToDtoFn({ ...scheduledSpec, schedule: monthlySchedule })
        const expectedResult = { ...monthlySchedule, day: 31, hour: 22.5 }
        expect(dto!.schedule).toEqual(expectedResult)
      })
    })

    describe('convert convert db timezone to local (UTC-4) with DST', () => {
      const timezone = 'America/New_York'
      beforeEach(() => {
        jest.resetModules()
        jest.doMock('moment-timezone', () => {
          const moment = jest.requireActual('moment-timezone')
          moment.tz.guess = () => timezone
          return moment
        })
        specToDtoFn = require('./services').specToDto
        jest.useFakeTimers()
        jest.setSystemTime(new Date(Date.parse('2021-05-01')))
      })

      it('should fetch day and time correctly for daily schedule from UTC+1', () => {
        const dailySchedule: Schedule = {
          ...mockDailySchedule,
          hour: 4.25,
          timezone: 'Europe/London'
        }
        const dto = specToDtoFn({ ...scheduledSpec, schedule: dailySchedule })
        const expectedResult = { ...dailySchedule, hour: 23.25 }
        expect(dto!.schedule).toEqual(expectedResult)
      })

      it('should fetch day and time correctly for weekly schedule from UTC+5.5', () => {
        const weeklySchedule: Schedule = {
          ...mockWeeklySchedule,
          day: 1,
          hour: 2,
          timezone: 'Asia/Calcutta'
        }
        const dto = specToDtoFn({ ...scheduledSpec, schedule: weeklySchedule })
        const expectedResult = { ...weeklySchedule, day: 0, hour: 16.5 }
        expect(dto!.schedule).toEqual(expectedResult)
      })

      it('should fetch day and time correctly for weekly schedule from UTC-7', () => {
        const weeklySchedule = {
          ...mockWeeklySchedule,
          day: 6,
          hour: 23,
          timezone: 'America/Vancouver'
        }
        const dto = specToDtoFn({ ...scheduledSpec, schedule: weeklySchedule })
        const expectedResult = { ...weeklySchedule, day: 0, hour: 2 }
        expect(dto!.schedule).toEqual(expectedResult)
      })

      it('should fetch day and time correctly for weekly schedule from UTC+1', () => {
        const weeklySchedule = {
          ...mockWeeklySchedule,
          day: 0,
          hour: 1,
          timezone: 'Europe/London'
        }
        const dto = specToDtoFn({ ...scheduledSpec, schedule: weeklySchedule })
        const expectedResult = { ...weeklySchedule, day: 6, hour: 20 }
        expect(dto!.schedule).toEqual(expectedResult)
      })

      it('should fetch day and time correctly for monthly schedule from UTC-7', () => {
        const monthlySchedule = {
          ...mockMonthlySchedule,
          day: 31,
          hour: 23,
          timezone: 'America/Vancouver'
        }
        const dto = specToDtoFn({ ...scheduledSpec, schedule: monthlySchedule })
        const expectedResult = { ...monthlySchedule, day: 1, hour: 2 }
        expect(dto!.schedule).toEqual(expectedResult)
      })

      it('should fetch day and time correctly for monthly schedule from UTC+8 (AM)', () => {
        const monthlySchedule = {
          ...mockMonthlySchedule,
          day: 1,
          hour: 10,
          timezone: 'Asia/Singapore'
        }
        const dto = specToDtoFn({ ...scheduledSpec, schedule: monthlySchedule })
        const expectedResult = { ...monthlySchedule, day: 31, hour: 22 }
        expect(dto!.schedule).toEqual(expectedResult)
      })

      it('should fetch day and time correctly for monthly schedule from UTC+8 (PM)', () => {
        const monthlySchedule = {
          ...mockMonthlySchedule,
          day: 15,
          hour: 20,
          timezone: 'Asia/Singapore'
        }
        const dto = specToDtoFn({ ...scheduledSpec, schedule: monthlySchedule })
        const expectedResult = { ...monthlySchedule, day: 15, hour: 8 }
        expect(dto!.schedule).toEqual(expectedResult)
      })
    })

    describe('max timezone difference', () => {
      describe('-26 hours', () => {
        const timezone = 'Etc/GMT+12'
        beforeEach(() => {
          jest.resetModules()
          jest.doMock('moment-timezone', () => {
            const moment = jest.requireActual('moment-timezone')
            moment.tz.guess = () => timezone
            return moment
          })
          specToDtoFn = require('./services').specToDto
          jest.useFakeTimers()
        })

        it('should fetch day and time correctly for weekly schedule', () => {
          jest.setSystemTime(new Date(Date.parse('2021-09-01')))
          const weeklySchedule = {
            ...mockWeeklySchedule,
            day: 0,
            hour: 0,
            timezone: 'Etc/GMT-14'
          }
          const dto = specToDtoFn({ ...scheduledSpec, schedule: weeklySchedule })
          const expectedResult = { ...weeklySchedule, day: 5, hour: 22 }
          expect(dto!.schedule).toEqual(expectedResult)
        })

        it('should fetch day and time correctly for monthly schedule', () => {
          jest.setSystemTime(new Date(Date.parse('2021-02-01')))
          const monthlySchedule = {
            ...mockMonthlySchedule,
            day: 1,
            hour: 1,
            timezone: 'Etc/GMT-14'
          }
          const dto = specToDtoFn({ ...scheduledSpec, schedule: monthlySchedule })
          const expectedResult = { ...monthlySchedule, day: 30, hour: 23 }
          expect(dto!.schedule).toEqual(expectedResult)
        })
      })

      describe('26 hours', () => {
        const timezone = 'Etc/GMT-14'
        beforeEach(() => {
          jest.resetModules()
          jest.doMock('moment-timezone', () => {
            const moment = jest.requireActual('moment-timezone')
            moment.tz.guess = () => timezone
            return moment
          })
          specToDtoFn = require('./services').specToDto
          jest.useFakeTimers()
        })

        it('should fetch day and time correctly for weekly schedule', () => {
          jest.setSystemTime(new Date(Date.parse('2021-04-01')))
          const weeklySchedule = {
            ...mockWeeklySchedule,
            day: 0,
            hour: 23,
            timezone: 'Etc/GMT+12'
          }
          const dto = specToDtoFn({ ...scheduledSpec, schedule: weeklySchedule })
          const expectedResult = { ...weeklySchedule, day: 2, hour: 1 }
          expect(dto!.schedule).toEqual(expectedResult)
        })

        it('should fetch day and time correctly for monthly schedule', () => {
          jest.setSystemTime(new Date(Date.parse('2021-06-01')))
          const monthlySchedule = {
            ...mockMonthlySchedule,
            day: 31,
            hour: 23,
            timezone: 'Etc/GMT+12'
          }
          const dto = specToDtoFn({ ...scheduledSpec, schedule: monthlySchedule })
          const expectedResult = { ...monthlySchedule, day: 2, hour: 1 }
          expect(dto!.schedule).toEqual(expectedResult)
        })
      })
    })
  })

  it('handle spec = undefined', () => {
    expect(specToDto()).toBe(undefined)
  })
})
describe('useServiceGuardTestResults', () => {
  it('load spec data if specId in URL', async () => {
    const config = {
      pingAddress: null,
      tracerouteAddress: null,
      speedTestEnabled: false
    }
    mockGraphqlQuery(apiUrl, 'ServiceGuardResults', {
      data: { serviceGuardTest: fixtures.mockResultForVirtualClient({ ...config }) }
    })
    const { result } = renderHook(useServiceGuardTestResults, {
      wrapper: Provider,
      route: { params: { testId: '1' } }
    })
    await waitFor(() => expect(result.current.tableQuery.isSuccess).toBe(true))
    expect(result.current.tableQuery.data).toEqual(
      fixtures.mockResultForVirtualClient({ ...config })
    )
  })

  it('does not load spec data if specId not in URL', () => {
    const { result } = renderHook(useServiceGuardTestResults, { wrapper: Provider })
    expect(result.current.tableQuery.isUninitialized).toBe(true)
  })

  it('handleTableChange should update pagination', () => {
    const { result } = renderHook(useServiceGuardTestResults, { wrapper: Provider })
    const customPagination = { current: 1, pageSize: 10 }
    result.current.onPageChange(
      customPagination,
      { filter: null },
      [],
      [] as unknown as TableCurrentDataSource<TestResultByAP>
    )
    expect(result.current.pagination).toEqual({
      defaultPageSize: 10,
      page: 1,
      pageSize: 10,
      total: 0
    })
  })
})

describe('useMutationResponseEffect', () => {
  it('should return when no data', async () => {
    const response = {} as MutationResponse<{ userErrors?: MutationUserError[] }>
    const { result } = renderHook(() =>
      useMutationResponseEffect(response), { wrapper: Provider })
    expect(result.current).toEqual(undefined)
  })
  it('should return when no error', async () => {
    const onOk = jest.fn()
    const response = { data: {} } as MutationResponse<{ userErrors?: MutationUserError[] }>
    renderHook(() => useMutationResponseEffect(response, onOk), { wrapper: Provider })
    expect(onOk).toBeCalled()
  })
  it('should show error', async () => {
    const response = {
      data: { userErrors: [{ field: 'spec', message: 'RUN_TEST_NO_APS' }] }
    } as MutationResponse<{ userErrors?: MutationUserError[] }>
    renderHook(() => useMutationResponseEffect(response), { wrapper: Provider })
    expect(await screen.findByText('There are no APs to run the test')).toBeVisible()
  })
})
