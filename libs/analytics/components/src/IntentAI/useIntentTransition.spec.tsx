
import userEvent         from '@testing-library/user-event'
import { Form, message } from 'antd'
import moment            from 'moment-timezone'
import { BrowserRouter } from 'react-router-dom'

import { Provider, intentAIApi, intentAIUrl, store }                                  from '@acx-ui/store'
import { mockGraphqlMutation, render, renderHook, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { encodeParameter }                                                            from '@acx-ui/utils'

import { mockIntentContext }                           from './__tests__/fixtures'
import { mockedIntentCRRM, mockedIntentCRRMnew }       from './AIDrivenRRM/__tests__/fixtures'
import { Statuses }                                    from './states'
import { createUseIntentTransition, useInitialValues } from './useIntentTransition'

const { click } = userEvent

const mockedUseNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigateToPath: () => jest.fn(),
  useNavigate: () => mockedUseNavigate
}))

jest.mock('./IntentContext')

describe('createUseIntentTransition', () => {
  beforeEach(() => {
    store.dispatch(intentAIApi.util.resetApiState())

    moment.tz.setDefault('Asia/Singapore')
    const now = +new Date('2024-08-12T12:00:00.000Z')
    jest.spyOn(Date, 'now').mockReturnValue(now)
  })

  describe('submit', () => {
    const TestForm = () => {
      const initialValues = useInitialValues()
      const useIntentTransition = createUseIntentTransition(v => v)
      const { submit } = useIntentTransition()
      return <Form
        initialValues={initialValues}
        onFinish={async (values) => { submit(values).catch(()=>{}) }}
      >
        <Form.Item hidden name={'id'} ><input type={'hidden'}/></Form.Item>
        <Form.Item hidden name={'status'} ><input type={'hidden'}/></Form.Item>
        <Form.Item hidden name={'settings'} ><input type={'hidden'}/></Form.Item>
        <button type='submit'>Submit</button>
      </Form>
    }

    afterEach((done) => {
      const toast = screen.queryAllByRole('img', { name: 'close' })
      toast.forEach((t) => {
        if (t) {
          waitForElementToBeRemoved(toast).then(done)
          message.destroy()
        } else {
          done()
        }
      })
    })

    it('handle submit success', async () => {
      const params = { tenantId: 'tenant-id' }
      mockIntentContext({
        intent: { ...mockedIntentCRRM, metadata: {
          ...mockedIntentCRRM.metadata, scheduledAt: '2024-08-12T13:00:00' } }
      })
      mockGraphqlMutation(intentAIUrl, 'IntentTransition', {
        data: { transition: { success: true, errorMsg: '' , errorCode: '' } }
      })
      render(<Provider><TestForm /></Provider>, { route: { params } })
      await click(await screen.findByRole('button', { name: 'Submit' }))
      expect(await screen.findByTestId('toast-content'))
        // eslint-disable-next-line max-len
        .toHaveTextContent('AI-Driven RRM: Client Density vs Throughput for 2.4 GHz radio for 21_US_Beta_Samsung has been updated')
      const viewElement = await screen.findByText('View')
      await userEvent.click(viewElement)
      const intentFilter = {
        aiFeature: ['AI-Driven RRM'],
        intent: ['Client Density vs Throughput for 2.4 GHz radio'],
        category: ['Wi-Fi Experience'],
        sliceValue: ['4e3f1fbc-63dd-417b-b69d-2b08ee0abc52'],
        statusLabel: ['scheduled+scheduled-one-click+applyscheduled']
      }
      const encodedParameters = encodeParameter(intentFilter)
      const newSearch = new URLSearchParams()
      newSearch.set('intentTableFilters', encodedParameters)
      const search = newSearch.toString()

      expect(mockedUseNavigate).toBeCalledWith({
        pathname: `/${params.tenantId}/t/analytics/intentAI`,
        hash: '',
        search
      })
    })
    it('handle submit error', async () => {
      mockIntentContext({
        intent: { ...mockedIntentCRRM, metadata: {
          ...mockedIntentCRRM.metadata, scheduledAt: '2024-08-12T13:00:00' } }
      })
      mockGraphqlMutation(intentAIUrl, 'IntentTransition', {
        data: { transition: { success: false, errorMsg: 'error' , errorCode: '' } }
      })
      render(<BrowserRouter><Provider><TestForm /></Provider></BrowserRouter>)
      await click(await screen.findByRole('button', { name: 'Submit' }))
      expect(await screen.findByTestId('toast-content')).toHaveTextContent('error')
    })
    it('handle scheduledAt validation', async () => {
      mockIntentContext({
        intent: { ...mockedIntentCRRMnew, metadata: {
          ...mockedIntentCRRMnew.metadata, scheduledAt: '2024-08-12T00:00:00' } }
      })
      render(<BrowserRouter><Provider><TestForm /></Provider></BrowserRouter>)
      await click(await screen.findByRole('button', { name: 'Submit' }))
      expect(await screen.findByTestId('toast-content'))
        .toHaveTextContent('Scheduled time cannot be before 08/12/2024 20:30')
    })
  })
})

describe('useInitialValues', () => {
  it('when intent status is "new", should return current date and undefined time', async () => {
    mockIntentContext({ intent: mockedIntentCRRMnew })
    let currentTime: moment.Moment
    const { result: { current: initialValues } } = renderHook(() => {
      currentTime = moment()
      return useInitialValues()
    })
    expect(initialValues).toStrictEqual({
      id: mockedIntentCRRMnew.id,
      status: Statuses.new,
      statusReason: mockedIntentCRRMnew.statusReason,
      displayStatus: mockedIntentCRRMnew.displayStatus,
      settings: { date: currentTime!, time: undefined }
    })
  })

  it.each(Object.values(Statuses).filter((status) => status !== Statuses.new))(
    'when status is "%s" (not "new") and has scheduledAt, should return scheduled date and time',
    async (status) => {
      const mockScheduledAt = '2023-07-15T14:15:00.000Z'
      mockIntentContext({
        intent: {
          ...mockedIntentCRRM,
          metadata: {
            ...mockedIntentCRRM.metadata,
            scheduledAt: mockScheduledAt
          },
          status
        }
      })
      const { result: { current: initialValues } } = renderHook(() => useInitialValues())
      expect(initialValues).toStrictEqual({
        id: mockedIntentCRRM.id,
        status,
        statusReason: mockedIntentCRRM.statusReason,
        displayStatus: mockedIntentCRRM.displayStatus,
        settings: {
          date: moment(mockScheduledAt),
          time: moment.duration(moment(mockScheduledAt).format('HH:mm:ss')).asHours()
        }
      })
    }
  )

  it.each(Object.values(Statuses).filter((status) => status !== Statuses.new))(
    'when status is "%s" (not "new") and has no scheduledAt, should return undefined date and time',
    async (status) => {
      mockIntentContext({ intent: { ...mockedIntentCRRMnew, status } })
      const { result: { current: initialValues } } = renderHook(() => useInitialValues())
      expect(initialValues).toStrictEqual({
        id: mockedIntentCRRMnew.id,
        status,
        statusReason: mockedIntentCRRMnew.statusReason,
        displayStatus: mockedIntentCRRMnew.displayStatus,
        settings: { date: undefined, time: undefined }
      })
    }
  )
})