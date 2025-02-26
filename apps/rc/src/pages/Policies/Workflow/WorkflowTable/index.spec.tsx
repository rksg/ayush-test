import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  NewAPITableResult,
  PolicyOperation,
  PolicyType,
  Workflow,
  WorkflowUrls,
  getPolicyRoutePath,
  WorkflowStep
} from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import WorkflowTable from '.'
const workflows:Workflow[] = [{
  id: 'id1',
  name: 'workflow-1'
}]

const publishedWorkflows: Workflow[] = [{
  id: 'id2',
  name: 'workflow-1',
  publishedDetails: {
    parentWorkflowId: 'id1',
    status: 'PUBLISHED',
    version: 1,
    publishedDate: '2024-02-01'
  }
}]


const list: NewAPITableResult<Workflow> = {
  content: workflows,
  paging: {
    page: 0,
    pageSize: 10,
    totalCount: 1
  }
}

const publishedList: NewAPITableResult<Workflow> = {
  content: publishedWorkflows,
  paging: {
    page: 0,
    pageSize: 10,
    totalCount: 1
  }
}

const steps: NewAPITableResult<WorkflowStep> = {
  content: [
    {
      id: 'step-1',
      enrollmentActionId: 'step-1-action-id',
      nextStepId: 'step-2'
    },
    {
      id: 'step-2',
      enrollmentActionId: 'step-2-action-id',
      priorStepId: 'step-1'
    },
    {
      id: 'step-3',
      enrollmentActionId: 'step-3-action-id',
      priorStepId: 'step-2'
    }
  ],
  paging: {
    page: 0,
    pageSize: 1,
    totalCount: 3
  }
}

const paginationPattern = '?size=:pageSize&page=:page&sort=:sort&excludeContent=:excludeContent'
export const replacePagination = (url: string) => url.replace(paginationPattern, '')
// eslint-disable-next-line max-len
const tablePath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.WORKFLOW, oper: PolicyOperation.LIST })
const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

jest.mock('@acx-ui/rc/components', ()=> ({
  ...jest.requireActual('@acx-ui/rc/components'),
  WorkflowActionPreviewModal: () => <div id='action preview'></div>,
  WorkflowDrawer: ()=> <div data-testid='drawer'></div>
}))


describe('WorkflowTable', () => {
  const deleteWorkflowApi = jest.fn()
  const searchInProgressWorkflowApi = jest.fn()
  const cloneWorkflowApi = jest.fn()
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }
  beforeEach(async () => {
    deleteWorkflowApi.mockClear()
    cloneWorkflowApi.mockClear()
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        replacePagination(WorkflowUrls.searchInProgressWorkflows.url),
        (req, res, ctx) => {
          searchInProgressWorkflowApi()
          return res(ctx.json(list))
        }
      ),
      rest.post(
        replacePagination(WorkflowUrls.searchWorkflows.url),
        (req, res, ctx) => res(ctx.json(publishedList))
      ),
      rest.delete(
        WorkflowUrls.deleteWorkflow.url,
        (req, res, ctx) => {
          deleteWorkflowApi()
          return res(ctx.json({}))
        }
      ),
      rest.post(
        replacePagination(WorkflowUrls.cloneWorkflow.url),
        (req, res, ctx) => {
          cloneWorkflowApi()
          return res(ctx.json({}))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowStepsById.url.split('?')[0],
        (req, res, ctx) => {
          return res(ctx.json(steps))
        }
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider>
      <WorkflowTable/>
    </Provider>, {
      route: { params, path: tablePath }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByRole('button', { name: 'Add Workflow' })
    // // assert link in Table view
    await screen.findByRole('link', { name: workflows[0].name })

    // // change search bar and trigger re-fetching mechanism
    const searchBar = await screen.findByRole('textbox')
    await userEvent.type(searchBar, 'search text')

    // // first: table query + second: search bar changed query
    await waitFor(() => expect(searchInProgressWorkflowApi).toHaveBeenCalledTimes(2))
  })


  it('should able to delete workflow', async () => {
    render(<Provider>
      <WorkflowTable/>
    </Provider>, {
      route: { params, path: tablePath }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByRole('button', { name: 'Add Workflow' })
    // // assert link in Table view
    await screen.findByRole('link', { name: workflows[0].name })

    const row = await screen.findByRole('row', { name: new RegExp(workflows[0].name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await screen.findByRole('button', { name: /Edit/i })
    const deleteButton = await screen.findByRole('button', { name: /Delete/i })
    await userEvent.click(deleteButton)

    const confirmButton = await screen.findByText('Delete Workflow')
    await userEvent.click(confirmButton)

    await waitFor(() => expect(deleteWorkflowApi).toHaveBeenCalled())
  })

  it('should able to preview', async () => {
    render(<Provider>
      <WorkflowTable/>
    </Provider>, {
      route: { params, path: tablePath }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByRole('button', { name: 'Add Workflow' })
    // // assert link in Table view
    await screen.findByRole('link', { name: workflows[0].name })

    const row = await screen.findByRole('row', { name: new RegExp(workflows[0].name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    const previewButton = await screen.findByRole('button', { name: /Preview/i })
    await userEvent.click(previewButton)
  })

  it('should able to edit workflow', async () => {
    render(<Provider>
      <WorkflowTable/>
    </Provider>, {
      route: { params, path: tablePath }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByRole('button', { name: 'Add Workflow' })
    // // assert link in Table view
    await screen.findByRole('link', { name: workflows[0].name })

    const row = await screen.findByRole('row', { name: new RegExp(workflows[0].name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    const editButton = await screen.findByRole('button', { name: /Edit/i })
    await userEvent.click(editButton)
    await screen.findByTestId('drawer')
  })

  it('should able to clone workflow', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider>
      <WorkflowTable/>
    </Provider>, {
      route: { params, path: tablePath }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    // // assert link in Table view
    await screen.findByRole('link', { name: workflows[0].name })

    const row = await screen.findByRole('row', { name: new RegExp(workflows[0].name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    const cloneButton = await screen.findByRole('button', { name: /Clone/i })
    await userEvent.click(cloneButton)

    await waitFor(() => expect(cloneWorkflowApi).toHaveBeenCalled())
  })
})
