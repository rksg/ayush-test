import { dataApiRecommendationURL, Provider }          from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, fireEvent } from '@acx-ui/test-utils'

import {
  mockedRecommendationCRRM,
  mockedRecommendationFirmware,
  mockedRecommendationApFirmware,
  mockedRecommendationClientLoad
} from './__fixtures__'
import { Overview }                 from './overview'
import { transformDetailsResponse } from './services'

describe('Recommendation Overview', () => {
  it('should render correctly for firmware', async () => {
    const firmwareDetails = transformDetailsResponse(mockedRecommendationFirmware)
    mockGraphqlQuery(dataApiRecommendationURL, 'GetAps', {
      data: {
        recommendation: {
          APs: mockedRecommendationApFirmware
        }
      }
    })
    render(<Overview details={firmwareDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Priority')).toBeVisible()
    expect(await screen.findByText('Medium')).toBeVisible()
    expect(await screen.findByText('AP Impact Count')).toBeVisible()
    expect(await screen.findByText('3 of 3 APs (100 %)')).toBeVisible()
    expect(await screen.findByText('Category')).toBeVisible()
    expect(await screen.findByText('Infrastructure')).toBeVisible()
    expect(await screen.findByText('Venue')).toBeVisible()
    expect(await screen.findByText('39-IND-BDC-D39-Mayank-Ofc-Z2')).toBeVisible()
    expect(await screen.findByText('Status')).toBeVisible()
    expect(await screen.findByText('New')).toBeVisible()
  })

  it('should render correctly for firmware drawer', async () => {
    const firmwareDetails = transformDetailsResponse(mockedRecommendationFirmware)
    mockGraphqlQuery(dataApiRecommendationURL, 'GetAps', {
      data: {
        recommendation: {
          APs: mockedRecommendationApFirmware
        }
      }
    })
    render(<Overview details={firmwareDetails} />, { wrapper: Provider })
    const affectedAps = await screen.findByText('3 of 3 APs (100 %)')
    fireEvent.click(affectedAps)
    expect(await screen.findByText('3 Impacted APs')).toBeVisible()
    expect(await screen.findByText('B4:79:C8:3E:7E:50')).toBeVisible()
    expect(await screen.findByText('28:B3:71:27:38:E0')).toBeVisible()
    expect(await screen.findByText('C8:84:8C:3E:46:B0')).toBeVisible()
    fireEvent.click(await screen.findByRole('button', { name: 'Close' }))
    expect(screen.queryByText('3 Impacted APs')).not.toBeInTheDocument()
  })

  it('should render correctly for crrm', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRM)
    render(<Overview details={crrmDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Priority')).toBeVisible()
    expect(await screen.findByText('High')).toBeVisible()
    expect(await screen.findByText('Category')).toBeVisible()
    expect(await screen.findByText('AI-Driven Cloud RRM')).toBeVisible()
    expect(await screen.findByText('Venue')).toBeVisible()
    expect(await screen.findByText('21_US_Beta_Samsung')).toBeVisible()
    expect(await screen.findByText('Status')).toBeVisible()
    expect(await screen.findByText('Applied')).toBeVisible()
  })

  it('should render correctly for low priority (client load)', async () => {
    const clientDetails = transformDetailsResponse(mockedRecommendationClientLoad)
    render(<Overview details={clientDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Priority')).toBeVisible()
    expect(await screen.findByText('Low')).toBeVisible()
    expect(await screen.findByText('Category')).toBeVisible()
    expect(await screen.findByText('Wi-Fi Client Experience')).toBeVisible()
    expect(await screen.findByText('Venue')).toBeVisible()
    expect(await screen.findByText('Fong@Home')).toBeVisible()
    expect(await screen.findByText('Status')).toBeVisible()
    expect(await screen.findByText('New')).toBeVisible()
  })
})