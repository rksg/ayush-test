import { Form } from 'antd'
import { rest } from 'msw'

import { WorkflowUrls }                        from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { WorkflowSettingForm } from './WorkflowSettingForm'


jest.mock('../../policies/WorkflowCanvas/WorkflowPanel', () => ({
  ...jest.requireActual('../../policies/WorkflowCanvas/WorkflowPanel'),
  WorkflowPanel: () => <div data-testid='WorkflowPanel' />
}))

const EmptyId = 'empty-policy-id'
const spyGetStepFn = jest.fn()

describe('WorkflowSettingForm', () => {

  beforeEach(() => {
    spyGetStepFn.mockClear()

    mockServer.use(
      rest.get(
        WorkflowUrls.getWorkflowStepsById.url.split('?')[0],
        (req, res, ctx) => {
          const policyId = req.params.policyId
          spyGetStepFn()

          return res(ctx.json({
            content: [],
            paging: { totalCount: policyId === EmptyId ? 0 : 10 }
          }))
        }
      )
    )
  })

  it('should render empty component while steps are empty', async () => {
    render(
      <Provider>
        <Form>
          <WorkflowSettingForm policyId={EmptyId}/>
        </Form>
      </Provider>
    )

    await waitFor(() => expect(spyGetStepFn).toHaveBeenCalled())

    expect(await screen.findByText(/Start designing the workflow/i)).toBeInTheDocument()
    expect(screen.queryByTestId('WorkflowPanel')).not.toBeInTheDocument()
  })

  it('should render canvas component while steps are not empty', async () => {
    render(
      <Provider>
        <Form>
          <WorkflowSettingForm policyId={'not-empty-id'}/>
        </Form>
      </Provider>
    )
    await waitFor(() => expect(spyGetStepFn).toHaveBeenCalled())

    expect(await screen.findByTestId('WorkflowPanel')).toBeInTheDocument()
    expect(screen.queryByText(/Start designing the workflow/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Change Flow/i })).toBeInTheDocument()
  })
})
