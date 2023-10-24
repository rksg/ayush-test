import userEvent from '@testing-library/user-event'

import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import {
  mockedRecommendationPower,
  mockedRecommendationFirmware,
  mockRecommendationAutoBackground,
  mockRecommendationNoKPI
} from './__tests__/fixtures'
import { RecommendationDetails, transformDetailsResponse } from './services'
import { Values }                                          from './Values'

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
