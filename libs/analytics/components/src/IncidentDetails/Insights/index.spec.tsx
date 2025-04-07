import { BrowserRouter } from 'react-router-dom'

import { fakeIncident }   from '@acx-ui/analytics/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { Insights } from '.'

describe('Insights Component', () => {
  it('should render correctly', () => {
    const sampleIncident = fakeIncident({
      apCount: -1,
      isMuted: false,
      mutedBy: null,
      slaThreshold: null,
      clientCount: 27,
      path: [
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
    })

    const { asFragment } = render(
      <Provider>
        <Insights incident={sampleIncident} />
      </Provider>
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly for airtime incident', async () => {
    const airtimeIncident = fakeIncident({
      apCount: 3,
      isMuted: false,
      mutedBy: null,
      slaThreshold: null,
      clientCount: 0,
      path: [
        {
          type: 'system',
          name: 'Gurus-Cluster8'
        },
        {
          type: 'zone',
          name: 'R760-Mesh'
        }
      ],
      endTime: '2022-08-20T02:42:00.000Z',
      vlanCount: -1,
      sliceType: 'zone',
      code: 'p-airtime-rx-24g-high',
      startTime: '2022-08-19T05:15:00.000Z',
      metadata: {
        avgAnomalousAirtime: 61.04027777777778,
        rootCauseChecks: {
          checks: [
            { isHighDensityWifiDevices: true },
            { isAclbRaised: true },
            { isLargeMgmtFrameCount: false },
            { isHighSsidCountPerRadio: false },
            { isHighCoChannelInterference: false },
            { isCRRMRaised: false },
            { isChannelFlyEnabled: false },
            { isHighLegacyWifiDevicesCount: false }
          ],
          params: {
            aclb: {
              code: 'c-aclb-enable',
              root: '6f931c53-21eb-4727-b2ad-e23b43d98846',
              sliceId: 'dff976ca-a4ea-4f6c-ab63-cb8e4a886df6',
              intentId: '49033f10-eeae-4318-bae2-5cf52ebc0319'
            }
          }
        }
      },
      id: 'b6269b9b-d102-4f21-925c-70e2537b12f4',
      impactedApCount: 2,
      switchCount: -1,
      currentSlaThreshold: null,
      severity: 0.9,
      connectedPowerDeviceCount: -1,
      mutedAt: null,
      impactedClientCount: 0,
      sliceValue: 'RuckusAP'
    })

    render(
      <BrowserRouter>
        <Provider>
          <Insights incident={airtimeIncident} />
        </Provider>
      </BrowserRouter>
    )
    expect(screen.getByText(
      'Based on the root cause identified, the recommended resolution is:')).toBeVisible()
    const link = screen.getByRole('link', {
      name: /Explore more/i
    })
    // eslint-disable-next-line max-len
    expect(link).toHaveAttribute('href', '/undefined/t/intentAI?intentTableFilters=%7B%22aiFeature%22%3A%5B%22AI+Operations%22%5D%2C%22intent%22%3A%5B%22Distributed+Wi-Fi+Load+vs+Client+Stability%22%5D%2C%22category%22%3A%5B%22Wi-Fi+Experience%22%5D%2C%22sliceValue%22%3A%5B%22dff976ca-a4ea-4f6c-ab63-cb8e4a886df6%22%5D%7D')
  })
})
