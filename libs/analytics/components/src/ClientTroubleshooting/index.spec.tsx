import { MemoryRouter, BrowserRouter } from 'react-router-dom'

import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { ClientTroubleshooting } from './index'

describe('ClientTroubleshootingTab', () => {
  it('should render correctly with out search params', async () => {
    const params = {
      tenantId: 'tenant-id',
      activeTab: 'troubleshooting',
      clientId: 'mac'
    }
    const { asFragment } = render(
      <Provider><ClientTroubleshooting clientMac='mac' /></Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByTestId('ArrowExpand')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly with search params', async () => {
    const { asFragment } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/:tenantId/users/wifi/user-Id/details/troubleshooting',
        // eslint-disable-next-line max-len
        search: '?clientTroubleShootingSelections=%257B%2522category%2522%253A%255B%255B%2522performance%2522%255D%252C%255B%2522Infrastructure%2522%255D%255D%257D'
      }]}>
        <ClientTroubleshooting clientMac='mac' />
      </MemoryRouter>
    )
    expect(await screen.findByTestId('ArrowExpand')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
  it('should handle history button toggle', async () => {
    render(
      <MemoryRouter initialEntries={[{
        pathname: '/:tenantId/users/wifi/user-Id/details/troubleshooting',
        // eslint-disable-next-line max-len
        search: '?clientTroubleShootingSelections=%257B%2522category%2522%253A%255B%255B%2522performance%2522%255D%252C%255B%2522Infrastructure%2522%255D%255D%257D'
      }]}>
        <ClientTroubleshooting clientMac='mac' />
      </MemoryRouter>
    )
    fireEvent.click(await screen.findByTestId('ArrowExpand'))
    expect(await screen.findByText('History')).toBeVisible()
    fireEvent.click(await screen.findByText('History'))
    expect(await screen.findByTestId('ArrowExpand')).toBeVisible()
  })
  it('should set search param on option selection', async () => {
    const location = {
      ...window.location
    }
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location
    })
    const { asFragment } = render(
      <BrowserRouter window={window}>
        <ClientTroubleshooting clientMac='mac' />
      </BrowserRouter>
    )
    await screen.findByText('All Categories')

    const selectionInput = await screen.findAllByRole('combobox')
    fireEvent.mouseDown(selectionInput[0])
    fireEvent.click(await screen.findByText('Performance'))
    fireEvent.click(await screen.findByText('Apply'))
    expect(asFragment()).toMatchSnapshot()
  })
})