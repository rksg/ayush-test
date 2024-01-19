import '@testing-library/jest-dom'

import { Provider }                           from '@acx-ui/store'
import { fireEvent, render, screen, waitFor } from '@acx-ui/test-utils'

import { ApTroubleshootingTab } from '.'


const params = { serialNumber: 'ap-id', tenantId: 'tenant-id' }
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useApContext: () => params
}))
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('./apPacketCaptureForm', () => ({
  ApPacketCaptureForm: () => <div data-testid={'ApPacketCaptureForm'}></div>
}))
jest.mock('./apPingForm', () => ({
  ApPingForm: () => <div data-testid={'ApPingForm'}></div>
}))
jest.mock('./apTraceRouteForm', () => ({
  ApTraceRouteForm: () => <div data-testid={'ApTraceRouteForm'}></div>
}))

describe('ApTroubleshootingTab', () => {
  it('should render correctly', async () => {
    render(
      <Provider>
        <ApTroubleshootingTab />
      </Provider>, { route: { params } })
    expect(await screen.findByTestId('ApPingForm')).toBeVisible()
  })

  it('should handle tab changes', async () => {
    render(<Provider>
      <ApTroubleshootingTab />
    </Provider>, { route: { params } })
    await waitFor(() => screen.findByText('Traceroute'))
    fireEvent.click(await screen.findByText('Traceroute'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/devices/wifi/${params.serialNumber}/details/troubleshooting/traceroute`,
      hash: '',
      search: ''
    })
  })
})
