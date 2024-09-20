import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { WorkflowUrls }                        from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { EnrollmentPortalDesignModalProps } from '../../../EnrollmentPortalDesignModal'
import { WorkflowActionPreviewModalProps }  from '../../../WorkflowActionPreviewModal'

import { WorkflowDesigner } from './index'

jest.mock('../WorkflowPanel', () => ({
  ...jest.requireActual('../WorkflowPanel'),
  WorkflowPanel: () => <div data-testid='WorkflowPanelTestId' />
}))

jest.mock('../../../EnrollmentPortalDesignModal', () => ({
  ...jest.requireActual('../../../EnrollmentPortalDesignModal'),
  EnrollmentPortalDesignModal: (props: EnrollmentPortalDesignModalProps) => {
    const { Modal } = jest.requireActual('antd')
    const { onFinish } = props
    return (
      <Modal title={'test'} onCancel={onFinish} visible>
        <div data-testid='EnrollmentPortalDesignModalTestId' />
      </Modal>
    )
  }
}))
jest.mock('../../../WorkflowActionPreviewModal', () => ({
  ...jest.requireActual('../../../WorkflowActionPreviewModal'),
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


const EmptyId = 'empty-policy-id'
const spyGetStepFn = jest.fn()

describe('Workflow Designer', () => {
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

  it('should render correct header while steps are empty', async () => {
    const spyOnCloseFn = jest.fn()
    render(
      <Provider>
        <WorkflowDesigner workflowId={EmptyId} onClose={spyOnCloseFn} />
      </Provider>
    )
    await waitFor(() => expect(spyGetStepFn).toHaveBeenCalled())

    await userEvent.click(await screen.findByRole('button', { name: /close/i }))
    expect(spyOnCloseFn).toHaveBeenCalled()

    await userEvent.click(await screen.findByRole('button', { name: /Portal Look/i }))
    expect(await screen.findByTestId('EnrollmentPortalDesignModalTestId')).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('img', { name: /close/i }))
    expect(screen.queryByTestId('EnrollmentPortalDesignModalTestId')).not.toBeInTheDocument()

    expect(await screen.findByTestId('WorkflowPanelTestId')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Preview/i })).not.toBeEnabled()
  })

  it('should render correct header while steps are not empty', async () => {
    render(
      <Provider>
        <WorkflowDesigner workflowId={'not-empty-id'} onClose={()=> {}} />
      </Provider>
    )
    await waitFor(() => expect(spyGetStepFn).toHaveBeenCalled())

    expect(await screen.findByTestId('WorkflowPanelTestId')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Preview/i })).toBeEnabled()

    await userEvent.click(await screen.findByRole('button', { name: /Preview/i }))
    expect(await screen.findByTestId('WorkflowActionPreviewModalTestId')).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('img', { name: /close/i }))
    expect(screen.queryByTestId('WorkflowActionPreviewModalTestId')).not.toBeInTheDocument()
  })
})
