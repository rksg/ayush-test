import { waitFor } from '@testing-library/react'
import { rest }    from 'msw'

import { NewAPITableResult, Workflow, WorkflowUrls } from '@acx-ui/rc/utils'
import { Provider }                                  from '@acx-ui/store'
import { mockServer, render, screen }                from '@acx-ui/test-utils'

import {
  mockGetActionDefinitionsResult,
  mockGetStepsByIdResult
} from './__tests__/fixtures'

import { WorkflowPanel } from './index'

jest.mock('./WorkflowCanvas', () => (
  () => <div data-testid={'WorkflowCanvasTestId'} />
))

const publishedWorkflows: Workflow[] = [{
  id: 'id1',
  name: 'workflow-1',
  publishedDetails: {
    status: 'PUBLISHED',
    version: 1,
    publishedDate: '2024-02-01'
  },
  links: [
    {
      rel: 'enrollmentPortal',
      href: '/url'
    }
  ]
}]

const workflows:Workflow[] = [{
  id: 'id1',
  name: 'workflow-1'
}]

const publishedList: NewAPITableResult<Workflow> = {
  content: publishedWorkflows,
  paging: {
    page: 0,
    pageSize: 10,
    totalCount: 1
  }
}

describe('WorkflowPanel', () => {
  const mockWorkflowId = 'mock-workflow-id'
  const spyGetStepsFn = jest.fn()
  const spyGetDefinitionFn = jest.fn()
  const spyGetDefinitionByIdFn = jest.fn()
  const getWorkflowApi = jest.fn()
  const searchVersionApi = jest.fn()
  const params = { tenantId: 't1', policyId: workflows[0].id }
  beforeEach(() => {
    spyGetStepsFn.mockClear()
    spyGetDefinitionFn.mockClear()
    spyGetDefinitionByIdFn.mockClear()
    getWorkflowApi.mockClear()
    searchVersionApi.mockClear()
    mockServer.use(
      rest.get(
        WorkflowUrls.getWorkflowStepsById.url.split('?')[0],
        (_, res, ctx) => {
          spyGetStepsFn()
          return res(ctx.json(mockGetStepsByIdResult))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowActionDefinitions.url.split('?')[0],
        (_, res, ctx) => {
          spyGetDefinitionFn()
          return res(ctx.json(mockGetActionDefinitionsResult))
        }),
      rest.get(
        WorkflowUrls.getWorkflowActionDefinitionById.url,
        (_, res, ctx) => {
          spyGetDefinitionByIdFn()
          return res(ctx.json({}))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowDetail.url,
        (req, res, ctx) => {
          getWorkflowApi()
          return res(ctx.json(workflows[0]))
        }
      ),
      rest.post(
        WorkflowUrls.searchWorkflows.url.split('?')[0],
        (req, res, ctx) => {
          searchVersionApi()
          return res(ctx.json(publishedList))
        }
      )
    )
  })

  it('should render WorkflowPanel correctly', async () => {
    render(<Provider><WorkflowPanel workflowId={mockWorkflowId} /></Provider>, {
      route: { params }
    })

    await waitFor(() => expect(spyGetStepsFn).toHaveBeenCalled())
    await waitFor(() => expect(spyGetDefinitionFn).toHaveBeenCalled())
    await screen.findByTestId('WorkflowCanvasTestId')
  })
})
