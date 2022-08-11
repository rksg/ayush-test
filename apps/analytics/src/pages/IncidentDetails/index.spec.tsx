import { dataApiURL }         from '@acx-ui/analytics/services'
import { Incident }           from '@acx-ui/analytics/utils'
import { Provider, store }    from '@acx-ui/store'
import {
  render,
  screen,
  mockGraphqlQuery,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { api } from './services'

import IncidentDetailsPage from '.'

jest.mock('../IncidentDetails/IncidentAttributes', () => ({
  IncidentAttributes: () => <div data-testid='incidentAttributes' />
}))

describe('incident details', () => {
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

  beforeEach(() => store.dispatch(api.util.resetApiState()))

  it('should render Incident Details Page correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentDetails', { data: { incident: sampleIncident } } )
    const params = {
      incidentId: sampleIncident.id
    }
    const { asFragment } = render(<Provider>
      <IncidentDetailsPage />
    </Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    expect(asFragment()).toMatchSnapshot()
  })
})
