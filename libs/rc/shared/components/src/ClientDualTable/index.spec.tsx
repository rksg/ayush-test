import { rest } from 'msw'

import { useIsSplitOn }                                                     from '@acx-ui/feature-toggle'
import { ClientUrlsInfo, CommonUrlsInfo }                                   from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ClientDualTable } from './index'

describe('ClientDualTable', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(true) // mock Features.USERS
  const params = {
    tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
    venueId: '4c778ed630394b76b17bce7fe230cf9f'
  }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        ClientUrlsInfo.getClientList.url,
        (req, res, ctx) => res(ctx.json({
          totalCount: 0, page: 1, data: []
        }))
      ),
      rest.post(
        CommonUrlsInfo.getHistoricalClientList.url,
        (req, res, ctx) => res(ctx.json({
          totalCount: 0, page: 1, data: []
        }))
      ),
      rest.post(
        ClientUrlsInfo.getClientMeta.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      ),
      rest.post(
        CommonUrlsInfo.getEventListMeta.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
  })

  it('should render list correctly', async () => {
    render(<Provider><ClientDualTable /></Provider>, {
      route: { params, path: '/t/:tenantId/users/wifi/clients' }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByPlaceholderText('Search for connected and historical clients...')

    fireEvent.mouseEnter(screen.getByTestId('QuestionMarkCircleOutlined'))
    await screen.findByText('You can search for clients', { exact: false })
  })

  it('should search correctly', async () => {
    render(<Provider><ClientDualTable /></Provider>, {
      route: { params, path: '/t/:tenantId/venues/:venueId/venue-details/clients' }
    })

    const input =
      await screen.findByPlaceholderText('Search for connected and historical clients...')

    input.focus()
    fireEvent.change(input, { target: { value: 'a' } })
    fireEvent.change(input, { target: { value: 'aa' } })

    expect(await screen.findByText('Search Results', { exact: false })).toBeVisible()
  })
})
