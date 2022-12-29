import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { NetworkHealthPage } from '.'

const params = { tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Network Health', () => {
  it('should render page correctly', async () => {
    render(
      <Provider>
        <NetworkHealthPage />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findByText('Network Health')).toBeVisible()
    expect(await screen.findByText('Service Validation')).toBeVisible()

  })

  it('should change to details tab correctly', async () => {
    render(
      <Provider>
        <NetworkHealthPage />
      </Provider>,
      { route: { params } }
    )
    await userEvent.click(screen.getByText('Details'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/serviceValidation/networkHealth/tab/details`,
      hash: '',
      search: ''
    })
  })
  it('should change to progress tab correctly', async () => {
    render(
      <Provider>
        <NetworkHealthPage />
      </Provider>,
      { route: { params } }
    )
    await userEvent.click(screen.getByText('Progress'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/serviceValidation/networkHealth/tab/progress`,
      hash: '',
      search: ''
    })
  })
})
