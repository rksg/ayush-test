
import { get }             from '@acx-ui/config'
import {  Provider }       from '@acx-ui/store'
import { render, screen  } from '@acx-ui/test-utils'


import { transformDetailsResponse } from '../../IntentAIForm/services'

import {
  mockedRecommendationCRRM
} from './__tests__/fixtures'
import { Overview } from './Overview'

const mockGet = get as jest.Mock

jest.mock('@acx-ui/config', () => ({
  ...jest.requireActual('@acx-ui/config'),
  get: jest.fn()
}))

jest.mock('../RRMGraph/DownloadRRMComparison', () =>
  ({ DownloadRRMComparison: () => <div data-testid='download-button' /> }))

describe('Recommendation Overview', () => {
  beforeEach(() => {
    mockGet.mockClear()
  })
  afterAll(() => mockGet.mockReset())

  it('should render correctly for crrm in R1', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRM)
    mockGet.mockReturnValue(false)
    render(<Overview details={crrmDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Venue')).toBeVisible()
    expect(await screen.findByText('Category')).toBeVisible()
    expect(await screen.findByText('Status')).toBeVisible()
    expect(await screen.findByText('Date')).toBeVisible()
    expect(await screen.findByText('06/26/2023 06:04')).toBeVisible()
  })

  it('should render correctly for crrm in RA', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRM)
    mockGet.mockReturnValue(true)
    render(<Overview details={crrmDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Zone')).toBeVisible()
    expect(await screen.findByText('Category')).toBeVisible()
    expect(await screen.findByText('Status')).toBeVisible()
    expect(await screen.findByText('Date')).toBeVisible()
    expect(await screen.findByText('06/26/2023 06:04')).toBeVisible()
    expect(await screen.findByTestId('download-button')).toBeVisible()
  })

})
