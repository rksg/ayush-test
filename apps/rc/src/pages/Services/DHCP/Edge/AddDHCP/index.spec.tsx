import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeDhcpUrls } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  fireEvent, mockServer, render,
  screen
} from '@acx-ui/test-utils'

import AddDhcp from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('AddEdgeDhcp', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        EdgeDhcpUrls.addDhcpService.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('should create AddEdgeDhcp successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <AddDhcp />
      </Provider>, {
        route: { params, path: '/:tenantId/services/dhcp/create' }
      })
    await screen.findByRole('textbox', { name: /primary dns server/i })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should be blcoked when required field is empty', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddDhcp/>
      </Provider>, {
        route: { params, path: '/:tenantId/services/dhcp/create' }
      })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await screen.findByText('Please enter Service Name')
  })

  it('should add edge dhcp successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddDhcp />
      </Provider>, {
        route: { params, path: '/:tenantId/services/dhcp/create' }
      })
    const serviceNameInput = screen.getByRole('textbox', { name: /service name/i })
    fireEvent.change(serviceNameInput, { target: { value: 'myTest' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
  })


  it('should show show external server setting successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddDhcp />
      </Provider>, { route: { params } }
    )

    const toggle = screen.getByRole('switch')
    await user.click(toggle)
    expect(toggle).toBeChecked()

    await screen.findByText('FQDN Name or IP Address')
  })
})

describe('AddEdgeDhcp api fail', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        EdgeDhcpUrls.addDhcpService.url,
        (req, res, ctx) => res(ctx.status(400), ctx.json(null))
      )
    )
  })

  it('should add edge dhcp successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddDhcp />
      </Provider>, {
        route: { params, path: '/:tenantId/services/dhcp/create' }
      })
    const serviceNameInput = screen.getByRole('textbox', { name: /service name/i })
    fireEvent.change(serviceNameInput, { target: { value: 'myTest' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await screen.findByText('An error occurred')
  })
})