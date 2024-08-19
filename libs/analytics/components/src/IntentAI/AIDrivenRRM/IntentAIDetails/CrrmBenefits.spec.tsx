import { render,screen } from '@acx-ui/test-utils'

import { transformDetailsResponse } from '../../IntentAIForm/services'
import { useIntentContext }         from '../../IntentContext'
import { kpis }                     from '../common'

import { mockedIntentCRRM } from './__tests__/fixtures'
import { CrrmBenefits }     from './CrrmBenefits'

jest.mock('../../IntentContext')

describe('CrrmBenefits', () => {
  beforeEach(() => {
    const intent = transformDetailsResponse(mockedIntentCRRM)
    jest.mocked(useIntentContext).mockReturnValue({ intent, kpis })
  })
  it('should render correctly', async () => {
    jest.spyOn(require('../../utils'), 'isDataRetained').mockImplementation(() => true)
    render(<CrrmBenefits />)

    expect(await screen.findByText('Benefits')).toBeVisible()
    expect(await screen.findByText('Interfering links')).toBeVisible()
    expect(await screen.findByText('-100%')).toBeVisible()
  })
  it('should handle when beyond data retention', async () => {
    jest.spyOn(require('../../utils'), 'isDataRetained').mockImplementation(() => false)
    render(<CrrmBenefits />)
    expect(await screen.findByText('Benefits')).toBeVisible()
    expect(await screen.findByText('Beyond data retention period')).toBeVisible()
  })
})
