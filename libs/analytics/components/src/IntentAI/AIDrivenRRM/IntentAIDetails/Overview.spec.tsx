
import { get }             from '@acx-ui/config'
import { render, screen  } from '@acx-ui/test-utils'

import { transformDetailsResponse } from '../../IntentAIForm/services'
import { useIntentContext }         from '../../IntentContext'

import { mockedIntentCRRM } from './__tests__/fixtures'
import { Overview }         from './Overview'

jest.mock('@acx-ui/config')
jest.mock('../../IntentContext')

jest.mock('../RRMGraph/DownloadRRMComparison', () =>
  ({ DownloadRRMComparison: () => <div data-testid='download-button' /> }))

describe('Recommendation Overview', () => {
  beforeEach(() => {
    const intent = transformDetailsResponse(mockedIntentCRRM)
    jest.mocked(useIntentContext).mockReturnValue({ intent, kpis: [] })
  })

  it('should render correctly for crrm in R1', async () => {
    jest.mocked(get).mockReturnValue('')
    render(<Overview />)
    expect(await screen.findByText('Venue')).toBeVisible()
    expect(await screen.findByText('Category')).toBeVisible()
    expect(await screen.findByText('Status')).toBeVisible()
    expect(await screen.findByText('Date')).toBeVisible()
    expect(await screen.findByText('06/26/2023 06:04')).toBeVisible()
    expect(await screen.findByTestId('download-button')).toBeVisible()
  })

  it('should render correctly for crrm in RA', async () => {
    jest.mocked(get).mockReturnValue('true')
    render(<Overview />)
    expect(await screen.findByText('Zone')).toBeVisible()
    expect(await screen.findByText('Category')).toBeVisible()
    expect(await screen.findByText('Status')).toBeVisible()
    expect(await screen.findByText('Date')).toBeVisible()
    expect(await screen.findByText('06/26/2023 06:04')).toBeVisible()
    expect(await screen.findByTestId('download-button')).toBeVisible()
  })

})
