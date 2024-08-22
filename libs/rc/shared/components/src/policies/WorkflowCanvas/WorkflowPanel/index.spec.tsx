import { waitFor } from '@testing-library/react'
import { rest }    from 'msw'

import { WorkflowUrls }               from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import {
  mockGetActionDefinitionsResult,
  mockGetStepsByIdResult
} from './__tests__/fixtures'

import { WorkflowPanel } from './index'

jest.mock('./WorkflowCanvas', () => (
  () => <div data-testid={'WorkflowCanvasTestId'} />
))


describe('WorkflowPanel', () => {
  const mockWorkflowId = 'mock-workflow-id'
  const spyGetStepsFn = jest.fn()
  const spyGetDefinitionFn = jest.fn()
  const spyGetDefinitionByIdFn = jest.fn()

  beforeEach(() => {
    spyGetStepsFn.mockClear()
    spyGetDefinitionFn.mockClear()
    spyGetDefinitionByIdFn.mockClear()

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
      )
    )
  })

  it('should render WorkflowPanel correctly', async () => {
    render(<Provider><WorkflowPanel workflowId={mockWorkflowId} /></Provider>)

    await waitFor(() => expect(spyGetStepsFn).toHaveBeenCalled())
    await waitFor(() => expect(spyGetDefinitionFn).toHaveBeenCalled())
    await screen.findByTestId('WorkflowCanvasTestId')
  })
})
