import { Provider } from '@acx-ui/store'
import {
  fireEvent,
  render,
  screen
} from '@acx-ui/test-utils'

import { SwitchDetailsContext } from '..'

import { SwitchConfigurationTab } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./SwitchConfigBackupTable', () => ({
  SwitchConfigBackupTable: () =>
    <div data-testid={'rc-SwitchConfigBackupTable'} title='SwitchConfigBackupTable' />
}))

jest.mock('@acx-ui/rc/components', () => ({
  SwitchConfigHistoryTable: () =>
    <div data-testid={'rc-SwitchConfigHistoryTable'} title='SwitchConfigHistoryTable' />
}))

describe('SwitchConfigurationTab', () => {
  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenantId',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview'
    }
    render(<Provider>
      <SwitchDetailsContext.Provider value={{
        switchDetailsContextData: {},
        setSwitchDetailsContextData: jest.fn()
      }}>
        <SwitchConfigurationTab />
      </SwitchDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab'
      }
    })
    expect(screen.getAllByRole('tab')).toHaveLength(2)
    expect(await screen.findByTestId('rc-SwitchConfigBackupTable')).toBeVisible()
    fireEvent.click(await screen.findByRole('tab', { name: 'History' }))
    expect(await screen.findByTestId('rc-SwitchConfigHistoryTable')).toBeVisible()
  })
})
