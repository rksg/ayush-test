import moment from 'moment-timezone'

import { render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'

import {
  mockRecommendationNoKPI,
  mockedRecommendationPower,
  mockedRecommendationFirmware,
  mockedRecommendationClientLoad,
  mockedRecommendationPowerMonitoring
} from './__tests__/fixtures'
import { Kpis }                                            from './kpis'
import { RecommendationDetails, transformDetailsResponse } from './services'

jest.mock('./statusTrail', () => ({
  StatusTrail: () => <div data-testid='statustrail'>Status Trail</div>
}))

describe('Recommendation Kpis', () => {
  it('should render correctly for power', async () => {
    const powerDetails = transformDetailsResponse(mockedRecommendationPower)
    render(<Kpis details={powerDetails} />)
    expect(await screen.findByTestId('statustrail')).toBeInTheDocument()
    expect(await screen.findByText('Session time on 2.4 GHz')).toBeVisible()
    expect(await screen.findByText('2.21%')).toBeVisible()
  })

  it('should render correctly for client load', async () => {
    const clientLoadDetails = transformDetailsResponse(mockedRecommendationClientLoad)
    render(<Kpis details={clientLoadDetails} />)
    expect(await screen.findByTestId('statustrail')).toBeInTheDocument()
    expect(await screen.findByText('Average AP Unique Clients')).toBeVisible()
    expect(await screen.findByText('10')).toBeVisible()
    expect(await screen.findByText('Max AP Unique Clients')).toBeVisible()
    expect(await screen.findByText('22')).toBeVisible()
  })

  it('should render correctly for with negative delta', async () => {
    const clientLoadDetails = transformDetailsResponse({
      ...mockedRecommendationPower,
      kpi_session_time_on_24_g_hz: {
        current: 0.20,
        previous: 0.55,
        projected: null
      }
    } as unknown as RecommendationDetails)
    render(<Kpis details={clientLoadDetails} />)
    expect(await screen.findByTestId('statustrail')).toBeInTheDocument()
    expect(await screen.findByText('Session time on 2.4 GHz')).toBeVisible()
    expect(await screen.findByText('20%')).toBeVisible()
    expect(await screen.findByText('-35%')).toBeVisible()
  })

  it('should render correctly for with positive delta', async () => {
    const clientLoadDetails = transformDetailsResponse({
      ...mockedRecommendationPower,
      kpi_session_time_on_24_g_hz: {
        current: 0.55,
        previous: 0.20,
        projected: null
      }
    } as unknown as RecommendationDetails)
    render(<Kpis details={clientLoadDetails} />)
    expect(await screen.findByTestId('statustrail')).toBeInTheDocument()
    expect(await screen.findByText('Session time on 2.4 GHz')).toBeVisible()
    expect(await screen.findByText('55%')).toBeVisible()
    expect(await screen.findByText('+35%')).toBeVisible()
  })

  it('should render correctly for with non-number delta', async () => {
    const clientLoadDetails = transformDetailsResponse({
      ...mockedRecommendationPower,
      kpi_session_time_on_24_g_hz: {
        current: 0.55,
        previous: undefined,
        projected: null
      }
    } as unknown as RecommendationDetails)
    render(<Kpis details={clientLoadDetails} />)
    expect(await screen.findByTestId('statustrail')).toBeInTheDocument()
    expect(await screen.findByText('Session time on 2.4 GHz')).toBeVisible()
    expect(await screen.findByText('55%')).toBeVisible()
  })

  it('should render correctly for kpis with tooltip', async () => {
    const firmwareDetails = transformDetailsResponse({
      ...mockedRecommendationFirmware,
      kpi_aps_on_latest_fw_version: {
        current: [4, 5],
        previous: [1, 5],
        projected: null
      }
    } as unknown as RecommendationDetails)
    render(<Kpis details={firmwareDetails} />)
    expect(await screen.findByTestId('statustrail')).toBeInTheDocument()
    expect(await screen.findByText('APs on Latest Firmware Version')).toBeVisible()
    expect(await screen.findByText('=')).toBeVisible()
    const infoIcons = await screen.findAllByTestId('InformationSolid')
    expect(infoIcons).toHaveLength(1)
    fireEvent.mouseOver(infoIcons[0])
    await waitFor(async () => {
      const tooltip = screen.queryByText('Numbers could be delayed by up to 1 hour.')
      expect(tooltip).toBeInTheDocument()
    })
  })

  it('should render correctly for monitoring', async () => {
    const powerDetails = transformDetailsResponse({
      ...mockedRecommendationPowerMonitoring,
      appliedTime: moment().toISOString()
    } as unknown as RecommendationDetails)
    render(<Kpis details={powerDetails} />)
    expect(await screen.findByText(/monitoring performance indicators*/i)).toBeVisible()
  })

  it('should render for no kpi', async () => {
    const noKpiDetails = transformDetailsResponse(mockRecommendationNoKPI)
    render(<Kpis details={noKpiDetails} />)
    expect(await screen.findByText('No performance indicators')).toBeVisible()
  })
})