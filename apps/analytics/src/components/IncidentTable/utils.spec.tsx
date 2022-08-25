import '@testing-library/jest-dom'
import moment            from 'moment-timezone'
import { defineMessage } from 'react-intl'

import { incidentCodes, noDataSymbol, incidentInformation, Incident } from '@acx-ui/analytics/utils'
import { Provider }                                                   from '@acx-ui/store'
import { render, screen, cleanup }                                    from '@acx-ui/test-utils'

import {
  GetIncidentBySeverity,
  FormatDate,
  clientImpactSort,
  severitySort,
  FormatIntlString,
  FormatIntlStringProps,
  GetCategory,
  IncidentTableComponentProps,
  GetScope,
  dateSort,
  defaultSort,
  ShortIncidentDescription
} from './utils'

describe('IncidentTable: utils', () => {

  beforeEach(() => {
    moment.tz.setDefault('Asia/Singapore')
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })

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
    const testSeverityArr = [
      { value: 0.001, label: 'P4' }, 
      { value: 0.65, label: 'P3' }, 
      { value: 0.8, label: 'P2' },
      { value: 1, label: 'P1' },
      { value: undefined, label: noDataSymbol }
    ]
    
    it.each(testSeverityArr)(
      'should show correct label: %s for value %n', 
      async ({ label, value }) => {
        render(<Provider>
          <GetIncidentBySeverity value={value as unknown as number} id={'test'}/>
        </Provider>, {
          route: {
            path: '/t/tenantId/analytics/incidents',
            wrapRoutes: false,
            params: {
              tenantId: '1'
            }
          }
        })
        await screen.findByText(label)
        expect(screen.getByText(label).textContent).toMatch(label)
      })
  })

  describe('formatDate', () => {
    it('should show correct date', async () => {
      render(<FormatDate datetimestamp='2022-08-15T00:00:00+08:00'/>)
      await screen.findByText('Aug 15 2022 00:00')
      expect(screen.getByText('Aug 15 2022 00:00').textContent).toMatch('Aug 15 2022 00:00')
    })

    it('should show null for null date', async () => {
      render(<FormatDate datetimestamp={null as unknown as string}/>)
      await screen.findByText(noDataSymbol)
      expect(screen.getByText(noDataSymbol).textContent).toMatch(noDataSymbol)
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

    it('should return negative on a < b', () => {
      const reverseSmaller = severitySort(a, b)
      expect(reverseSmaller).toBe(-1)
    })

    it('should return positive a > b', () => {
      const reverseGreater = severitySort(b, a)
      expect(reverseGreater).toBe(1)
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
      return <Provider>{GetCategory(props.code as string)}</Provider>
    }
  
    it('getCategory: valid codes', async () => {
      incidentCodes.forEach(async (code) => {
        render(<RenderGetCategory code={code}/>)
        const category = incidentInformation[code].category.defaultMessage
        await screen.findByText(category)
        expect(screen.getByText(category).textContent).toBe(category)
      })
    })
  })

  describe('ShortIncidentDescription', () => {  
    const RenderShortDescription = (props: IncidentTableComponentProps) => {
      return <Provider><ShortIncidentDescription {...props}/></Provider>
    }
  
    it('ShortIncidentDescription: it renders on valid incident', async () => {
      render(<RenderShortDescription incident={testIncident}/>)
      // eslint-disable-next-line max-len
      const expectedShortDesc = '802.11 Authentication failures are unusually high in Venue: Venue-3-US'
      await screen.findByText(expectedShortDesc)
      expect(screen.getByText(expectedShortDesc).textContent).toBe(expectedShortDesc)
    })
  })

  describe('GetScope', () => {
    const RenderGetScope = (props: IncidentTableComponentProps) => {
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
      expect(smaller).toBe(1)
    })

    it('should sort greater date time', () => {
      const greater = dateSort(endTime, startTime)
      expect(greater).toBe(-1)
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

})

