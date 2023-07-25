import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { apApi, venueApi }                             from '@acx-ui/rc/services'
import { CommonUrlsInfo, getUrlForTest, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                             from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'


import { ApEditContext } from '../..'

import { IpSettings } from './IpSettings'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('AP Network IP settings', () => {
  const params = {
    tenantId: 'tenant-id',
    serialNumber: 'serial-number',
    venueId: 'venue-id'
  }

  const mockStaticIpSettings = {
    ipType: 'STATIC',
    ip: '10.206.78.138',
    netmask: '255.255.254.0',
    gateway: '10.206.79.254',
    primaryDnsServer: '10.10.10.10'
  }

  const mockApViewModel = {
    totalCount: 1,
    page: 1,
    data: [{
      IP: '10.206.78.110',
      apStatusData: {
        APSystem: {
          primaryDnsServer: '10.10.10.10',
          secondaryDnsServer: '10.10.10.254'
        }
      }
    }]
  }

  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  it('should render correctly without AP viewModel and network data', async () => {
    mockServer.use(
      rest.post(
        getUrlForTest(CommonUrlsInfo.getApsList),
        (_, res, ctx) => res(ctx.json(
          {
            totalCount: 1,
            page: 1,
            data: [{ }]
          }
        ))
      ),
      rest.get(
        getUrlForTest(WifiUrlsInfo.getApNetworkSettings),
        (_, res, ctx) => res(ctx.json(null))
      )
    )

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: '',
            isDirty: false,
            hasError: false,
            updateChanges: jest.fn(),
            discardChanges: jest.fn()
          },
          setEditContextData: jest.fn()
        }}>
          <IpSettings />
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/general' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('IP Settings'))

    expect(await screen.findByRole('radio', { name: 'Dynamic' })).toBeChecked()
    expect(await screen.findByRole('radio', { name: 'Static' })).not.toBeChecked()

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

  })

  it('should render correctly without AP network data', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(mockApViewModel))
      ),
      rest.get(
        WifiUrlsInfo.getApNetworkSettings.url,
        (_, res, ctx) => res(ctx.json(null))
      ),
      rest.put(
        WifiUrlsInfo.updateApNetworkSettings.url,
        (_, res, ctx) => res(ctx.json(202))
      )
    )

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: '',
            isDirty: false,
            hasError: false,
            updateChanges: jest.fn(),
            discardChanges: jest.fn()
          },
          setEditContextData: jest.fn()
        }}>
          <IpSettings />
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/general' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('IP Settings'))

    expect(await screen.findByRole('radio', { name: 'Dynamic' })).toBeChecked()
    expect(await screen.findByRole('radio', { name: 'Static' })).not.toBeChecked()

    await userEvent.click(await screen.findByRole('radio', { name: 'Static' }))

    expect(await screen.findByLabelText('IP Address')).toBeVisible()
    await userEvent.type(await screen.findByLabelText('IP Address'), '10.206.78.119')
    await userEvent.type(await screen.findByLabelText('Network Mask'), '255.255.254.0')
    await userEvent.type(await screen.findByLabelText('Gateway'), '10.206.78.254')
    await userEvent.type(await screen.findByLabelText('Primary DNS'), '10.10.10.254')
    await userEvent.type(await screen.findByLabelText('Secondary DNS'), '10.10.10.10')

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
  })

  it('should render correctly with AP network data', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(mockApViewModel))
      ),
      rest.get(
        WifiUrlsInfo.getApNetworkSettings.url,
        (_, res, ctx) => res(ctx.json(mockStaticIpSettings))
      ),
      rest.put(
        WifiUrlsInfo.updateApNetworkSettings.url,
        (_, res, ctx) => res(ctx.json(202))
      )
    )

    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: '',
            isDirty: false,
            hasError: false,
            updateChanges: jest.fn(),
            discardChanges: jest.fn()
          },
          setEditContextData: jest.fn()
        }}>
          <IpSettings />
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/general' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('IP Settings'))

    expect(await screen.findByRole('radio', { name: 'Dynamic' })).not.toBeChecked()
    expect(await screen.findByRole('radio', { name: 'Static' })).toBeChecked()

    expect(await screen.findByLabelText('IP Address')).toBeVisible()

    await userEvent.click(await screen.findByRole('radio', { name: 'Dynamic' }))

    // show view model data when AP IP type is dynamic
    expect(await screen.findByText('10.206.78.110')).toBeVisible()
    expect(await screen.findByText('10.10.10.10')).toBeVisible()
    expect(await screen.findByText('10.10.10.254')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
  })

})
