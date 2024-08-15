
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { useIsSplitOn }                                                              from '@acx-ui/feature-toggle'
import { WorkflowUrls, Workflow, NewAPITableResult }                                 from '@acx-ui/rc/utils'
import { Provider }                                                                  from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { RequestPayload }                                                            from '@acx-ui/types'

import { WorkflowForm, WorkflowFormMode } from '.'

const workflows:Workflow[] = [{
  id: 'id1',
  name: 'workflow-1'
}]

const list: NewAPITableResult<Workflow> = {
  content: workflows,
  paging: {
    page: 0,
    pageSize: 10,
    totalCount: 1
  }
}


const paginationPattern = '?size=:pageSize&page=:page&sort=:sort&excludeContent=:excludeContent'
export const replacePagination = (url: string) => url.replace(paginationPattern, '')

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

const mockCreateWorkflowApi = jest.fn()
const mockUpdateWorkflowApi = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

jest.mock('../policies/WorkflowCanvas/WorkflowPanel', () => ({
  ...jest.requireActual('../policies/WorkflowCanvas/WorkflowPanel'),
  WorkflowPanel: () => <div data-testid='WorkflowPanel' />
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useAddWorkflowMutation: () => {
    return [(req: RequestPayload) => {
      return { unwrap: () => new Promise((resolve) => {
        mockCreateWorkflowApi()
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)({ id: workflows[0] })
        }, 100)})
      }
    }]
  },
  useUpdateWorkflowMutation: () => {
    return [(req: RequestPayload) => {
      return { unwrap: () => new Promise((resolve) => {
        mockUpdateWorkflowApi()
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)()
        }, 100)})
      }
    }, { isLoading: false }]
  }
}))

describe('WorkflowForm', () => {
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockCreateWorkflowApi.mockClear()
    mockUpdateWorkflowApi.mockClear()
    mockServer.use(
      rest.post(
        replacePagination(WorkflowUrls.searchInProgressWorkflows.url),
        (req, res, ctx) => {
          return res(ctx.json(list))
        }
      ),
      rest.post(
        WorkflowUrls.createWorkflow.url,
        (req, res, ctx) => {
          mockCreateWorkflowApi()
          return res(ctx.json(workflows[0]))
        }
      ),
      rest.patch(
        WorkflowUrls.updateWorkflow.url,
        (req, res, ctx) => {
          mockUpdateWorkflowApi()
          return res(ctx.json({}))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowDetail.url,
        (req, res, ctx) => res(ctx.json(workflows[0]))
      ),
      rest.get(
        WorkflowUrls.getWorkflowStepsById.url.split('?')[0],
        (req, res, ctx) => {
          return res(ctx.json({
            content: [],
            paging: { totalCount: 0 }
          }))
        }
      )
    )
  })

  it('should render correctly for creating workflow', async () => {
    render(<Provider>
      <WorkflowForm
        mode={WorkflowFormMode.CREATE}
      />
    </Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
        policyId: workflows[0].id
      }, path: '/:tenantId' }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const addButton = await screen.findByRole('button', { name: 'Add' })
    const nameField = await screen.findByLabelText('Workflow Name')
    await userEvent.type(nameField, 'new flow')

    fireEvent.click(addButton)
    await waitFor(() => expect(mockCreateWorkflowApi).toHaveBeenCalled())
  })


  it('should render correctly for edit workflow', async () => {
    render(
      <Provider>
        <WorkflowForm
          mode={WorkflowFormMode.EDIT}
        />
      </Provider>, {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          policyId: workflows[0].id
        }, path: '/:tenantId/:policyId' }
      })

    const applyButton = await screen.findByRole('button', { name: 'Apply' })
    const nameField = await screen.findByLabelText('Workflow Name')
    await userEvent.type(nameField, 'new name')
    fireEvent.click(applyButton)
  })

  it('should render correctly for publish workflow', async () => {
    render(
      <Provider>
        <WorkflowForm
          mode={WorkflowFormMode.EDIT}
        />
      </Provider>, {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          policyId: workflows[0].id
        }, path: '/:tenantId/:policyId' }
      })

    const applyButton = await screen.findByRole('button', { name: 'Apply & Publish' })
    const nameField = await screen.findByLabelText('Workflow Name')
    await userEvent.type(nameField, 'new name')
    fireEvent.click(applyButton)
    await waitFor(() => expect(mockUpdateWorkflowApi).toHaveBeenCalled())
  })


  it('should cancel correctly for editing workflow', async () => {
    render(
      <Provider>
        <WorkflowForm
          mode={WorkflowFormMode.EDIT}
        />
      </Provider>, {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          policyId: workflows[0].id
        }, path: '/:tenantId/:policyId' }
      })

    const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
    const nameField = await screen.findByLabelText('Workflow Name')
    await userEvent.type(nameField, 'new name')
    fireEvent.click(cancelButton)
    await waitFor(() => expect(mockUpdateWorkflowApi).toHaveBeenCalledTimes(0))
  })
})
