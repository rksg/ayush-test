import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { ActionType, GenericActionData, WorkflowUrls } from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor }         from '@acx-ui/test-utils'

import { WorkflowActionPreviewModalProps } from '../../../WorkflowActionPreviewModal'

import StepDrawer from './StepDrawer'

jest.mock('./WorkflowActionSettingForm', () => ({
  AupSettings: () => <div data-testid='AupSettings'/>,
  DataPromptSettings: () => <div data-testid='DataPromptSettings'/>,
  DisplayMessageSetting: () => <div data-testid='DisplayMessageSetting'/>
}))

jest.mock('../../../WorkflowActionPreviewModal', () => ({
  WorkflowActionPreviewModal: (props: WorkflowActionPreviewModalProps) => {
    const { Modal } = jest.requireActual('antd')
    const { onClose } = props

    return (
      <Modal title={'test'} onCancel={onClose} visible>
        <div data-testid='WorkflowActionPreviewModalTestId' />
      </Modal>
    )
  }
}))

const mockCreateStepMutation = jest.fn()
const mockPatchActionMutation = jest.fn()
const spyGetActionFn = jest.fn()
const spyOnCloseFn = jest.fn()

jest.mock('./useWorkflowStepActions', () => ({
  useWorkflowStepActions: () => ({
    createStepWithActionMutation: async (
      _policyId: string,
      _actionType: ActionType,
      _formData: GenericActionData,
      _priorNodeId?: string,
      onClose?: () => void
    ) => {
      mockCreateStepMutation()
      onClose?.()
    },
    patchActionMutation: async () => mockPatchActionMutation()
  })
}))

const mockedWorkflowId = 'mock-workflow-id'

describe('StepDrawer', () => {
  beforeEach(() => {
    mockCreateStepMutation.mockClear()
    mockPatchActionMutation.mockClear()
    spyGetActionFn.mockClear()
    spyOnCloseFn.mockClear()

    mockServer.use(
      rest.get(
        WorkflowUrls.getActionById.url,
        (_, res, ctx) => {
          spyGetActionFn()
          return res(ctx.json({ data: { name: 'action' } }))
        }
      )
    )
  })

  it('should create step correctly', async () => {
    render(<Provider>
      <StepDrawer
        workflowId={mockedWorkflowId}
        isEdit={false}
        visible={true}
        actionType={ActionType.AUP}
        onClose={spyOnCloseFn}/>
    </Provider>)

    expect(screen.getByTestId('AupSettings')).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: /Add Step/i }))

    expect(mockCreateStepMutation).toHaveBeenCalled()
    expect(spyOnCloseFn).toHaveBeenCalled()
  })

  it('should edit step correctly', async () => {
    render(<Provider>
      <StepDrawer
        workflowId={mockedWorkflowId}
        actionId={'mock-action-id'}
        isEdit={true}
        visible={true}
        actionType={ActionType.DISPLAY_MESSAGE}
        onClose={spyOnCloseFn}/>
    </Provider>)

    await waitFor(() => expect(spyGetActionFn).toHaveBeenCalled())
    expect(await screen.findByTestId('DisplayMessageSetting')).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: /Preview/i }))
    expect(await screen.findByTestId('WorkflowActionPreviewModalTestId')).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('img', { name: /close/i }))
    expect(screen.queryByTestId('WorkflowActionPreviewModalTestId')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Save Step/i }))
    await waitFor(() => expect(mockPatchActionMutation).toHaveBeenCalled())
    expect(spyOnCloseFn).toHaveBeenCalled()
  })
})
