/* eslint-disable max-len */
import userEvent        from '@testing-library/user-event'
import { pick }         from 'lodash'
import  { MomentInput } from 'moment-timezone'

import { get }                                                           from '@acx-ui/config'
import { recommendationUrl, Provider, intentAIUrl }                      from '@acx-ui/store'
import { mockGraphqlMutation, mockGraphqlQuery, render, screen, within } from '@acx-ui/test-utils'

import { mockedCRRMGraphs, mockedIntentCRRM } from '../../IntentAIDetails/__tests__/fixtures'

import { AIDrivenRRM, isOptimized } from '.'

const { click, selectOptions } = userEvent

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6'
  })
}))

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

jest.mock('moment-timezone', () => {
  const moment = jest.requireActual<typeof import('moment-timezone')>('moment-timezone')
  const mockedMoment = (date: MomentInput) => date === '2023-07-13T00:00:00.000Z'
    ? moment(date)
    : moment('07-10-2023 14:15', 'MM-DD-YYYY HH:mm') // mock current date
  mockedMoment.utc = moment.utc
  return {
    __esModule: true,
    ...moment,
    default: mockedMoment
  }
})

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
    const resp = { transition: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(intentAIUrl, 'TransitionMutation', { data: resp })

    // add mockGraphqlQuery for intentAi url
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


    // Step 3
    await click(actions.getByRole('button', { name: 'Next' }))
    await screen.findAllByRole('heading', { name: 'Settings' })
    expect(screen.getAllByRole('heading', { name: 'Settings' })[0]).toBeVisible()
    // expect(await formBody.findByText('Schedule Date')).toBeVisible()
    expect(await formBody.findByText('Schedule Time')).toBeVisible()
    expect(await formBody.findByText('Side Notes')).toBeVisible()


    // const datePicker = await formBody.findByTitle('2023-07-10')
    // const datePicker = await formBody.findByTestId('selectDate')
    // expect(datePicker).toBeVisible()
    // expect(datePicker).toHaveValue('')
    // await userEvent.click(datePicker)
    // // await userEvent.type(datePicker, '2023-07-13')
    // expect(datePicker).toHaveValue('2023-07-10')

    // await userEvent.click(actions.getByRole('button', { name: 'Next' }))
    // expect(await formBody.findByText('Please enter date')).toBeVisible()

    // await userEvent.click(datePicker)

    const timePicker = screen.getByPlaceholderText('Select hour')
    expect(timePicker).toBeInTheDocument()

    // await click(actions.getByRole('button', { name: 'Next' }))
    // expect(await formBody.findByText('Please enter hour')).toBeVisible()

    expect(await formBody.findByText('Side Notes')).toBeVisible()
    // await selectOptions(await formBody.findByRole('combobox'), '20:15 (UTC+00)')
    await selectOptions(
      await formBody.findByRole('combobox'),
      await formBody.findByRole('option', { name: '20:15 (UTC+00)' })
    )

    expect(await formBody.findByText('Side Notes')).toBeVisible()
    // expect(screen.getByText('14:00 (UTC+00)')).toBeDisabled()
    // expect(screen.getByText('00:00 (UTC+00)')).toBeDisabled()
    // expect(screen.getByText('14:15 (UTC+00)')).not.toBeDisabled()


    // Step 4
    await click(actions.getByRole('button', { name: 'Next' }))
    // await formBody.findByText('Side Notes')
    expect(await screen.findByText('Projected interfering links reduction')).toBeVisible()
    await screen.findAllByRole('heading', { name: 'Summary' })
    expect(screen.getAllByRole('heading', { name: 'Summary' })[0]).toBeVisible()

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