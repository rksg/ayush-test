
import userEvent         from '@testing-library/user-event'
import { Form, message } from 'antd'
import moment            from 'moment-timezone'
import { BrowserRouter } from 'react-router-dom'

import { Provider, intentAIApi, intentAIUrl, store }                                  from '@acx-ui/store'
import { mockGraphqlMutation, render, renderHook, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockIntentContext }                           from './__tests__/fixtures'
import { mockedIntentCRRM, mockedIntentCRRMnew }       from './AIDrivenRRM/__tests__/fixtures'
import { DisplayStates, Statuses }                     from './states'
import { createUseIntentTransition, useInitialValues } from './useIntentTransition'

const { click } = userEvent

const mockNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigateToPath: () => mockNavigate
}))
jest.mock('./IntentContext')

describe('createUseIntentTransition', () => {
  beforeEach(() => {
    store.dispatch(intentAIApi.util.resetApiState())

    moment.tz.setDefault('Asia/Singapore')
    const now = +new Date('2024-08-12T12:00:00.000Z')
    jest.spyOn(Date, 'now').mockReturnValue(now)
  })

  describe('initialValues', () => {
    it('handle new intent', async () => {
      mockIntentContext({ intent: mockedIntentCRRMnew })
      const { result: { current: initialValues } } = renderHook(() => useInitialValues())
      expect(initialValues).toStrictEqual({
        id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b7',
        settings: { date: undefined, time: undefined },
        status: Statuses.new,
        statusReason: undefined,
        displayStatus: DisplayStates.new
      })
    })
    it('handle existing intent with scheduledAt', async () => {
      mockIntentContext({ intent: mockedIntentCRRM })
      const { result: { current: initialValues } } = renderHook(() => useInitialValues())
      expect(initialValues).toStrictEqual({
        id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6',
        settings: { date: moment('2023-07-15T14:15:00.000Z'), time: 22.25 },
        status: Statuses.applyScheduled,
        statusReason: undefined,
        displayStatus: DisplayStates.applyScheduled
      })
    })
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
      const toast = screen.queryByRole('img', { name: 'close' })
      if (toast) {
        waitForElementToBeRemoved(toast).then(done)
        message.destroy()
      } else {
        done()
      }
    })

    it('handle submit success', async () => {
      mockIntentContext({
        intent: { ...mockedIntentCRRM, metadata: {
          ...mockedIntentCRRM.metadata, scheduledAt: '2024-08-12T13:00:00' } }
      })
      mockGraphqlMutation(intentAIUrl, 'IntentTransition', {
        data: { transition: { success: true, errorMsg: '' , errorCode: '' } }
      })
      render(<BrowserRouter><Provider><TestForm /></Provider></BrowserRouter>)
      await click(await screen.findByRole('button', { name: 'Submit' }))
      expect(await screen.findByTestId('toast-content'))
        // eslint-disable-next-line max-len
        .toHaveTextContent('AI-Driven RRM: Client Density vs Throughput for 2.4 GHz radio for 21_US_Beta_Samsung has been updated')
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

