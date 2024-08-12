/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { pick }  from 'lodash'

import { get }                                      from '@acx-ui/config'
import { recommendationUrl, Provider }              from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, within } from '@acx-ui/test-utils'

import { mockedCRRMGraphs, mockedIntentCRRM } from '../../IntentAIDetails/__tests__/fixtures'

import { AIDrivenRRM, isOptimized } from '.'


const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('AIDrivenRRM', () => {
  beforeEach(() => {
    mockGraphqlQuery(recommendationUrl, 'IntentCode', {
      data: { intent: pick(mockedIntentCRRM, ['id', 'code']) }
    })
    mockGraphqlQuery(recommendationUrl, 'IntentDetails', {
      data: { intent: mockedIntentCRRM }
    })
    mockGraphqlQuery(recommendationUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphs }
    })
    jest.spyOn(require('../../utils'), 'isDataRetained')
      .mockImplementation(() => true)
  })

  async function renderAndStepsThruForm () {
    render(<AIDrivenRRM />, {
      route: { params: { recommendationId: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6' } },
      wrapper: Provider
    })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

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

  it('should render correctly', renderAndStepsThruForm)

  it('should render correctly when IS_MLISA_SA is true', async () => {
    mockGet.mockReturnValue('true')
    await renderAndStepsThruForm()
  })
})

describe('isOptimized', () => {
  it('should return full when value is true', () => {
    expect(isOptimized(true)).toBe('full')
  })

  it('should return partial when value is false', () => {
    expect(isOptimized(false)).toBe('partial')
  })
})
