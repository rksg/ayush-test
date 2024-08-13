/* eslint-disable max-len */
import userEvent               from '@testing-library/user-event'
import { pick }                from 'lodash'
import moment, { MomentInput } from 'moment-timezone'

import { get }                                                           from '@acx-ui/config'
import { recommendationUrl, Provider, intentAIUrl }                      from '@acx-ui/store'
import { mockGraphqlMutation, mockGraphqlQuery, render, screen, within } from '@acx-ui/test-utils'

import { mockedRecommendationCRRM } from '../__tests__/fixtures'

import { AIDrivenRRM } from '.'

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
  return {
    __esModule: true,
    ...moment,
    default: (date: MomentInput) => date === '2023-07-13T00:00:00.000Z'
      ? moment(date)
      : moment('07-10-2023 14:15', 'MM-DD-YYYY HH:mm') // mock current date
  }
})

const mockInitialDate = moment()
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => {
    return {
      initialValues: {
        status: 'new',
        sliceValue: '21_US_Beta_Samsung',
        updatedAt: '2023-06-26T00:00:25.772Z',
        preferences: { crrmFullOptimization: true },
        id: 'id',
        settings: {
          date: null,
          hour: 8.5
        }

      },
      form: {
        getFieldValue: (value: string) => {
          if (value === 'status') {
            return 'new'
          }
          else if (value === 'settings') {
            return {
              date: mockInitialDate,
              hour: 0.5
            }
          }
          else {
            return 'applyscheduled'
          }
        },
        setFieldValue: jest.fn()
      }
    }
  } }))

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('AIDrivenRRM', () => {
  beforeEach(() => {
    mockGraphqlQuery(recommendationUrl, 'IntentCode', {
      data: { recommendation: pick(mockedRecommendationCRRM, ['id', 'code']) }
    })
    mockGraphqlQuery(recommendationUrl, 'IntentDetails', {
      data: { recommendation: mockedRecommendationCRRM }
    })
    const resp = { transition: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(intentAIUrl, 'TransitionMutation', { data: resp })

    // add mockGraphqlQuery for intentAi url
    jest.spyOn(require('../../utils'), 'isDataRetained')
      .mockImplementation(() => true)
  })

  it('should work correctly for statuses other than new/scheduled', async () => {

    const { asFragment } = render(<AIDrivenRRM />, {
      route: { path: '/ai/intentAi/b17acc0d-7c49-4989-adad-054c7f1fc5b6/c-crrm-channel24g-auto/edit' },
      wrapper: Provider
    })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByText('Benefits')).toBeVisible()


    // Step 2
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))
    await screen.findAllByRole('heading', { name: 'Intent Priority' })
    expect(await screen.findByText('Potential trade-off?')).toBeVisible()
    const throughputRadio = screen.getByRole('radio', {
      name: 'High client throughput in sparse network'
    })
    await userEvent.click(throughputRadio)
    expect(throughputRadio).toBeChecked()


    // Step 3
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))
    await screen.findAllByRole('heading', { name: 'Settings' })
    expect(screen.getAllByRole('heading', { name: 'Settings' })[0]).toBeVisible()

    const formBody = within(form.getByTestId('steps-form-body'))

    const dateInitialInput = await formBody.findByTitle('2023-07-10')
    expect(dateInitialInput).toBeVisible()
    expect(dateInitialInput).toHaveValue('2023-07-10')

    expect(screen.getByPlaceholderText('Select hour')).toBeInTheDocument()
    expect(screen.getByText('14:00 (UTC+00)')).toBeDisabled()
    expect(screen.getByText('00:00 (UTC+00)')).toBeDisabled()
    expect(screen.getByText('14:15 (UTC+00)')).not.toBeDisabled()


    // Step 4
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))
    // await screen.findByText('Summary')
    // await screen.findAllByRole('heading', { name: 'Summary' })
    // expect(screen.getAllByRole('heading', { name: 'Summary' })[0]).toBeVisible()

    // expect(screen.getByRole('button', {
    //   name: 'Apply'
    // })).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render correctly when IS_MLISA_SA is true', async () => {
    mockGet.mockReturnValue('true')
    const { asFragment } = render(<AIDrivenRRM />, {
      route: { path: '/ai/intentAi/b17acc0d-7c49-4989-adad-054c7f1fc5b6/c-crrm-channel24g-auto/edit' },
      wrapper: Provider
    })
    expect(asFragment()).toMatchSnapshot()
  })
})
