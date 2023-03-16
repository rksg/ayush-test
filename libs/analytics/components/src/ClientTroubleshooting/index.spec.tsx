import { MemoryRouter, BrowserRouter } from 'react-router-dom'

import { dataApiURL, Provider, store }                                                     from '@acx-ui/store'
import { render, screen, fireEvent, mockGraphqlQuery, waitForElementToBeRemoved, cleanup } from '@acx-ui/test-utils'

import { connectionDetailsByAp, connectionEvents, connectionQualities } from './__tests__/fixtures'
import { DisplayEvent }                                                 from './config'
import { FormattedEvent }                                               from './EventsHistory'
import { api }                                                          from './services'

import { ClientTroubleshooting, getSelectedCallback, getPanelCallback } from './index'

describe('ClientTroubleshootingTab', () => {
  const params = {
    tenantId: 'tenant-id',
    activeTab: 'troubleshooting',
    clientId: 'mac'
  }
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'ClientInfo', {
      data: {
        client: {
          connectionDetailsByAp,
          connectionEvents,
          connectionQualities,
          incidents: []
        }
      }
    })
  })
  afterEach(() => cleanup())
  it('should render loader', () => {
    render(
      <Provider><ClientTroubleshooting clientMac='mac' /></Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(screen.getAllByRole('img', { name: 'loader' })[0]).toBeVisible()
  })
  it('should render error panel when max event error', async () => {
    mockGraphqlQuery(dataApiURL, 'ClientInfo', {
      error: {
        message: 'CTP:MAX_EVENTS_EXCEEDED'
      }
    })
    render(
      <Provider><ClientTroubleshooting clientMac='mac' /></Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByTestId('ct-error-panel')).toBeVisible()

  })
  it('should render correctly without search params', async () => {
    const { asFragment } = render(
      <Provider><ClientTroubleshooting clientMac='mac' /></Provider>,
      {
        route: {
          params,
          path: '/:tenantId/users/wifi/clients/:clientId/details/:activeTab'
        }
      }
    )
    expect(await screen.findByTestId('history-collapse')).toBeVisible()
    const fragment = asFragment()
    const charts = fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
    expect(charts).toHaveLength(4)
  })
  it('should render correctly with search params', async () => {
    const { asFragment } = render(
      <MemoryRouter initialEntries={[{
        pathname: '/:tenantId/users/wifi/user-Id/details/troubleshooting',
        // eslint-disable-next-line max-len
        search: '?clientTroubleShootingSelections=%257B%2522category%2522%253A%255B%255B%2522performance%2522%255D%252C%255B%2522Infrastructure%2522%255D%255D%257D'
      }]}>
        <Provider><ClientTroubleshooting clientMac='mac' /></Provider>
      </MemoryRouter>
    )
    expect(await screen.findByTestId('history-collapse')).toBeVisible()
    const fragment = asFragment()
    const charts = fragment.querySelectorAll('div[_echarts_instance_]')
    expect(charts).toHaveLength(4)
  })
  it('should handle history button toggle', async () => {
    render(
      <MemoryRouter initialEntries={[{
        pathname: '/:tenantId/users/wifi/user-Id/details/troubleshooting',
        // eslint-disable-next-line max-len
        search: '?clientTroubleShootingSelections=%257B%2522category%2522%253A%255B%255B%2522performance%2522%255D%252C%255B%2522Infrastructure%2522%255D%255D%257D'
      }]}>
        <Provider><ClientTroubleshooting clientMac='mac' /></Provider>
      </MemoryRouter>
    )
    fireEvent.click(await screen.findByTestId('history-collapse'))
    expect(await screen.findByText('History')).toBeVisible()
    fireEvent.click(await screen.findByText('History'))
    expect(await screen.findByTestId('history-collapse')).toBeVisible()
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
        <Provider><ClientTroubleshooting clientMac='mac' /></Provider>
      </BrowserRouter>
    )
    await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByText('All Categories')

    const selectionInput = await screen.findAllByRole('combobox')
    fireEvent.mouseDown(selectionInput[0])
    fireEvent.click(await screen.findByText('Performance'))
    fireEvent.click(await screen.findByText('Apply'))
    const fragment = asFragment()
    const charts = fragment.querySelectorAll('div[_echarts_instance_]')
    expect(charts).toHaveLength(4)
  })

  describe('getSelectedEvent', () => {
    it('should return true for matching selected events', () => {
      const popoverVal = getSelectedCallback(
        true,
        false,
        { key: 'test' } as DisplayEvent,
        { event: { key: 'test' } }as unknown as FormattedEvent
      )
      expect(popoverVal()).toBeTruthy()

      const visibleVal = getSelectedCallback(
        false,
        true,
        { key: 'test' } as DisplayEvent,
        { event: { key: 'test' } }as unknown as FormattedEvent
      )
      expect(visibleVal()).toBeTruthy()
    })

    it('should return true for non-matching selected events', () => {
      const val = getSelectedCallback(
        true,
        true,
        { key: 'no-test' } as DisplayEvent,
        { event: { key: 'test' } }as unknown as FormattedEvent
      )
      expect(val()).toBeFalsy()
    })

    it('should return false for false visible', () => {
      const val = getSelectedCallback(
        false,
        false,
        { key: 'test' } as DisplayEvent,
        { event: { key: 'test' } }as unknown as FormattedEvent
      )
      expect(val()).toBeFalsy()
    })
  })

  describe('onPanelClick', () => {
    it('should return callback', () => {
      const setEventState = jest.fn()
      const setVisible = jest.fn()
      const item = {
        start: 124, date: '21-02-2022', description: 'test', event: { key: 'test' }
      } as unknown as FormattedEvent
      const onClick = getPanelCallback(item, setEventState, setVisible)
      expect(onClick).toBeInstanceOf(Function)
      onClick(true)
      expect(setVisible).toBeCalledWith(true)
      expect(setEventState).toBeCalledWith(item.event)
      onClick(false)
      expect(setVisible).toBeCalledWith(false)
      expect(setEventState).toBeCalledWith(item.event)
    })
  })
})