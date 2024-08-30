import userEvent                                         from '@testing-library/user-event'
import { History, Action }                               from 'history'
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { render, screen } from '@acx-ui/test-utils'

import { ClientTab } from '.'


jest.mock('@acx-ui/rc/components', () => ({
  ClientDualTable: ({ clientMac }: { clientMac?: string }) => (
    <div data-testid={'clientDualTable'}>{clientMac}</div>
  )
}))

jest.mock('./CCD', () => ({
  ClientConnectionDiagnosis: () => <div data-testid={'clientConnectionDiagnosis'}></div>
}))

describe('ClientTab', () => {
  const params = {
    tenantId: 'f378d3ba5dd44e62bacd9b625ffec681'
  }
  const mockNavigator: History = {
    replace: jest.fn(),
    push: jest.fn(),
    go: jest.fn(),
    createHref: jest.fn(),
    action: Action.Pop,
    location: {
      state: undefined,
      key: '',
      pathname: '',
      search: '',
      hash: ''
    },
    back: jest.fn(),
    forward: jest.fn(),
    listen: jest.fn(),
    block: jest.fn()
  }

  it('should render correctly', async () => {
    render(
      <NavigationContext.Provider value={{}}>
        <ClientTab />
      </NavigationContext.Provider>
    )
    expect(await screen.findByTestId('clientDualTable')).toBeVisible()
  })

  it('should show the ContentSwitcher when the CCD feature flag is turned ON', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(
      <NavigationContext.Provider value={{ navigator: mockNavigator }}>
        <ClientTab />
      </NavigationContext.Provider>
    )

    //await userEvent.click(await screen.findByRole('radio', { name: 'Diagnostics' }))
    //expect(await screen.findByTestId('clientConnectionDiagnosis')).toBeVisible()

    await userEvent.click(await screen.findByRole('radio', { name: 'Wireless Clients' }))
    expect(await screen.findByTestId('clientDualTable')).toBeVisible()

  })

  it('should render list correctly(clientMac from path params)', async () => {
    render( <NavigationContext.Provider value={{}}>
      <ClientTab />
    </NavigationContext.Provider>, {
      route: {
        params: { ...params, clientMac: '3C:22:FB:97:C7:EF' },
        path: '/t/:tenantId/users/wifi/clients/search/:clientMac'
      }
    })
    expect(await screen.findByTestId('clientDualTable')).toHaveTextContent('3C:22:FB:97:C7:EF')
  })
})
