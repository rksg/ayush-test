import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import { mockEdgeList } from './__tests__/fixtures'

import { EdgesTable } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge Table', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteEdge.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteEdges.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.patch(
        EdgeUrlsInfo.sendOtp.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeUrlsInfo.reboot.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('should create EdgeList successfully', async () => {
    render(
      <Provider>
        <EdgesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })
    const row = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(row.length).toBe(10)
  })

  it('edge detail page link should be correct', async () => {
    render(
      <Provider>
        <EdgesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })
    const smartEdgeLink = await screen.findByRole('link',
      { name: 'Smart Edge 1' }) as HTMLAnchorElement
    expect(smartEdgeLink.href)
      .toContain(`/${params.tenantId}/t/devices/edge/0000000001/details/overview`)
  })

  it('venue detail page link should be correct', async () => {
    render(
      <Provider>
        <EdgesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })
    const venue1List = await screen.findAllByRole('link', { name: 'Venue 1' })
    const venue1Link = venue1List[0] as HTMLAnchorElement
    expect(venue1Link.href).toContain(`/${params.tenantId}/t/venues/00001/venue-details/overview`)
  })

  it('should go edit page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable rowSelection={{ type: 'checkbox' }}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })
    const row = await screen.findByRole('row', { name: /Smart Edge 2/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge/0000000002/edit/general-settings`,
      hash: '',
      search: ''
    })
  })

  it('edit button will remove when select above 1 row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable rowSelection={{ type: 'checkbox' }}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })
    const row = await screen.findAllByRole('row', { name: /Smart Edge/i })
    await user.click(within(row[0]).getByRole('checkbox'))
    await user.click(within(row[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('should delete selected row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable rowSelection={{ type: 'checkbox' }}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })
    const row = await screen.findByRole('row', { name: /Smart Edge 2/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "Smart Edge 2"?')
    await user.click(screen.getByRole('button', { name: 'Delete SmartEdges' }))
  })

  it('should send OTP sucessfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable rowSelection={{ type: 'checkbox' }}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })
    const row = await screen.findByRole('row', { name: /Smart Edge 2/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Send OTP' }))
    await screen.findByText('Are you sure you want to send OTP?')
    await user.click(screen.getByRole('button', { name: 'OK' }))
  })

  it('should not contains columns configured to be filtered', async () => {
    render(
      <Provider>
        <EdgesTable filterColumns={['venue']}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })

    await screen.findByRole('row', { name: /Smart Edge 2/i })
    expect(screen.queryByRole('columnheader', { name: /Venue/i })).not.toBeInTheDocument()
    expect((await screen.findAllByRole('columnheader')).length).toBe(8)
  })

  it('should delete selected row(multiple)', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable rowSelection={{ type: 'checkbox' }}/>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge' }
      })
    const row2 = await screen.findByRole('row', { name: /Smart Edge 2/i })
    const row3 = await screen.findByRole('row', { name: /Smart Edge 3/i })
    await user.click(within(row2).getByRole('checkbox'))
    await user.click(within(row3).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "2 SmartEdges"?')
    await user.click(screen.getByRole('button', { name: 'Delete SmartEdges' }))
  })

  it('should reboot the selected SmartEdge', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgesTable rowSelection={{ type: 'checkbox' }}/>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge' }
      })
    const row5 = await screen.findByRole('row', { name: /Smart Edge 5/i })
    await user.click(within(row5).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Reboot' }))
    const rebootDialg = await screen.findByRole('dialog')
    await within(rebootDialg).findByText('Reboot "Smart Edge 5"?')
    await user.click(within(rebootDialg).getByRole('button', { name: 'Reboot' }))
  })
})