import '@testing-library/jest-dom'

import { Provider }                           from '@acx-ui/store'
import { render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'

import {
  apDetailData
} from './__tests__/fixtures'
import ApTabs from './ApTabs'

const params = { serialNumber: 'ap-id', tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('ApTabs', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider>
      <ApTabs apDetail={apDetailData} />
    </Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should handle tab changes', async () => {
    render(<Provider>
      <ApTabs apDetail={apDetailData} />
    </Provider>, { route: { params } })
    await waitFor(() => screen.findByText('Clients (1)'))
    fireEvent.click(await screen.findByText('Clients (1)'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/aps/${params.serialNumber}/details/clients`,
      hash: '',
      search: ''
    })
  })
})
