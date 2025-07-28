
import React from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { WorkflowUrls, Workflow }                         from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'
import { NewAPITableResult }                              from '@acx-ui/utils'

import { WorkflowDrawer } from '.'


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

const mockUpdateWorkflowApi = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))


describe('WorkflowDrawer', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  beforeEach(async () => {
    mockUpdateWorkflowApi.mockClear()
    mockServer.use(
      rest.post(
        replacePagination(WorkflowUrls.searchInProgressWorkflows.url),
        (req, res, ctx) => {
          return res(ctx.json(list))
        }
      ),
      rest.patch(
        WorkflowUrls.updateWorkflow.url,
        (req, res, ctx) => {
          mockUpdateWorkflowApi()
          return res(ctx.json({}))
        }
      )
    )
  })

  it('should render correctly for edit workflow', async () => {
    render(<Provider>
      <WorkflowDrawer
        visible
        onClose={()=>{}}
        data={workflows[0]}
      />
    </Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
        policyId: workflows[0].id
      }, path: '/:tenantId' }
    })


    await screen.findByText('Edit Workflow')
    const addButton = await screen.findByRole('button', { name: 'Save' })
    const nameField = await screen.findByLabelText('Workflow Name')
    await userEvent.type(nameField, 'new flow')

    fireEvent.click(addButton)
    await waitFor(() => expect(mockUpdateWorkflowApi).toHaveBeenCalled())
  })

  it('should cancel correctly for editing workflow', async () => {
    render(
      <Provider>
        <WorkflowDrawer
          visible
          onClose={()=>{}}
          data={workflows[0]}
        />
      </Provider>, {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          policyId: workflows[0].id
        }, path: '/:tenantId/:policyId' }
      })

    await screen.findByText('Edit Workflow')
    const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
    const nameField = await screen.findByLabelText('Workflow Name')
    await userEvent.type(nameField, 'new name')
    fireEvent.click(cancelButton)
    // Called once for validation
    await waitFor(() => expect(mockUpdateWorkflowApi).toHaveBeenCalledTimes(0))
  })
})
