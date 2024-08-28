/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

import { get }                                      from '@acx-ui/config'
import { recommendationUrl, Provider }              from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, within } from '@acx-ui/test-utils'

import { useIntentContext }                   from '../../IntentContext'
import { transformDetailsResponse }           from '../../useIntentDetailsQuery'
import { mockedCRRMGraphs, mockedIntentCRRM } from '../__tests__/fixtures'
import { kpis }                               from '../common'

import { IntentAIForm } from '.'

class ResizeObserver {
  observe () {}
  unobserve () {}
  disconnect () {}
}

jest.mock('../../IntentContext')

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('IntentAIForm', () => {
  beforeEach(() => {
    mockGraphqlQuery(recommendationUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphs }
    })
    jest.spyOn(require('../../utils'), 'isDataRetained')
      .mockImplementation(() => true)
    jest.mocked(useIntentContext)
      .mockReturnValue({ intent: transformDetailsResponse(mockedIntentCRRM), kpis })
  })
  window.ResizeObserver = ResizeObserver

  async function renderAndStepsThruForm () {
    const params = { recommendationId: mockedIntentCRRM.id, code: mockedIntentCRRM.code }
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    const hiddenGraph = await screen.findByTestId('hidden-graph')
    expect(hiddenGraph).toBeInTheDocument()
    expect(await screen.findByText('Benefits')).toBeVisible()
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    await screen.findAllByRole('heading', { name: 'Intent Priority' })
    expect(await screen.findByText('Potential trade-off?')).toBeVisible()
    const throughputRadio = screen.getByRole('radio', {
      name: 'High client throughput in sparse network'
    })
    await userEvent.click(throughputRadio)
    expect(throughputRadio).toBeChecked()
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    await screen.findAllByRole('heading', { name: 'Settings' })
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    await screen.findAllByRole('heading', { name: 'Summary' })
    expect(screen.getByRole('button', {
      name: 'Apply'
    })).toBeVisible()
  }

  it('should render correctly', () => renderAndStepsThruForm())

  it('should render correctly when IS_MLISA_SA is true', async () => {
    mockGet.mockReturnValue('true')
    await renderAndStepsThruForm()
  })
})
