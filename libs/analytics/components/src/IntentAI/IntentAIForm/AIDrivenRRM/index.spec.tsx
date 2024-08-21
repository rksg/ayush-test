/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { pick }  from 'lodash'

import { get }                                                                       from '@acx-ui/config'
import { recommendationUrl, Provider, intentAIUrl, recommendationApi, store }        from '@acx-ui/store'
import {  fireEvent, mockGraphqlMutation, mockGraphqlQuery, render, screen, within } from '@acx-ui/test-utils'

import { mockedCRRMGraphs, mockedIntentCRRM } from '../../IntentAIDetails/__tests__/fixtures'

import { AIDrivenRRM, isOptimized } from '.'

const { click, selectOptions } = userEvent

type MockSelectProps = React.PropsWithChildren<{
  showSearch: boolean
  onChange?: (value: string) => void
}>

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    showSearch, // remove and left unassigned to prevent warning
    ...props
  }: MockSelectProps) => {
    return (<select {...props} onChange={(e) => props.onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>)
  }
  Select.Option = 'option'
  Select.OptGroup = 'optgroup'
  return { ...components, Select }
})

jest.mock('dayjs', () => {
  const actualDayjs = jest.requireActual('dayjs')
  return jest.fn(() => ({
    ...actualDayjs(),
    startOf: jest.fn((unit) => {
      if (unit === 'day') {
        return actualDayjs('2023-07-10T14:15:00')
      }
      return actualDayjs().startOf(unit)
    })
  }))
})

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('AIDrivenRRM', () => {
  beforeEach(() => {
    store.dispatch(recommendationApi.util.resetApiState())
    jest.spyOn(Date,'now').mockReturnValue(+new Date('2023-07-10T14:15:00'))
    mockGraphqlQuery(recommendationUrl, 'IntentCode', {
      data: { intent: pick(mockedIntentCRRM, ['id', 'code']) }
    })

    mockGraphqlQuery(recommendationUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphs }
    })
    const resp = { transition: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(intentAIUrl, 'TransitionMutation', { data: resp })

    // add mockGraphqlQuery for intentAi url
    jest.spyOn(require('../../utils'), 'isDataRetained')
      .mockImplementation(() => true)
  })




  async function renderAndStepsThruForm (status?:string, metadata?: { scheduledAt?:string }) {

    mockGraphqlQuery(recommendationUrl, 'IntentDetails', {
      data: { intent:
        {
          ...mockedIntentCRRM,
          status: status ?? mockedIntentCRRM.status,
          metadata: metadata ?? mockedIntentCRRM.metadata
        }
      }
    })

    render(<AIDrivenRRM />, {
      route: { params: { recommendationId: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6' } },
      wrapper: Provider
    })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))
    const formBody = within(form.getByTestId('steps-form-body'))

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

  it('should render correctly for new/scheduled states', async () => {
    await renderAndStepsThruForm('new', {})
  })

  it('should render correctly for non (new/scheduled) active states', async () => {
    await renderAndStepsThruForm()
  })

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