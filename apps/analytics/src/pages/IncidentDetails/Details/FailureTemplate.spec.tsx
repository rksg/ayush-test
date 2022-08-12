import { rest } from 'msw'

import { Incident }           from '@acx-ui/analytics/utils'
import { Provider }           from '@acx-ui/store'
import { render, mockServer } from '@acx-ui/test-utils'

import { IncidentDetailsTemplate } from './FailureTemplate'

jest.mock('../NetworkImpact', () => ({
  NetworkImpact: () => <div data-testid='networkImpact' />
}))

describe('IncidentDetailsTemplate', () => {
  const sampleIncident = {
    apCount: -1,
    isMuted: false,
    mutedBy: null,
    slaThreshold: null,
    clientCount: 27,
    path: [
      {
        type: 'system',
        name: 'Edu2-vSZ-52'
      },
      {
        type: 'zone',
        name: 'Edu2-611-Mesh'
      },
      {
        type: 'apGroup',
        name: '255_Edu2-611-group'
      },
      {
        type: 'ap',
        name: '70:CA:97:01:A0:C0'
      }
    ],
    endTime: '2022-07-20T02:42:00.000Z',
    vlanCount: -1,
    sliceType: 'ap',
    code: 'eap-failure',
    startTime: '2022-07-19T05:15:00.000Z',
    metadata: {
      dominant: {},
      rootCauseChecks: {
        checks: [
          {
            AP_MODEL: false,
            FW_VERSION: true,
            CLIENT_OS_MFG: false,
            CCD_REASON_DISASSOC_STA_HAS_LEFT: true
          }
        ],
        params: {
          FW_VERSION: '6.1.1.0.917'
        }
      }
    },
    id: 'df5339ba-da3b-4110-a291-7f8993a274f3',
    impactedApCount: -1,
    switchCount: -1,
    currentSlaThreshold: null,
    severity: 0.674055825227442,
    connectedPowerDeviceCount: -1,
    mutedAt: null,
    impactedClientCount: 5,
    sliceValue: 'RuckusAP'
  } as Incident

  it('should render correctly', () => {
    mockServer.use(
      rest.get(
        '/t/tenantId/analytics/incidents/:incidentId',
        (req, res, ctx) => {
          return res(ctx.json(sampleIncident))
        }
      )
    )

    const params = {
      incidentId: 'df5339ba-da3b-4110-a291-7f8993a274f3'
    }

    const { asFragment } = render(
      <Provider>
        <IncidentDetailsTemplate {...sampleIncident} />
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })
})
