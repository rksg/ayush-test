/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

import { get }                                                                       from '@acx-ui/config'
import { recommendationUrl, Provider, intentAIUrl, recommendationApi, store }        from '@acx-ui/store'
import {  fireEvent, mockGraphqlMutation, mockGraphqlQuery, render, screen, within } from '@acx-ui/test-utils'

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
    store.dispatch(recommendationApi.util.resetApiState())
    mockGraphqlQuery(recommendationUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphs }
    })
    const resp = { transition: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(intentAIUrl, 'TransitionMutation', { data: resp })

    // add mockGraphqlQuery for intentAi url
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
    const formBody = within(form.getByTestId('steps-form-body'))

    const hiddenGraph = await screen.findByTestId('hidden-graph')
    expect(hiddenGraph).toBeInTheDocument()
    expect(await screen.findByText('Benefits')).toBeVisible()


    // Step 2
    await click(actions.getByRole('button', { name: 'Next' }))
    await screen.findAllByRole('heading', { name: 'Intent Priority' })
    expect(await screen.findByText('Potential trade-off?')).toBeVisible()
    const throughputRadio = screen.getByRole('radio', {
      name: 'High client throughput in sparse network'
    })
    await click(throughputRadio)
    expect(throughputRadio).toBeChecked()

    async function renderSettingsAndSummaryForActiveStates () {
      // Step 3
      await click(actions.getByRole('button', { name: 'Next' }))
      await screen.findAllByRole('heading', { name: 'Settings' })
      expect(screen.getAllByRole('heading', { name: 'Settings' })[0]).toBeVisible()
      expect(await formBody.findByText('Schedule Time')).toBeVisible()
      expect(await formBody.findByText('Side Notes')).toBeVisible()

      const timePicker = screen.getByPlaceholderText('Select hour')
      expect(timePicker).toBeInTheDocument()
      await selectOptions(await formBody.findByRole('combobox'), '10:15 (UTC+00)')

      // Step 4
      await click(actions.getByRole('button', { name: 'Next' }))
      await screen.findAllByRole('heading', { name: 'Summary' })
      expect(screen.getAllByRole('heading', { name: 'Summary' })[0]).toBeVisible()

      expect(await screen.findByText('Projected interfering links reduction')).toBeVisible()
      expect(await screen.findByText('Interfering links')).toBeVisible()
      expect(await screen.findByText('Schedule')).toBeVisible()
      expect(await screen.findByText('2023-07-15T10:15:00+00:00')).toBeVisible()

      expect(screen.getByRole('button', {
        name: 'Apply'
      })).toBeVisible()
    }


    async function renderSettingsAndSummary () {
      // Step 3
      await click(actions.getByRole('button', { name: 'Next' }))
      await screen.findAllByRole('heading', { name: 'Settings' })
      expect(screen.getAllByRole('heading', { name: 'Settings' })[0]).toBeVisible()
      expect(await formBody.findByText('Schedule Date')).toBeVisible()
      expect(await formBody.findByText('Schedule Time')).toBeVisible()
      expect(await formBody.findByText('Side Notes')).toBeVisible()

      const datepicker = screen.getByRole('img', { name: 'calendar' })
      expect(datepicker).toBeEnabled()
      await userEvent.click(datepicker)

      const datepickerInput = screen.getByPlaceholderText('Select date')
      fireEvent.change(datepickerInput, { target: { value: '2023-07-16' } })
      await userEvent.click(screen.getByRole('cell', { name: '2023-07-16' }))


      const timePicker = screen.getByPlaceholderText('Select hour')
      expect(timePicker).toBeInTheDocument()
      await selectOptions(await formBody.findByRole('combobox'), '16:15 (UTC+00)')

      // Step 4
      await click(actions.getByRole('button', { name: 'Next' }))
      await screen.findAllByRole('heading', { name: 'Summary' })
      expect(screen.getAllByRole('heading', { name: 'Summary' })[0]).toBeVisible()

      expect(await screen.findByText('Projected interfering links reduction')).toBeVisible()
      expect(await screen.findByText('Interfering links')).toBeVisible()
      expect(await screen.findByText('Schedule')).toBeVisible()
      expect(await screen.findByText('2023-07-16T16:15:00+00:00')).toBeVisible()

      expect(screen.getByRole('button', {
        name: 'Apply'
      })).toBeVisible()
    }

    if  (status === 'new' || status === 'scheduled') {
      await renderSettingsAndSummary()
    } else {
      await renderSettingsAndSummaryForActiveStates()
    }
  }

  it('should render correctly', () => renderAndStepsThruForm())

  it('should render correctly when IS_MLISA_SA is true', async () => {
    mockGet.mockReturnValue('true')
    await renderAndStepsThruForm()
  })

})
