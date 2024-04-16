import userEvent       from '@testing-library/user-event'
import { MomentInput } from 'moment-timezone'

import { get }                     from '@acx-ui/config'
import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import {
  mockedRecommendationPower,
  mockedRecommendationFirmware,
  mockRecommendationAutoBackground,
  mockRecommendationNoKPI,
  mockedRecommendationCRRM,
  mockRecommendationProbeflexNew
} from './__tests__/fixtures'
import { RecommendationDetails, transformDetailsResponse } from './services'
import { getRecommendationsText, Values }                  from './Values'

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

jest.mock('moment-timezone', () => {
  const moment = jest.requireActual<typeof import('moment-timezone')>('moment-timezone')
  return {
    __esModule: true,
    ...moment,
    default: (date: MomentInput) => date
      ? moment(date)
      : moment('07-15-2023 14:15', 'MM-DD-YYYY HH:mm')
  }
})

describe('Recommendation Overview', () => {
  it('should render correctly for tx power', async () => {
    const powerDetails = transformDetailsResponse(mockedRecommendationPower)
    render(<Values details={powerDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Recommendation Details')).toBeVisible()
    expect(await screen.findByText('2.4 GHz TX Power Adjustment')).toBeVisible()
    expect(await screen.findByText('Full')).toBeVisible()
  })

  it('should render correctly for firmware', async () => {
    const powerDetails = transformDetailsResponse(mockedRecommendationFirmware)
    render(<Values details={powerDetails} />, { wrapper: Provider })
    const infoIcons = await screen.findAllByTestId('InformationSolid')
    expect(infoIcons).toHaveLength(1)
    await waitFor(async () => {
      await userEvent.hover(infoIcons[0])
      // eslint-disable-next-line max-len
      const tooltip = await screen.findByText('Latest available AP firmware version will be used when this recommendation is applied.')
      expect(tooltip).toBeInTheDocument()
    })
  })

  it('should render correctly for auto & background scan', async () => {
    const powerDetails = transformDetailsResponse(mockRecommendationAutoBackground)
    render(<Values details={powerDetails} />, { wrapper: Provider })
    const backgroundScan = await screen.findByText(/"Background Scanning*/i)
    expect(backgroundScan).toBeVisible()
  })

  it('should render correctly for auto & channel fly', async () => {
    const powerDetails = transformDetailsResponse({
      ...mockRecommendationAutoBackground,
      metadata: {
        channelSelectionMode: 'CHANNEL_FLY'
      }
    } as unknown as RecommendationDetails)
    render(<Values details={powerDetails} />, { wrapper: Provider })
    const backgroundScan = await screen.findByText(/"ChannelFly*/i)
    expect(backgroundScan).toBeVisible()
  })

  it('should render correctly for probeflex', async () => {
    const probeflexDetails = transformDetailsResponse(
      mockRecommendationProbeflexNew as unknown as RecommendationDetails)
    render(<Values details={probeflexDetails} />, { wrapper: Provider })
    const probeflex = await screen.findByText(/^AirFlexAI$/i)
    expect(probeflex).toBeVisible()
  })

  it('does not show config when null', async () => {
    const nullValuesDetails = transformDetailsResponse({
      ...mockRecommendationNoKPI,
      status: 'new',
      statusTrail: [
        { status: 'new', createdAt: '2021-10-27T06:02:06.973Z' }
      ],
      originalValue: null,
      currentValue: null,
      recommendedValue: true
    } as unknown as RecommendationDetails)
    render(<Values details={nullValuesDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Recommended Configuration')).toBeVisible()
    expect(screen.queryByText('Original Configuration')).not.toBeInTheDocument()
    expect(screen.queryByText('Current Configuration')).not.toBeInTheDocument()
  })

  it('shows config when false', async () => {
    const nullValuesDetails = transformDetailsResponse({
      ...mockRecommendationNoKPI,
      status: 'applied',
      statusTrail: [
        { status: 'applied', createdAt: '2021-10-27T10:36:01.934Z' },
        { status: 'applyscheduleinprogress', createdAt: '2021-10-27T10:35:01.934Z' },
        { status: 'applyscheduled', createdAt: '2021-10-27T08:35:01.934Z' },
        { status: 'new', createdAt: '2021-10-27T06:02:06.973Z' }
      ],
      originalValue: null,
      currentValue: false
    } as unknown as RecommendationDetails)
    render(<Values details={nullValuesDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Current Configuration')).toBeVisible()
    expect(screen.queryByText('Original Configuration')).not.toBeInTheDocument()
    expect(screen.queryByText('Recommended Configuration')).not.toBeInTheDocument()
  })
})

describe('getRecommendationsText', () => {
  beforeEach(() => jest.mocked(get).mockImplementation((name: string) => ({
    IS_MLISA_SA: '',
    DRUID_RETAIN_PERIOD_DAYS: '380'
  })[name] as string))
  it('should return correct values when optimized is false', () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRM)
    const result = getRecommendationsText(crrmDetails, false)
    // eslint-disable-next-line max-len
    expect(result.reasonText).toEqual('AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.')
    // eslint-disable-next-line max-len
    expect(result.tradeoffText).toEqual('AI-Driven Cloud RRM will be applied at the venue level, and all configurations (including static configurations) for channel and Auto Channel Selection will potentially be overwritten.')
  })
  it('should return correct values when optimized is true', () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRM)
    const result = getRecommendationsText(crrmDetails)
    // eslint-disable-next-line max-len
    expect(result.reasonText).toEqual('AI-Driven Cloud RRM will constantly monitor the network, and adjust the channel plan, bandwidth and AP transmit power when necessary to minimize co-channel interference. These changes, if any, will be indicated by the Key Performance Indicators. The number of interfering links may also fluctuate, depending on any changes in the network, configurations and/or rogue AP activities.')
  })
  it('should return correct values when data retention period passed', () => {
    const crrmDetails = transformDetailsResponse({
      ...mockedRecommendationCRRM, dataEndTime: '2021-05-17T07:04:11.663Z'
    } as RecommendationDetails)
    const result = getRecommendationsText(crrmDetails)
    // eslint-disable-next-line max-len
    expect(result.actionText).toEqual('Venue: 21_US_Beta_Samsung is experiencing high co-channel interference in 2.4 GHz band due to suboptimal channel planning. The channel plan, and potentially channel bandwidth and AP transmit power can be optimized by enabling AI-Driven Cloud RRM. This will help to improve the Wi-Fi end user experience. The initial optimization graph is no longer available below since the Venue recommendation details has crossed the standard RUCKUS data retention policy.')
  })
  it('should return correct values when data retention period passed for applied crrm', () => {
    const crrmDetails = transformDetailsResponse({
      ...mockedRecommendationCRRM, dataEndTime: '2021-05-17T07:04:11.663Z', status: 'applied'
    } as RecommendationDetails)
    const result = getRecommendationsText(crrmDetails)
    // eslint-disable-next-line max-len
    expect(result.actionText).toEqual('Venue: 21_US_Beta_Samsung had experienced high co-channel interference in 2.4 GHz band due to suboptimal channel planning as of 05/17/2023 07:04. The initial optimization graph is no longer available below since the Venue recommendation details has crossed the standard RUCKUS data retention policy. However your Venue configuration continues to be monitored and adjusted for further optimization.')
  })
  it('should return correct values when status is applied', () => {
    const crrmDetails = transformDetailsResponse({
      ...mockedRecommendationCRRM, status: 'applied' } as RecommendationDetails)
    const result = getRecommendationsText(crrmDetails)
    // eslint-disable-next-line max-len
    expect(result.actionText).toEqual('Venue: 21_US_Beta_Samsung had experienced high co-channel interference in 2.4 GHz band due to suboptimal channel planning as of 05/17/2023 07:04. The recommendation had been applied as of 06/25/2023 00:00 and interfering links have reduced. AI-Driven RRM will continue to monitor and adjust further everyday to continue to minimize co-channel interference.')
  })
})
