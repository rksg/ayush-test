import userEvent from '@testing-library/user-event'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { ReportType }   from '@acx-ui/reports/components'
import { Provider }     from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import useEdgeNokiaOltTable from '../Edge/Olt/OltTable'

import { SwitchTabsEnum } from '.'
import { SwitchList }     from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./SwitchesTable', () => ({
  ...jest.requireActual('./SwitchesTable'),
  __esModule: true,
  default: () => ({
    title: 'SwitchesTable',
    headerExtra: [],
    component: <div data-testid='SwitchesTable' />
  })
}))

jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  NetworkFilter: () => <div data-testid='NetworkFilter' />
}))

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: (props: { reportName: ReportType }) => <div data-testid={props.reportName} />
}))

jest.mock('../Edge/Olt/OltTable', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(undefined)
}))
describe('SwitchList with feature toggle', () => {
  beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(false))
  it('should render switch list tab', async () => {
    render(<SwitchList tab={SwitchTabsEnum.LIST}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId('SwitchesTable')).toBeVisible()
  })
  it('should render wired report tab', async () => {
    render(<SwitchList tab={SwitchTabsEnum.WIRED_REPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByTestId(ReportType.WIRED)).toBeVisible()
  })
  it('should handle tab click', async () => {
    render(<SwitchList tab={SwitchTabsEnum.LIST}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Wired Report'))
    // await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
    //   pathname: '/tenant-id/t/devices/switch/reports/wired', hash: '', search: ''
    // }))
  })

  it('should not have optical tab when hook return empty', async () => {
    render(<SwitchList tab={SwitchTabsEnum.LIST}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await screen.findByRole('tab', { name: 'Wired Report' })
    screen.getByRole('tab', { name: 'SwitchesTable' })
    expect(screen.queryAllByRole('tab')).toHaveLength(2)
  })

  it('should have optical tab', async () => {
    jest.mocked(useEdgeNokiaOltTable).mockReturnValue({
      title: 'Olt_tab',
      headerExtra: [],
      component: <div data-testid='OltTable' />
    })
    render(<SwitchList tab={SwitchTabsEnum.OPTICAL}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })

    await screen.findByRole('tab', { name: 'Olt_tab' })
    expect(await screen.findByText('Wired Devices')).toBeVisible()
  })
})
