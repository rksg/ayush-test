import '@testing-library/jest-dom'

import { Provider }                           from '@acx-ui/store'
import { fireEvent, render, screen, waitFor } from '@acx-ui/test-utils'

import { EdgeTroubleshooting } from '.'


const params = { serialNumber: 'ap-id', tenantId: 'tenant-id' }
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useParams: () => params
}))
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('./edgePingForm', () => ({
  EdgePingForm: () => <div data-testid={'EdgePingForm'}></div>
}))
jest.mock('./edgeTraceRouteForm', () => ({
  EdgeTraceRouteForm: () => <div data-testid={'EdgeTraceRouteForm'}></div>
}))

describe('EdgeTroubleshooting', () => {
  it('should render correctly', async () => {
    render(
      <Provider>
        <EdgeTroubleshooting />
      </Provider>, { route: { params } })
    expect(await screen.findByTestId('EdgePingForm')).toBeVisible()
  })

  it('should handle tab changes', async () => {
    render(<Provider>
      <EdgeTroubleshooting />
    </Provider>, { route: { params } })
    await waitFor(() => screen.findByText('Traceroute'))
    fireEvent.click(await screen.findByText('Traceroute'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/devices/edge/${params.serialNumber}/details/troubleshooting/traceroute`,
      hash: '',
      search: ''
    })
  })
})
