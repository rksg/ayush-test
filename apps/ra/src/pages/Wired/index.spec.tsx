import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import Wired, { AISwitchTabsEnum } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('./SwitchList', () => ({
  SwitchList: () => <div>Switch list content</div>
}))

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid='report'></div>
}))
describe('Clients', () => {
  it('should render switches list tab', async () => {
    render(<Wired tab={AISwitchTabsEnum.SWITCH_LIST}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Switch List')).toBeVisible()
    expect(await screen.findByText('Switch list content')).toBeVisible()
    expect(await screen.findByText('Last 24 Hours')).toBeVisible()
  })
  it('should handle wired report tab click', async () => {
    render(<Wired tab={AISwitchTabsEnum.SWITCH_LIST}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Wired Report'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/ai/devices/switch/reports/wired', hash: '', search: ''
    })
  })
})