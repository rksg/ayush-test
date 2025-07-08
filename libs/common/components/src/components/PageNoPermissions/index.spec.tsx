import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { BrowserRouter as Router } from '@acx-ui/react-router-dom'
import { screen, render }          from '@acx-ui/test-utils'

import { PageNoPermissions } from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('PageNoPermissions', () => {
  it('should render correctly', async () => {
    render(
      <Router><PageNoPermissions /></Router>
    )
    expect(await screen.findByText(/Sorry, you don’t have permissions to view this page/))
      .toBeVisible()
    await userEvent.click(await screen.findByText(/Go Back/))
    expect(mockedUsedNavigate).toHaveBeenCalled()
  })
})
