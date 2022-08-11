import { Incident } from '@acx-ui/analytics/utils'
import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'


import { Insights } from '.'

describe('Insights Component', () => {
  it('should render correctly', () => {
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
      code: 'auth-failure',
      startTime: '2022-07-19T05:15:00.000Z',
      metadata: {
        dominant: {},
        rootCauseChecks: {
          checks: [
            {
              AP_MODEL: false,
              FW_VERSION: true,
              CLIENT_OS_MFG: false,
              CCD_REASON_AUTH_FT_ROAM_FAILURE: true
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

    const { asFragment } = render(
      <Provider>
        <Insights {...sampleIncident} />
      </Provider>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})