/* eslint-disable max-len */
import userEvent               from '@testing-library/user-event'
import { DatePicker }          from 'antd'
import { pick }                from 'lodash'
import moment, { MomentInput } from 'moment-timezone'

import { get }                                                           from '@acx-ui/config'
import { recommendationUrl, Provider, intentAIUrl }                      from '@acx-ui/store'
import { mockGraphqlMutation, mockGraphqlQuery, render, screen, within } from '@acx-ui/test-utils'

import { mockedRecommendationCRRM } from '../__tests__/fixtures'

import { AIDrivenRRM } from '.'

const { click, type, selectOptions } = userEvent

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6'
  })
}))

// jest.mock('moment-timezone', () => {
//   const moment = jest.requireActual<typeof import('moment-timezone')>('moment-timezone')
//   return {
//     __esModule: true,
//     ...moment,
//     default: (date: MomentInput) => date === '2023-11-17T11:15:00.000Z'
//       ? moment(date)
//       : moment('07-15-2023 14:15', 'MM-DD-YYYY HH:mm')
//   }
// })

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
          hour: null
        }

      },
      form: {
        getFieldValue: (value: string) => {
          if (value === 'status') {
            return 'new'
          }
          else if (value === 'settings') {
            return {
              date: null,
              hour: null
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
  const timezone = 'UTC'
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

    moment.tz.setDefault(timezone)
  })
  afterEach(() => {
    moment.tz.setDefault(moment.tz.guess())
  })

  // it('should render correctly', async () => {
  //   render(<AIDrivenRRM />, {
  //     route: { path: '/ai/intentAi/b17acc0d-7c49-4989-adad-054c7f1fc5b6/c-crrm-channel24g-auto/edit' },
  //     wrapper: Provider
  //   })
  //   const form = within(await screen.findByTestId('steps-form'))
  //   const actions = within(form.getByTestId('steps-form-actions'))

  //   expect(await screen.findByText('Benefits')).toBeVisible()
  //   await userEvent.click(actions.getByRole('button', { name: 'Next' }))

  //   await screen.findAllByRole('heading', { name: 'Intent Priority' })
  //   expect(await screen.findByText('Potential trade-off?')).toBeVisible()
  //   const throughputRadio = screen.getByRole('radio', {
  //     name: 'High client throughput in sparse network'
  //   })
  //   await userEvent.click(throughputRadio)
  //   expect(throughputRadio).toBeChecked()
  //   await userEvent.click(actions.getByRole('button', { name: 'Next' }))

  //   await screen.findAllByRole('heading', { name: 'Settings' })
  //   await userEvent.click(actions.getByRole('button', { name: 'Next' }))

  //   // await screen.findAllByRole('heading', { name: 'Summary' })
  //   expect(screen.getByRole('button', {
  //     name: 'Apply'
  //   })).toBeVisible()
  // })

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
    // expect(form.getByTitle('2024-08-15')).toBeVisible()

    const formBody = within(form.getByTestId('steps-form-body'))

    // expect(await formBody.findByText('Select date')).toBeVisible()
    await userEvent.click(formBody.getByPlaceholderText('Select date'))
    await screen.findByText('Mo')
    await userEvent.click(screen.getByText('15'))

    // expect(form.getByTitle('2024-08-15')).toBeVisible()


    expect(screen.getByText('Select hour')).toBeInTheDocument()
    await click(screen.getByText('Select hour'))
    await screen.findByText('03:30 (UTC+00)')
    expect(screen.getByText('03:30 (UTC+00)')).toBeInTheDocument()


    // expect(await formBody.findByText('Select hour')).toBeVisible()
    // expect(screen.getByText('01:30 (UTC+00)')).toBeInTheDocument()

    // await userEvent.click(formBody.getByRole('combobox'))

    // await click(formBody.getByText('Select hour'))
    // expect(await screen.findByText('10:15 (UTC+00)')).toBeInTheDocument()
    // await screen.findByText('01:10 (UTC+08)')
    // await userEvent.click(screen.getByText('01:10 (UTC+08)'))
    // // await screen.findByText('-15')

    // await type(formBody.getByRole('combobox'), '2024-08-07')


    // await click(await formBody.findByText('Select hour'))




    // await formBody.findByRole('combobox')

    // await selectOptions(
    //   await screen.findByRole('combobox'),
    //   '05:15 (UTC+08)')



    // await screen.findByTitle('05:15 (UTC+08)')
    // await click(screen.getByTitle('05:15 (UTC+08)'))
    // expect(await formBody.findByTitle('05:15 (UTC+08)')).toBeVisible()



    // Step 4
    // await userEvent.click(actions.getByRole('button', { name: 'Next' }))
    // await screen.findAllByRole('heading', { name: 'Summary' })
    // expect(screen.getByRole('button', {
    //   name: 'Apply'
    // })).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })

  // it('should render correctly when IS_MLISA_SA is true', async () => {
  //   mockGet.mockReturnValue('true')
  //   const { asFragment } = render(<AIDrivenRRM />, {
  //     route: { path: '/ai/intentAi/b17acc0d-7c49-4989-adad-054c7f1fc5b6/c-crrm-channel24g-auto/edit' },
  //     wrapper: Provider
  //   })
  // expect(asFragment()).toMatchSnapshot()
  // })
})
