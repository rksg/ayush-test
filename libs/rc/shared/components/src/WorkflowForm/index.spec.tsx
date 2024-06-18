
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { WorkflowUrls, Workflow, NewAPITableResult }      from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

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

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('WorkflowForm', () => {
  const createWorkflowApi = jest.fn()
  const updateWorkflowApi = jest.fn()
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    createWorkflowApi.mockClear()
    updateWorkflowApi.mockClear()
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
          createWorkflowApi()
          return res(ctx.json({}))
        }
      ),
      rest.patch(
        WorkflowUrls.updateWorkflow.url,
        (req, res, ctx) => {
          updateWorkflowApi()
          return res(ctx.json({}))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowDetail.url,
        (req, res, ctx) => res(ctx.json(workflows[0]))
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
        policyId: ''
      }, path: '/:tenantId' }
    })

    await screen.findAllByText('Settings')
    const addButton = await screen.findByRole('button', { name: 'Add' })
    const nameField = await screen.findByLabelText('Workflow Name')
    await userEvent.type(nameField, 'new flow')

    fireEvent.click(addButton)
    await waitFor(() => expect(createWorkflowApi).toHaveBeenCalled())
  })


  it('should render correctly for editing workflow', async () => {
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

    await screen.findAllByText('Settings')
    const applyButton = await screen.findByRole('button', { name: 'Apply' })
    const nameField = await screen.findByLabelText('Workflow Name')
    await userEvent.type(nameField, 'new name')

    fireEvent.click(applyButton)
    await waitFor(() => expect(updateWorkflowApi).toHaveBeenCalled())
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


    await screen.findAllByText('Settings')
    const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
    const nameField = await screen.findByLabelText('Profile Name')
    await userEvent.type(nameField, 'new name')
    fireEvent.click(cancelButton)
    await waitFor(() => expect(updateWorkflowApi).toHaveBeenCalledTimes(0))
  })
})