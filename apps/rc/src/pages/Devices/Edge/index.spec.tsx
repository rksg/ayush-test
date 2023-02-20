import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer, render,
  screen, within
} from '@acx-ui/test-utils'

import { mockEdgeList } from './__tests__/fixtures'


import EdgeList from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('EdgeList', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
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
      )
    )
  })

  it('feature flag off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <EdgeList />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/list' }
      })
    await screen.findByText('SmartEdge is not enabled')
  })

  it('should create EdgeList successfully', async () => {
    render(
      <Provider>
        <EdgeList />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/list' }
      })
    const row = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(row.length).toBe(5)
  })

  it('edge detail page link should be correct', async () => {
    render(
      <Provider>
        <EdgeList />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/list' }
      })
    const smartEdgeLink = await screen.findByRole('link',
      { name: 'Smart Edge 1' }) as HTMLAnchorElement
    expect(smartEdgeLink.href)
      .toContain(`/t/${params.tenantId}/devices/edge/0000000001/edge-details/overview`)
  })

  it('venue detail page link should be correct', async () => {
    render(
      <Provider>
        <EdgeList />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/list' }
      })
    const venue1List = await screen.findAllByRole('link', { name: 'Venue 1' })
    const venue1Link = venue1List[0] as HTMLAnchorElement
    expect(venue1Link.href).toContain(`/t/${params.tenantId}/venues/00001/venue-details/overview`)
  })

  it('should go edit page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeList />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/list' }
      })
    const row = await screen.findByRole('row', { name: /Smart Edge 1/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/edge/0000000001/edit/general-settings`,
      hash: '',
      search: ''
    })
  })

  it('edit button will remove when select above 1 row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeList />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/list' }
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
        <EdgeList />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/list' }
      })
    const row = await screen.findByRole('row', { name: /Smart Edge 1/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "Smart Edge 1"?')
    await user.click(screen.getByRole('button', { name: 'Delete Edges' }))
  })

  it('should delete selected row(multiple)', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeList />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/list' }
      })
    const row1 = await screen.findByRole('row', { name: /Smart Edge 1/i })
    const row2 = await screen.findByRole('row', { name: /Smart Edge 2/i })
    await user.click(within(row1).getByRole('checkbox'))
    await user.click(within(row2).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "2 Edges"?')
    await user.click(screen.getByRole('button', { name: 'Delete Edges' }))
  })

  it('should send OTP sucessfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeList />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/list' }
      })
    const row = await screen.findByRole('row', { name: /Smart Edge 5/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Send OTP' }))
    await screen.findByText('Are you sure you want to send OTP?')
    await user.click(screen.getByRole('button', { name: 'OK' }))
  })
})
