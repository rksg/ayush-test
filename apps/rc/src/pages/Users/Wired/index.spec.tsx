
import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { WiredClientList, WiredTabsEnum } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/switch/components', () => ({
  ...jest.requireActual('@acx-ui/switch/components'),
  SwitchClientsTable: () => <div data-testid='SwitchClientsTable' />
}))

jest.mock('@acx-ui/wifi/components', () => ({
  ApWiredClientTable: () => <div data-testid='ApWiredClientTable' />
}))

const utils = require('@acx-ui/utils')

describe('WiredClientList', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  jest.spyOn(utils, 'usePollingTableQuery').mockImplementation(() => {
    return { data: [], page: 1, totalCount: 0 }
  })

  it('should render switch wired client tab', async () => {
    render(<WiredClientList tab={WiredTabsEnum.SWITCH_CLIENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })

    expect(await screen.findByTestId('SwitchClientsTable')).toBeVisible()
    expect(await screen.findByRole('tab', {
      name: /Switch Clients \(0\)/i
    })).toBeVisible()

  })
  it('should render ap wired client tab', async () => {
    render(<WiredClientList tab={WiredTabsEnum.AP_CLIENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })

    expect(await screen.findByTestId('ApWiredClientTable')).toBeVisible()
    expect(await screen.findByRole('tab', {
      name: /AP Clients \(0\)/i
    })).toBeVisible()
  })
})