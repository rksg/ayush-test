import userEvent from '@testing-library/user-event'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { ReportType }   from '@acx-ui/reports/components'
import { Provider }     from '@acx-ui/store'
import {
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

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

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: (props: { reportName: ReportType }) => <div data-testid={props.reportName} />
}))

describe('SwitchList with feature toggle', () => {
  beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(true))
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
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<SwitchList tab={SwitchTabsEnum.LIST}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    userEvent.click(await screen.findByText('Wired Report'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/devices/switch/reports/wired', hash: '', search: ''
    }))
  })
})
