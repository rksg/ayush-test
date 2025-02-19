
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                              from '@acx-ui/feature-toggle'
import { WorkflowUrls, Workflow, NewAPITableResult } from '@acx-ui/rc/utils'
import { Provider }                                  from '@acx-ui/store'
import { mockServer, render, screen }                from '@acx-ui/test-utils'

import { WorkflowForm } from '.'

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

describe('WorkflowForm', () => {
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        replacePagination(WorkflowUrls.searchInProgressWorkflows.url),
        (req, res, ctx) => {
          return res(ctx.json(list))
        }
      )
    )
  })

  it('should render correctly for creating workflow', async () => {
    render(<Provider>
      <Form
        preserve={false}
        layout={'vertical'}
        name={'workflowForm'}
      >
        <WorkflowForm isEdit={false}/>
      </Form>
    </Provider>)
    // eslint-disable-next-line max-len
    await screen.findByText('Entering a name and clicking the Next button, automatically creates a draft version of your workflow.')
    const nameField = await screen.findByLabelText('Workflow Name')
    await userEvent.type(nameField, 'new flow')
    const descriptionField = await screen.findByLabelText('Description')
    await userEvent.type(descriptionField, 'new description')
  })


  it('should render correctly for edit workflow', async () => {
    render(<Provider>
      <Form
        preserve={false}
        layout={'vertical'}
        name={'workflowForm'}
      >
        <WorkflowForm
          isEdit
          policyId={workflows[0].id}
        />
      </Form>
    </Provider>)

    const nameField = await screen.findByLabelText('Workflow Name')
    await userEvent.type(nameField, 'new flow')
    const descriptionField = await screen.findByLabelText('Description')
    await userEvent.type(descriptionField, 'new description')
  })
})
