import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                   from '@acx-ui/feature-toggle'
import { ClientUrlsInfo, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'


import { clientList, clientMeta, historicalClientList, eventMeta } from '../__tests__/fixtures'

import ClientList from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('ClientList', () => {
  const params = { tenantId: 'tenant-id', activeTab: 'clients' }

  beforeEach(() => {
    mockServer.use(
      rest.post(ClientUrlsInfo.getClientList.url,
        (_, res, ctx) => res(ctx.json({ data: clientList }))
      ),
      rest.post(ClientUrlsInfo.getClientMeta.url,
        (_, res, ctx) => res(ctx.json(clientMeta))
      ),
      rest.post(CommonUrlsInfo.getHistoricalClientList.url,
        (_, res, ctx) => res(ctx.json(historicalClientList))
      ),
      rest.post(CommonUrlsInfo.getEventListMeta.url,
        (_, res, ctx) => res(ctx.json(eventMeta))
      )
    )
  })

  it('should render list correctly', async () => {
    render(
      <Provider>
        <ClientList />
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/:activeTab' }
      })

    // await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    fireEvent.click(await screen.findByRole('tab', { name: 'Guest Pass Credentials' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/users/wifi/guests`,
      hash: '',
      search: ''
    })
  })

  it('should render search response correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <ClientList />
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/:activeTab' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const searchInput = await screen.findByRole('textbox')
    fireEvent.change(searchInput, { target: { value: '11' } })
    const historicalLink = await screen.findByRole('link', { name: /Historical clients/ })
    await userEvent.click(historicalLink)
  })
})
