import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { render, screen, within } from '@acx-ui/test-utils'

import { ReportList } from '.'

const mockedUseNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate
}))

describe('ReportList', () => {
  const path = '/:tenantId/t'
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }

  it('should render correctly', () => {
    render(<ReportList />, { route: { path, params } })
    expect(screen.getByText('Reports')).toBeVisible()
    expect(screen.getByText('Overview')).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(<ReportList />, { route: { path, params } })
    expect(await screen.findByText('Business Insights')).toBeVisible()
  })

  it('should route to report when card is clicked', async () => {
    render(<ReportList />, { route: { path, params } })
    // eslint-disable-next-line testing-library/no-node-access
    const card = screen.getByText('Overview').parentElement
    await userEvent.click(within(card!).getByRole('button'))
    expect(mockedUseNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/reports/overview`,
      hash: '',
      search: ''
    })
  })
})
