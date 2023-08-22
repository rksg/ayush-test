import { get }                                                  from '@acx-ui/config'
import { recommendationUrl, Provider }                          from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, fireEvent, waitFor } from '@acx-ui/test-utils'

import {
  mockedRecommendationCRRM,
  mockedRecommendationFirmware,
  mockedRecommendationApFirmware,
  mockedRecommendationClientLoad
} from './__tests__/fixtures'
import { Overview }                 from './overview'
import { transformDetailsResponse } from './services'

const mockGet = get as jest.Mock

jest.mock('@acx-ui/config', () => ({
  ...jest.requireActual('@acx-ui/config'),
  get: jest.fn()
}))

describe('Recommendation Overview', () => {
  beforeEach(() => mockGet.mockClear())
  afterAll(() => mockGet.mockReset())
  it('should render correctly for firmware in R1', async () => {
    const firmwareDetails = transformDetailsResponse(mockedRecommendationFirmware)
    mockGraphqlQuery(recommendationUrl, 'GetAps', {
      data: {
        recommendation: {
          APs: mockedRecommendationApFirmware
        }
      }
    })
    mockGet.mockReturnValue(false)
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
    expect(await screen.findByText('Date')).toBeVisible()
    expect(await screen.findByText('06/12/2023 07:05')).toBeVisible()
  })

  it('should render correctly for firmware in RA SA', async () => {
    const firmwareDetails = transformDetailsResponse(mockedRecommendationFirmware)
    mockGraphqlQuery(recommendationUrl, 'GetAps', {
      data: {
        recommendation: {
          APs: mockedRecommendationApFirmware
        }
      }
    })
    mockGet.mockReturnValue(true)
    render(<Overview details={firmwareDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Priority')).toBeVisible()
    expect(await screen.findByText('Medium')).toBeVisible()
    expect(await screen.findByText('AP Impact Count')).toBeVisible()
    expect(await screen.findByText('3 of 3 APs (100 %)')).toBeVisible()
    expect(await screen.findByText('Category')).toBeVisible()
    expect(await screen.findByText('Infrastructure')).toBeVisible()
    expect(await screen.findByText('Zone')).toBeVisible()
    expect(await screen.findByText('39-IND-BDC-D39-Mayank-Ofc-Z2')).toBeVisible()
    expect(await screen.findByText('Status')).toBeVisible()
    expect(await screen.findByText('New')).toBeVisible()
    expect(await screen.findByText('Date')).toBeVisible()
    expect(await screen.findByText('06/12/2023 07:05')).toBeVisible()
  })

  it('should render correctly for firmware drawer', async () => {
    const firmwareDetails = transformDetailsResponse(mockedRecommendationFirmware)
    mockGraphqlQuery(recommendationUrl, 'GetAps', {
      data: {
        recommendation: {
          APs: mockedRecommendationApFirmware
        }
      }
    })
    mockGet.mockReturnValue(false)
    render(<Overview details={firmwareDetails} />, { wrapper: Provider })
    const affectedAps = await screen.findByText('3 of 3 APs (100 %)')
    fireEvent.click(affectedAps)
    const tableTitle = await screen.findByText('3 Impacted APs')
    expect(tableTitle).toBeVisible()
    expect(await screen.findByText('B4:79:C8:3E:7E:50')).toBeVisible()
    expect(await screen.findByText('28:B3:71:27:38:E0')).toBeVisible()
    expect(await screen.findByText('C8:84:8C:3E:46:B0')).toBeVisible()
    const closeButton = screen.queryByRole('button', { name: 'Close' })
    expect(closeButton).not.toBeNull()
    fireEvent.click(closeButton!)
    await waitFor(async () => {
      expect(screen.queryByText('3 Impacted APs')).not.toBeVisible()
    })
  })

  it('should render correctly for crrm', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRM)
    mockGet.mockReturnValue(false)
    render(<Overview details={crrmDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Zone RRM')).toBeVisible()
    expect(await screen.findByText('Optimized')).toBeVisible()
    expect(screen.queryByText('Category')).toBeNull()
    expect(screen.queryByText('AI-Driven Cloud RRM')).toBeNull()
    expect(await screen.findByText('Summary')).toBeVisible()
    expect(await screen.findByText('Status')).toBeVisible()
    expect(await screen.findByText('Scheduled')).toBeVisible()
    expect(await screen.findByText('Date')).toBeVisible()
    expect(await screen.findByText('06/26/2023 06:04')).toBeVisible()
  })

  it('should render correctly for low priority (client load)', async () => {
    const clientDetails = transformDetailsResponse(mockedRecommendationClientLoad)
    mockGet.mockReturnValue(false)
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