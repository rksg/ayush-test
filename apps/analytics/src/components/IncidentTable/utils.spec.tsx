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
  GetScope
} from './utils'

describe('IncidentTable: utils', () => {

  afterEach(() => cleanup())

  it('getIncidentBySeverity', () => {
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

    const testUndefinedSeverity = getIncidentBySeverity(undefined)
    expect(testUndefinedSeverity).toBe(noDataSymbol)

    const testNullSeverity = getIncidentBySeverity(null)
    expect(testNullSeverity).toBe(noDataSymbol)

    const testNegativeSeverity = getIncidentBySeverity(-1)
    expect(testNegativeSeverity).toBe(noDataSymbol)
  })

  it('formatDate', () => {
    const testWorkingDate = formatDate('2022-08-15T00:00:00+08:00')
    expect(testWorkingDate).toBe('Aug 15 2022 00:00')

    const testUndefinedDate = formatDate()
    expect(testUndefinedDate).toBe(noDataSymbol)
  })

  it('formatDuration', () => {
    const startTime = '2022-08-15T00:00:00+08:00'
    const endTime = '2022-08-16T00:00:00+08:00'
    const testDuration = formatDuration(startTime, endTime)
    expect(testDuration).toBe('1d')

    const testEmptyDurationStart = formatDuration(startTime, undefined)
    expect(testEmptyDurationStart).toBe(noDataSymbol)

    const testEmptyDurationEnd = formatDuration(undefined, startTime)
    expect(testEmptyDurationEnd).toBe(noDataSymbol)

    const testEmptyDurationBoth = formatDuration()
    expect(testEmptyDurationBoth).toBe(noDataSymbol)
  })

  it('clientImpactSort', () => {
    const a = 1
    const b = 2
    const forwards = clientImpactSort(a, b)
    expect(forwards).toBe(1)

    const backwards = clientImpactSort(b, a)
    expect(backwards).toBe(-1)

    const noDataA = clientImpactSort(noDataSymbol, b)
    expect(noDataA).toBe(1)

    const noDataB = clientImpactSort(a, noDataSymbol)
    expect(noDataB).toBe(-1)

    const noData = clientImpactSort(noDataSymbol, noDataSymbol)
    expect(noData).toBe(0)

    const noDefined = clientImpactSort()
    expect(noDefined).toBe(0)
  })

  it('severitySort', () => {
    const a = 1
    const b = 2

    const forwards = severitySort(a, b)
    expect(forwards).toBe(1)

    const backwards = severitySort(b, a)
    expect(backwards).toBe(-1)

    const noDataA = severitySort(noDataSymbol, b)
    expect(noDataA).toBe(0)

    const noDataB = severitySort(a, noDataSymbol)
    expect(noDataB).toBe(0)

    const noDataBoth = severitySort(noDataSymbol, noDataSymbol)
    expect(noDataBoth).toBe(0)

    const noDefinedA = severitySort(undefined, b)
    expect(noDefinedA).toBe(0)

    const noDefinedB = severitySort(a, undefined)
    expect(noDefinedB).toBe(0)
  })

  const RenderDummyString = (props: FormatIntlStringProps) => {
    return <Provider><FormatIntlString {...props}/></Provider>
  }

  it('FormatIntlString: it should render normal string', async () => {
    const msg = defineMessage({ defaultMessage: 'test' })
    render(<RenderDummyString message={msg} />)
    await screen.findByText('test')
    expect(screen.getByText('test').textContent).toBe('test')
  })

  it('FormatIntlString: it should render scoped string', async () => {
    const scopeMsg = defineMessage({ defaultMessage: 'test {scope}' })
    render(<RenderDummyString message={scopeMsg} scope='scope'/>)
    await screen.findByText('test scope')
    expect(screen.getByText('test scope').textContent).toBe('test scope')
  })

  it('FormatIntlString: it should render threshold string', async () => {
    const scopeMsg = defineMessage({ defaultMessage: 'test: {threshold}' })
    render(<RenderDummyString message={scopeMsg} threshold='threshold'/>)
    await screen.findByText('test: threshold')
    expect(screen.getByText('test: threshold').textContent).toBe('test: threshold')
  })

  it('FormatIntlString: it should render threshold & scope string', async () => {
    const scopeMsg = defineMessage({ defaultMessage: 'test: {threshold} & {scope}' })
    render(<RenderDummyString message={scopeMsg} threshold='threshold' scope='scope'/>)
    await screen.findByText('test: threshold & scope')
    expect(screen.getByText('test: threshold & scope').textContent).toBe('test: threshold & scope')
  })

  interface RenderGetCategoryProps {
    code?: string
  }

  const RenderGetCategory = (props: RenderGetCategoryProps) => {
    return <Provider>{getCategory(props.code)}</Provider>
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

  const RenderLongDescription = (props: LongIncidentDescriptionProps) => {
    return <Provider><LongIncidentDescription {...props}/></Provider>
  }

  it('LongIncidentDescription: it renders on valid incident', async () => {
    const { asFragment } = render(<RenderLongDescription incident={testIncident}/>)
    expect(asFragment()).toMatchSnapshot()
  })

  const RenderGetScope = (props: GetScopeProps) => {
    return <Provider><GetScope {...props} /></Provider>
  }

  it('GetScope', async () => {
    const { asFragment } = render(<RenderGetScope incident={testIncident}/>)
    expect(asFragment()).toMatchSnapshot()
  })

})

