import '@testing-library/jest-dom'

import { Provider }                           from '@acx-ui/store'
import { render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'

import SwitchTabs from './SwitchTabs'


const params= { switchId: 'switch-id', serial: 'serial-number' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('SwitchTabs', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <SwitchTabs/>
    </Provider>, { route: { params } })
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })

  it('should handle tab changes', async () => {
    render(<Provider>
      <SwitchTabs/>
    </Provider>, { route: { params } })
    await waitFor(() => screen.findByText('Reports'))
    fireEvent.click(await screen.findByText('Reports'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/ai/devices/switch/${params.switchId}/${params.serial}/details/reports`,
      hash: '',
      search: ''
    })
  })
})
