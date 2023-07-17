import moment from 'moment-timezone'

import { Event, TableQuery } from '@acx-ui/rc/utils'
import { renderHook }        from '@acx-ui/test-utils'
import { RequestPayload }    from '@acx-ui/types'
import { DateRange }         from '@acx-ui/utils'

import { useExportCsv } from './useExportCsv'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ tenantId: 'tenantId' })
}))

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({ data: {
    detailLevel: 'debug',
    dateFormat: 'mm/dd/yyyy',
    support: false
  } })
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useTenantId: () => 'tenantId'
}))

const mockDownloadCsv = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useDownloadEventsCSVMutation: () => [ mockDownloadCsv ]
}))

describe('useExportCsv', () => {
  const timezone = 'UTC'
  beforeEach(() => {
    moment.tz.setDefault(timezone)
  })
  afterEach(() => {
    moment.tz.setDefault(moment.tz.guess())
  })

  it('should return disabled = false if there is data', () => {
    const tableQuery = { data: { data: [{} as Event] }
    } as TableQuery<Event, RequestPayload<unknown>, unknown>
    const { result } = renderHook(() => useExportCsv(tableQuery))
    expect(result.current.disabled).toBe(false)
  })
  it('should return disabled = true if there is no data', () => {
    const tableQuery = { data: {} } as TableQuery<Event, RequestPayload<unknown>, unknown>
    const { result } = renderHook(() => useExportCsv(tableQuery))
    expect(result.current.disabled).toBe(true)
  })
  it('should call downloadCsv with correct payload', () => {
    const tableQuery = {
      data: { data: [] as Event[] },
      payload: {
        searchString: 'searchString',
        searchTargetFields: ['searchTargetFields'],
        filters: {
          entity_type: ['AP', 'CLIENT', 'SWITCH', 'NETWORK'],
          dateFilter: {
            range: DateRange.custom,
            startDate: '2021-12-31T23:00:00Z',
            endDate: '2022-01-01T00:00:00Z'
          }
        }
      },
      sorter: { sortField: 'event_datetime', sortOrder: 'DESC' }
    } as unknown as TableQuery<Event, RequestPayload<unknown>, unknown>
    const { result } = renderHook(() => useExportCsv(tableQuery))
    result.current.exportCsv()
    expect(mockDownloadCsv).toBeCalled()
    expect(mockDownloadCsv).toBeCalledWith({
      clientDateFormat: 'MM/dd/yyyy',
      clientTimeZone: 'Africa/Abidjan',
      detailLevel: 'debug',
      eventsPeriodForExport: {
        fromTime: '2021-12-31T23:00:00Z',
        toTime: '2022-01-01T00:00:00Z'
      },
      filters: { entity_type: ['AP', 'CLIENT', 'SWITCH', 'NETWORK'] },
      isSupport: false,
      searchString: 'searchString',
      searchTargetFields: ['searchTargetFields'],
      sortField: 'event_datetime',
      sortOrder: 'DESC',
      tenantId: 'tenantId'
    })
  })
})
