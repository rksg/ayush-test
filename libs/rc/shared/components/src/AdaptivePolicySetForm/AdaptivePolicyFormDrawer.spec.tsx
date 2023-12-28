import userEvent       from '@testing-library/user-event'
import { Form, Input } from 'antd'
import { rest }        from 'msw'

import { RulesManagementUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { AdaptivePolicyFormDrawer } from './AdaptivePolicyFormDrawer'

const requiredFormItem = () => <>
  <Form.Item
    name='templateTypeId'
    initialValue='templateTypeId'
    children={<Input />}
  />
  <Form.Item
    name='evaluationRules'
    initialValue={['testRule']}
    children={<Input />}
  />
</>

jest.mock('../AdaptivePolicySettingForm', () => ({
  AdaptivePolicySettingForm: () => (
    <>
      <div data-testid='AdaptivePolicySettingForm' />
      {requiredFormItem()}
    </>
  )
}))

const mockedSetVisible = jest.fn()
const createPolicyBeingCalled = jest.fn()
const addConditionsBeingCalled = jest.fn()

describe('AdaptivePolicyFormDrawer', () => {
  beforeEach(() => {
    mockedSetVisible.mockClear()
    createPolicyBeingCalled.mockClear()
    addConditionsBeingCalled.mockClear()

    mockServer.use(
      rest.post(
        RulesManagementUrlsInfo.createPolicy.url,
        (req, res, ctx) => {
          createPolicyBeingCalled()
          return res(ctx.json({ id: 'testId' }))
        }
      ),
      rest.post(
        RulesManagementUrlsInfo.addConditions.url,
        (req, res, ctx) => {
          addConditionsBeingCalled()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should render AdaptivePolicyFormDrawer successfully', async () => {

    render(
      <Provider>
        <AdaptivePolicyFormDrawer
          setVisible={mockedSetVisible}
          visible={true}/>
      </Provider>
    )

    expect(screen.getByText('Add Adaptive Policy')).toBeVisible()
    expect(screen.getByTestId('AdaptivePolicySettingForm')).toBeVisible()
  })

  it('should add adaptive policy successfully', async () => {

    render(
      <Provider>
        <AdaptivePolicyFormDrawer
          setVisible={mockedSetVisible}
          visible={true}/>
      </Provider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(createPolicyBeingCalled).toBeCalled())
    await waitFor(() => expect(addConditionsBeingCalled).toBeCalled())
    await waitFor(() => expect(mockedSetVisible).toBeCalled())
  })

  it('should cancel adaptive policy successfully', async () => {

    render(
      <Provider>
        <AdaptivePolicyFormDrawer
          setVisible={mockedSetVisible}
          visible={true}/>
      </Provider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(mockedSetVisible).toBeCalled())
  })
})
