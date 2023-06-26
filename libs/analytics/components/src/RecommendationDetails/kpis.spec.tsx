import { render, screen } from '@acx-ui/test-utils'

import {
  mockRecommendationNoKPI,
  mockedRecommendationPower,
  mockedRecommendationClientLoad,
  mockedRecommendationPowerMonitoring
} from './__fixtures__'
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

  it('should render correctly for with load delta', async () => {
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

  it('should render correctly for monitoring', async () => {
    const powerDetails = transformDetailsResponse(mockedRecommendationPowerMonitoring)
    render(<Kpis details={powerDetails} />)
    expect(await screen.findByText(/monitoring performance indicators*/i)).toBeVisible()
  })

  it('should render for no kpi', async () => {
    const noKpiDetails = transformDetailsResponse(mockRecommendationNoKPI)
    render(<Kpis details={noKpiDetails} />)
    expect(await screen.findByText('No performance indicators')).toBeVisible()
  })
})