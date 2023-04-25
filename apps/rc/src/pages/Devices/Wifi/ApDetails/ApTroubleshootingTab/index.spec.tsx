import '@testing-library/jest-dom'

import { Provider }                           from '@acx-ui/store'
import { fireEvent, render, screen, waitFor } from '@acx-ui/test-utils'

import { ApTroubleshootingTab } from '.'


const params = { serialNumber: 'ap-id', tenantId: 'tenant-id' }
jest.mock('../ApContext', () => ({
  useApContext: () => params
}))
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('ApSettingsTab', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <ApTroubleshootingTab />
      </Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should handle tab changes', async () => {
    render(<Provider>
      <ApTroubleshootingTab />
    </Provider>, { route: { params } })
    await waitFor(() => screen.findByText('Traceroute'))
    fireEvent.click(await screen.findByText('Traceroute'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/t/${params.tenantId}/devices/wifi/${params.serialNumber}/details/troubleshooting/traceroute`,
      hash: '',
      search: ''
    })
  })
})
