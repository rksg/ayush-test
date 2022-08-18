import '@testing-library/jest-dom'
import { defineMessage } from 'react-intl'

import { incidentCodes, noDataSymbol, incidentInformation, Incident } from '@acx-ui/analytics/utils'
import { Provider }                                                   from '@acx-ui/store'
import { render, screen, cleanup }                                    from '@acx-ui/test-utils'

import {
  getIncidentBySeverity,
  formatDate,
  formatDuration,
  clientImpactSort,
  severitySort,
  FormatIntlString,
  FormatIntlStringProps,
  getCategory,
  LongIncidentDescription,
  LongIncidentDescriptionProps,
  GetScopeProps,
  GetScope,
  dateSort,
  defaultSort,
  durationSort
} from './utils'

describe('IncidentTable: utils', () => {

  afterEach(() => cleanup())

  const testIncident: Incident = {
    severity: 0.3813119146230035,
    startTime: '2022-07-21T01:15:00.000Z',
    endTime: '2022-07-21T01:18:00.000Z',
    code: 'auth-failure',
    sliceType: 'zone',
    sliceValue: 'Venue-3-US',
    id: '268a443a-e079-4633-9491-536543066e7d',
    path: [
      {
        type: 'zone',
        name: 'Venue-3-US'
      }
    ],
    metadata: {
      dominant: {
        ssid: 'qa-eric-acx-R760-psk'
      },
      rootCauseChecks: {
        checks: [
          {
            CCD_REASON_NOT_AUTHED: true
          }
        ],
        params: {}
      }
    },
    clientCount: 2,
    impactedClientCount: 2,
    isMuted: false,
    mutedBy: null,
    mutedAt: null,
    apCount: 0,
    impactedApCount: 0,
    switchCount: 0,
    vlanCount: 0,
    connectedPowerDeviceCount: 0,
    slaThreshold: null,
    currentSlaThreshold: null,
    relatedIncidents: [
      {
        severity: 0.3813119146230035,
        startTime: '2022-07-21T01:15:00.000Z',
        endTime: '2022-07-21T01:18:00.000Z',
        code: 'auth-failure',
        sliceType: 'zone',
        sliceValue: 'Venue-3-US',
        id: '268a443a-e079-4633-9491-536543066e7d',
        path: [
          {
            type: 'zone',
            name: 'Venue-3-US'
          }
        ],
        metadata: {
          dominant: {
            ssid: 'qa-eric-acx-R760-psk'
          },
          rootCauseChecks: {
            checks: [
              {
                CCD_REASON_NOT_AUTHED: true
              }
            ],
            params: {}
          }
        },
        clientCount: 2,
        impactedClientCount: 2,
        isMuted: false,
        mutedBy: null,
        mutedAt: null,
        apCount: 0,
        impactedApCount: 0,
        switchCount: 0,
        vlanCount: 0,
        connectedPowerDeviceCount: 0,
        slaThreshold: null,
        currentSlaThreshold: null
      }
    ]
  }

  describe('getIncidentBySeverity', () => {
    it('should show correct values', () => {
      const testSeverityArr = [
        { value: 0, label: 'P4' }, 
        { value: 0.65, label: 'P3' }, 
        { value: 0.8, label: 'P2' },
        { value: 1, label: 'P1' }
      ]
  
      testSeverityArr.forEach((severity) => {
        const calculatedSeverity = getIncidentBySeverity(severity.value)
        expect(calculatedSeverity).toBe(severity.label)
      })
    })

    it('should show noDataSymbol on undefined', () => {
      const testUndefinedSeverity = getIncidentBySeverity(undefined)
      expect(testUndefinedSeverity).toBe(noDataSymbol)
    })

    it('should show noDataSymbol on null', () => {
      const testNullSeverity = getIncidentBySeverity(null)
      expect(testNullSeverity).toBe(noDataSymbol)
    })

    it('should show noDataSymbol on negative', () => {
      const testNegativeSeverity = getIncidentBySeverity(-1)
      expect(testNegativeSeverity).toBe(noDataSymbol)
    })
  })

  describe('formatDate', () => {
    it('should show correct date', () => {
      const testWorkingDate = formatDate('2022-08-15T00:00:00+08:00')
      expect(testWorkingDate).toBe('Aug 15 2022 00:00')
    })

    it('should show noDataSymbol for undefined date', () => {
      const testUndefinedDate = formatDate()
      expect(testUndefinedDate).toBe(noDataSymbol)
    })
  })

  describe('formatDuration', () => {
    const startTime = '2021-07-15T00:00:00+08:00'
    const endTime = '2022-08-16T00:00:00+08:00'

    it('should calculate correct duration', () => {
      const testDuration = formatDuration(startTime, endTime)
      expect(testDuration).toBe('1y 1mo')
    })

    it('should show noDataSymbol for undefined startTime', () => {
      const testEmptyDurationStart = formatDuration(startTime, undefined)
      expect(testEmptyDurationStart).toBe(noDataSymbol)
    })

    it('should show noDataSymbol for undefined endTime', () => {
      const testEmptyDurationEnd = formatDuration(undefined, startTime)
      expect(testEmptyDurationEnd).toBe(noDataSymbol)
    })

    it('should show noDataSymbol for undefined time', () => {
      const testEmptyDurationBoth = formatDuration()
      expect(testEmptyDurationBoth).toBe(noDataSymbol)
    })
  })

  describe('clientImpactSort', () => {
    const a = 1
    const b = 2

    it('should return postive on a < b', () => {
      const positive = clientImpactSort(a, b)
      expect(positive).toBe(1)
    })

    it('should return negative on a > b', () => {
      const negative = clientImpactSort(b, a)
      expect(negative).toBe(-1)
    })

    it('should return noDataSymbol on a', () => {
      const noDataA = clientImpactSort(noDataSymbol, b)
      expect(noDataA).toBe(1)
    })

    it('should return noDataSymbol on b', () => {
      const noDataB = clientImpactSort(a, noDataSymbol)
      expect(noDataB).toBe(-1)
    })

    it('should return noDataSymbol on both', () => {
      const noData = clientImpactSort(noDataSymbol, noDataSymbol)
      expect(noData).toBe(0)
    })

    it('should return 0 on undefined inputs', () => {
      const noDefined = clientImpactSort()
      expect(noDefined).toBe(0)
    })
  })

  describe('severitySort', () => {
    const a = 1
    const b = 2

    it('should return positive on a < b', () => {
      const reverseSmaller = severitySort(a, b)
      expect(reverseSmaller).toBe(1)
    })

    it('should return negative a > b', () => {
      const reverseGreater = severitySort(b, a)
      expect(reverseGreater).toBe(-1)
    })

    it('should return 0 with noDataSymbol on a', () => {
      const noDataA = severitySort(noDataSymbol, b)
      expect(noDataA).toBe(0)
    })

    it('should return 0 with noDataSymbol on b', () => {
      const noDataB = severitySort(a, noDataSymbol)
      expect(noDataB).toBe(0)
    })

    it('should return 0 on noDataSymbol on both', () => {
      const noDataBoth = severitySort(noDataSymbol, noDataSymbol)
      expect(noDataBoth).toBe(0)
    })

    it('should return 0 on undefined on a', () => {
      const noDefinedA = severitySort(undefined, b)
      expect(noDefinedA).toBe(0)
    })

    it('should return 0 on undefined on b', () => {
      const noDefinedB = severitySort(a, undefined)
      expect(noDefinedB).toBe(0)
    })

    it('should return 0 on undefined on both', () => {
      const noDefinedB = severitySort(undefined, undefined)
      expect(noDefinedB).toBe(0)
    })
  })

  const RenderDummyString = (props: FormatIntlStringProps) => {
    return <Provider><FormatIntlString {...props}/></Provider>
  }

  describe('FormatIntlString', () => {
    it('should render normal', async () => {
      const msg = defineMessage({ defaultMessage: 'test' })
      render(<RenderDummyString message={msg} />)
      await screen.findByText('test')
      expect(screen.getByText('test').textContent).toBe('test')
    })
  
    it('should render scoped', async () => {
      const scopeMsg = defineMessage({ defaultMessage: 'test {scope}' })
      render(<RenderDummyString message={scopeMsg} scope='scope'/>)
      await screen.findByText('test scope')
      expect(screen.getByText('test scope').textContent).toBe('test scope')
    })
  
    it('should render threshold', async () => {
      const scopeMsg = defineMessage({ defaultMessage: 'test: {threshold}' })
      render(<RenderDummyString message={scopeMsg} threshold='threshold'/>)
      await screen.findByText('test: threshold')
      expect(screen.getByText('test: threshold').textContent).toBe('test: threshold')
    })
  
    it('should render threshold & scope', async () => {
      const scopeMsg = defineMessage({ defaultMessage: 'test: {threshold} & {scope}' })
      render(<RenderDummyString message={scopeMsg} threshold='threshold' scope='scope'/>)
      await screen.findByText('test: threshold & scope')
      const textContent = screen.getByText('test: threshold & scope').textContent
      expect(textContent).toBe('test: threshold & scope')
    })
  })

  describe('getCategory', () => {
    interface RenderGetCategoryProps {
      code?: string
    }
  
    const RenderGetCategory = (props: RenderGetCategoryProps) => {
      return <Provider>{getCategory(props.code as string)}</Provider>
    }
  
    it('getCategory: valid codes', async () => {
      incidentCodes.forEach(async (code) => {
        render(<RenderGetCategory code={code}/>)
        const category = incidentInformation[code].category.defaultMessage
        await screen.findByText(category)
        expect(screen.getByText(category).textContent).toBe(category)
      })
    })
  
    it('getCategory: undefined code', async () => {
      render(<RenderGetCategory code={undefined}/>)
      await screen.findByText(noDataSymbol)
      expect(screen.getByText(noDataSymbol).textContent).toBe(noDataSymbol)
    })
  })

  describe('LongIncidentDescription', () => {  
    const RenderLongDescription = (props: LongIncidentDescriptionProps) => {
      return <Provider><LongIncidentDescription {...props}/></Provider>
    }
  
    it('LongIncidentDescription: it renders on valid incident', async () => {
      const { asFragment } = render(<RenderLongDescription incident={testIncident}/>)
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('GetScope', () => {
    const RenderGetScope = (props: GetScopeProps) => {
      return <Provider><GetScope {...props} /></Provider>
    }
  
    it('should render GetScope on correct incident', async () => {
      const { asFragment } = render(<RenderGetScope incident={testIncident}/>)
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('dateSort', () => {
    const startTime = '2021-07-15T00:00:00+08:00'
    const endTime = '2022-08-16T00:00:00+08:00'

    it('should sort smaller date time', () => {
      const smaller = dateSort(startTime, endTime)
      expect(smaller).toBe(-1)
    })

    it('should sort greater date time', () => {
      const greater = dateSort(endTime, startTime)
      expect(greater).toBe(1)
    })

    it('should sort 0 date time', () => {
      const zero = dateSort(startTime, startTime)
      expect(zero).toBe(0)
    })
  })

  describe('defaultSort', () => {
    const a = 1
    const b = 2

    it('should sort smaller number', () => {
      const smaller = defaultSort(a, b)
      expect(smaller).toBe(-1)
    })

    it('should sort greater number', () => {
      const greater = defaultSort(b, a)
      expect(greater).toBe(1)
    })

    it('should sort 0 number', () => {
      const zero = defaultSort(a, a)
      expect(zero).toBe(0)
    })

    const textA = 'a'
    const textB = 'b'

    it('should sort smaller string', () => {
      const smaller = defaultSort(textA, textB)
      expect(smaller).toBe(-1)
    })

    it('should sort greater string', () => {
      const greater = defaultSort(textB, textA)
      expect(greater).toBe(1)
    })

    it('should sort 0 string', () => {
      const zero = defaultSort(textA, textA)
      expect(zero).toBe(0)
    })
  })

  describe('durationSort', () => {
    const startTimeLong = '2021-07-15T00:00:00+08:00'
    const endTimeLong = '2022-08-16T00:00:00+08:00'
    const startTimeShort = '2022-08-15T00:00:00+08:00'
    const endTimeShort = '2022-08-16T00:00:00+08:00'

    it('should sort smaller duration', () => {
      const smaller = durationSort(startTimeShort, endTimeShort, startTimeLong, endTimeLong)
      expect(smaller).toBe(-1)
    })

    it('should sort greater duration', () => {
      const greater = durationSort(startTimeLong, endTimeLong, startTimeShort, endTimeShort)
      expect(greater).toBe(1)
    })

    it('should sort 0 duration', () => {
      const zero = durationSort(startTimeLong, endTimeLong, startTimeLong, endTimeLong)
      expect(zero).toBe(0)
    })
  })

})

