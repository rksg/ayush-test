import '@testing-library/jest-dom'

import { Provider }                           from '@acx-ui/store'
import { render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'

import ApTabs from './ApTabs'

const params= { apId: 'ap-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('ApTabs', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <ApTabs/>
    </Provider>, { route: { params } })
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })

  it('should handle tab changes', async () => {
    render(<Provider>
      <ApTabs/>
    </Provider>, { route: { params } })
    await waitFor(() => screen.findByText('Reports'))
    fireEvent.click(await screen.findByText('Reports'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/ai/devices/wifi/${params.apId}/details/reports`,
      hash: '',
      search: ''
    })
  })
})
