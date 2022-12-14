import { Provider }                           from '@acx-ui/store'
import { render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'

import { NetworkReportTabs } from './NetworkReportTabs'

const params = { tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('NetworkReportTabs', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <NetworkReportTabs />
      </Provider>,
      { route: { params } }
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('should handle tab changes', async () => {
    render(<Provider>
      <NetworkReportTabs />
    </Provider>, { route: { params } })
    await waitFor(() => screen.findByText('Wired'))
    fireEvent.click(await screen.findByText('Wired'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/reports/network/wired`,
      hash: '',
      search: ''
    })
  })
})