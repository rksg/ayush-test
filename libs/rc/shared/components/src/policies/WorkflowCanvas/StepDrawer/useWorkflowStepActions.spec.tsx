import { waitFor } from '@testing-library/react'
import { rest }    from 'msw'

import { ActionType, GenericActionData, WorkflowUrls } from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, renderHook }                      from '@acx-ui/test-utils'
import { RequestPayload }                              from '@acx-ui/types'

import { useWorkflowStepActions } from './useWorkflowStepActions'

const mockCreateActionFn = jest.fn()
const spyCreateChildStepFn = jest.fn()
const spyPatchActionFn = jest.fn()

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useCreateActionMutation: () => {
    return [(req: RequestPayload) => {
      return { unwrap: () => new Promise((resolve) => {
        mockCreateActionFn()

        resolve(true)

        setTimeout(() => {
          (req.callback as Function)({ id: 'mocked_id' })
        }, 100)})
      }
    }]
  }
}))


describe('useWorkflowStepActions', () => {

  beforeEach(() => {
    mockCreateActionFn.mockClear()
    spyCreateChildStepFn.mockClear()
    spyPatchActionFn.mockClear()

    mockServer.use(
      rest.post(
        WorkflowUrls.createWorkflowChildStep.url,
        (_, res, ctx) => {
          spyCreateChildStepFn()
          return res(ctx.json({}))
        }
      ),
      rest.patch(
        WorkflowUrls.patchAction.url,
        (req, res, ctx) => {
          spyPatchActionFn(req.body)
          return res(ctx.json({}))
        }
      )
    )
  })

  it('should create step within two phases correctly', async () => {
    const spyOnCloseFn = jest.fn()
    const { createStepWithActionMutation } = renderHook(() => useWorkflowStepActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    }).result.current

    await createStepWithActionMutation(
      'policyId',
      ActionType.DISPLAY_MESSAGE,
      {} as GenericActionData,
      'priorNodeId',
      spyOnCloseFn
    )

    expect(mockCreateActionFn).toHaveBeenCalled()
    await waitFor(() => expect(spyCreateChildStepFn).toHaveBeenCalled())
    await waitFor(() => expect(spyOnCloseFn).toHaveBeenCalled())
  })

  it('should patch action correctly', async () => {
    const originalData: GenericActionData = {
      id: 'mock-action-id',
      name: 'mock-name-old',
      actionType: ActionType.AUP,
      version: 0
    } as GenericActionData

    const formData: GenericActionData = {
      id: 'mock-action-id',
      name: 'mock-name-new'
    } as GenericActionData

    const expectedPatchData = {
      name: formData.name
    }

    const { patchActionMutation } = renderHook(() => useWorkflowStepActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    }).result.current

    await patchActionMutation(originalData, formData)

    expect(spyPatchActionFn).toHaveBeenCalledWith(expectedPatchData)
  })
})
