import '@testing-library/jest-dom'
import moment from 'moment-timezone'

import { fakeIncident, Incident } from '@acx-ui/analytics/utils'
import { Provider }               from '@acx-ui/store'
import { render, screen }         from '@acx-ui/test-utils'

import { incidentTests } from './__tests__/fixtures'
import { transformData } from './services'
import {
  GetIncidentBySeverity,
  IncidentTableComponentProps,
  ShortIncidentDescription,
  filterMutedIncidents
} from './utils'

describe('IncidentTable: utils', () => {

  beforeEach(() => {
    moment.tz.setDefault('Asia/Singapore')
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })

  const incidentValues = {
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

  const sampleIncident = fakeIncident(incidentValues as unknown as Incident)

  describe('getIncidentBySeverity', () => {
    const testSeverityArr = [
      { label: 'P4' },
      { label: 'P3' },
      { label: 'P2' },
      { label: 'P1' }
    ]

    it.each(testSeverityArr)(
      'should show correct label: %s',
      async ({ label }) => {
        render(<Provider>
          <GetIncidentBySeverity severityLabel={label} id={'test'}/>
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

  describe('ShortIncidentDescription', () => {
    const RenderShortDescription = (props: IncidentTableComponentProps) => {
      return <Provider>
        <ShortIncidentDescription onClickDesc={jest.fn()} highlightFn={jest.fn(v => v)} {...props}/>
      </Provider>
    }

    it('ShortIncidentDescription: it renders on valid incident', async () => {
      render(<RenderShortDescription incident={sampleIncident}/>)
      // eslint-disable-next-line max-len
      const expectedShortDesc = '802.11 Authentication failures are unusually high in Venue: Venue-3-US'
      await screen.findByText(expectedShortDesc)
      expect(screen.getByText(expectedShortDesc).textContent).toBe(expectedShortDesc)
    })
  })

  describe('filterMutedIncidents', () => {
    it('should filter child & parent muted incidents', () => {
      const sampleIncidents =
        incidentTests.map(incident => transformData(incident as unknown as Incident))
      const unmutedIncidents = sampleIncidents
        .filter(incident => !incident.isMuted)
        .map(datum => ({
          ...datum,
          // eslint-disable-next-line testing-library/no-node-access
          children: datum.children?.filter(child => !child.isMuted)
        }))

      const filteredIncidents = filterMutedIncidents(sampleIncidents)
      expect(filteredIncidents).toHaveLength(unmutedIncidents.length)
    })

    it('should return empty table on undefined', () => {
      const undefinedTest = filterMutedIncidents()
      expect(undefinedTest).toMatchObject([])
    })
  })
})
