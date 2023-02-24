import {
  networkHealthApi as api,
  networkHealthApiURL as apiUrl
} from '@acx-ui/analytics/services'
import { Provider, store }                                                 from '@acx-ui/store'
import { act, mockGraphqlMutation, mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import * as fixtures             from './__tests__/fixtures'
import {
  processDtoToPayload,
  specToDto,
  useNetworkHealthSpec,
  useNetworkHealthSpecMutation
} from './services'
import {
  AuthenticationMethod,
  Band,
  ClientType,
  TestType,
  NetworkPaths,
  Schedule,
  ScheduleFrequency,
  NetworkHealthFormDto,
  NetworkHealthSpec
} from './types'

beforeEach(() => store.dispatch(api.util.resetApiState()))

describe('useNetworkHealthSpec', () => {
  it('load spec data if specId in URL', async () => {
    mockGraphqlQuery(apiUrl, 'FetchServiceGuardSpec', { data: fixtures.fetchServiceGuardSpec })

    const { result } = renderHook(useNetworkHealthSpec, {
      wrapper: Provider,
      route: { params: { specId: 'spec-id' } }
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(fixtures.fetchServiceGuardSpec.serviceGuardSpec)
  })

  it('does not load spec data if specId not in URL', () => {
    const { result } = renderHook(useNetworkHealthSpec, { wrapper: Provider })
    expect(result.current.isUninitialized).toBe(true)
  })
})

describe('useNetworkHealthSpecMutation', () => {
  it('handles create mutation', async () => {
    const dto: NetworkHealthFormDto = {
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
        // TODO:
        // Update to correct format when APsSelection input done
        networkPaths: { networkNodes: 'VENUE|00:00:00:00:00:00' }
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
      useNetworkHealthSpecMutation,
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
    const dto: NetworkHealthFormDto = {
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
        // TODO:
        // Update to correct format when APsSelection input done
        networkPaths: { networkNodes: 'VENUE|00:00:00:00:00:00' }
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

    const { result } = renderHook(useNetworkHealthSpecMutation, {
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

describe('processDtoToPayload', () => {
  const dto: NetworkHealthFormDto = {
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
      wlanUsername: 'user'
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
  it('process dto to payload for GraphQL input', () => {
    const payload = processDtoToPayload({
      ...dto,
      configs: [{
        ...dto.configs[0],
        // TODO:
        // Update to correct format when APsSelection input done
        networkPaths: { networkNodes: 'VENUE|00:00:00:00:00:00' }
      }]
    })

    expect(payload).toMatchSnapshot()
  })

  it('handle zone only', () => {
    // TODO:
    // Remove when APsSelection input done
    const payload = processDtoToPayload({
      ...dto,
      configs: [{
        ...dto.configs[0],
        // TODO:
        // Update to correct format when APsSelection input done
        networkPaths: { networkNodes: 'VENUE' }
      }]
    })

    expect(payload).toMatchSnapshot()
  })

  it('handle zone + apGroup', () => {
    // TODO:
    // Remove when APsSelection input done
    const payload = processDtoToPayload({
      ...dto,
      configs: [{
        ...dto.configs[0],
        // TODO:
        // Update to correct format when APsSelection input done
        networkPaths: { networkNodes: 'VENUE>AP Group' }
      }]
    })

    expect(payload).toMatchSnapshot()
  })
})

describe('specToDto', () => {
  const spec: NetworkHealthSpec = {
    id: 'spec-id',
    clientType: ClientType.VirtualWirelessClient,
    schedule: null,
    type: TestType.OnDemand,
    name: 'Test Name',
    configs: [{
      authenticationMethod: 'WPA3_PERSONAL',
      dnsServer: '10.10.10.10',
      pingAddress: '10.10.10.10',
      radio: Band.Band6,
      tracerouteAddress: '10.10.10.10',
      wlanName: 'WLAN Name',
      wlanPassword: '12345',
      wlanUsername: 'user',
      networkPaths: {
        networkNodes: [[
          { type: 'zone', name: 'VENUE' },
          { type: 'apMac', list: ['00:00:00:00:00:00'] }
        ]] as NetworkPaths
      }
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
    let specToDtoFn: (spec: NetworkHealthSpec) => NetworkHealthFormDto

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
        expect(dto.schedule).toEqual(expectedResult)
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
        expect(dto.schedule).toEqual(expectedResult)
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
        expect(dto.schedule).toEqual(expectedResult)
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
        expect(dto.schedule).toEqual(expectedResult)
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
        expect(dto.schedule).toEqual(expectedResult)
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
        expect(dto.schedule).toEqual(expectedResult)
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
        expect(dto.schedule).toEqual(expectedResult)
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
        expect(dto.schedule).toEqual(expectedResult)
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
        expect(dto.schedule).toEqual(expectedResult)
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
        expect(dto.schedule).toEqual(expectedResult)
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
        expect(dto.schedule).toEqual(expectedResult)
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
        expect(dto.schedule).toEqual(expectedResult)
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
        expect(dto.schedule).toEqual(expectedResult)
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
        expect(dto.schedule).toEqual(expectedResult)
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
          expect(dto.schedule).toEqual(expectedResult)
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
          expect(dto.schedule).toEqual(expectedResult)
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
          expect(dto.schedule).toEqual(expectedResult)
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
          expect(dto.schedule).toEqual(expectedResult)
        })
      })
    })
  })

  it('handles path without AP list', () => {
    // TODO:
    // Remove when APsSelection input done
    const dto = specToDto({
      ...spec,
      configs: [{
        ...spec.configs[0],
        networkPaths: {
          networkNodes: [[
            { type: 'zone', name: 'VENUE' },
            { type: 'apGroup', name: 'AP Group' }
          ]] as NetworkPaths
        }
      }]
    })
    expect(dto).toMatchSnapshot()
  })

  it('handle spec = undefined', () => {
    expect(specToDto()).toBe(undefined)
  })
})
