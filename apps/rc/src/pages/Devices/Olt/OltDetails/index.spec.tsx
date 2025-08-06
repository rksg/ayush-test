import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo }               from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { screen, render, mockServer } from '@acx-ui/test-utils'

import { OltDetails } from './index'

jest.mock('./OltOverviewTab', () => ({
  OltOverviewTab: () => <div data-testid={'OltOverviewTab'} />
}))
jest.mock('./OltNetworkCardTab', () => ({
  OltNetworkCardTab: () => <div data-testid={'OltNetworkCardTab'} />
}))
jest.mock('./OltLineCardTab', () => ({
  OltLineCardTab: () => <div data-testid={'OltLineCardTab'} />
}))

const params = {
  tenantId: 'tenant-id',
  oltId: 'olt-id'
}

describe('OltDetails', ()=>{ //TODO
  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json([]))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider>
      <OltDetails />
    </Provider>, {
      route: { params }
    })
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByTestId('OltOverviewTab')).toBeInTheDocument()
    await userEvent.click(screen.getByText(/Network Card/))
    expect(screen.getByTestId('OltNetworkCardTab')).toBeInTheDocument()
  })

})
