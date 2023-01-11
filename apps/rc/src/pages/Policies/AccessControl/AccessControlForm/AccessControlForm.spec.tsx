import { Form } from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import AccessControlForm from './AccessControlForm'

describe('AccessControlForm Component', () => {
  it('Render AccessControlForm component successfully', async () => {
    render(
      <Provider>
        <Form>
          <AccessControlForm editMode={false}/>
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    const header = screen.getByRole('heading', {
      name: /add access control policy/i
    })

    expect(header).toBeInTheDocument()
  })
})
