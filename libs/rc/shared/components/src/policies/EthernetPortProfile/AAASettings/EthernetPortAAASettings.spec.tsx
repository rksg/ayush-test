import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { policyApi }                                from '@acx-ui/rc/services'
import { AaaUrls }                                  from '@acx-ui/rc/utils'
import { Provider, store }                          from '@acx-ui/store'
import { mockServer, render, screen, waitFor }      from '@acx-ui/test-utils'

import {
  dummyAccounting,
  dummyRadiusServiceList,
  dummyAuthRadius,
  mockAuthRadiusId,
  mockAuthRadiusName,
  mockAccuntingRadiusName,
  mockAuthRadSecRadiusId,
  dummyAuthRadSecRadius,
  dummyAccountingRadSecRadius,
  mockAuthRadSecRadiusName,
  mockAccountingRadSecRadiusName
} from '../__tests__/fixtures'

import { EthernetPortAAASettings } from './EthernetPortAAASettings'

describe('EthernetPortProfile AAASetting', () => {

  beforeEach(async () => {
    store.dispatch(policyApi.util.resetApiState())

    mockServer.use(
      rest.post(
        AaaUrls.getAAAPolicyViewModelList.url,
        (_, res, ctx) => res(ctx.json(dummyRadiusServiceList))
      ),
      rest.get(
        AaaUrls.getAAAPolicy.url,
        (req, res, ctx) => {
          const { policyId } = req.params
          return (policyId === mockAuthRadiusId)
            ? res(ctx.json(dummyAuthRadius))
            : res(ctx.json(dummyAccounting))
        }
      )
    )
  })

  it('Render component successfully', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ETHERNET_PORT_SUPPORT_PROXY_RADIUS_TOGGLE)
    render(
      <Provider>
        <Form>
          <EthernetPortAAASettings />
        </Form>
      </Provider>
    )

    const authCombo = await screen.findByRole('combobox')
    await userEvent.click(authCombo)
    await userEvent.click(await screen.findByText(mockAuthRadiusName))
    await waitFor(() => {
      expect(screen.queryByText('192.168.0.100:1812')).toBeVisible()
    })
    expect(screen.queryByText('192.168.0.101:1812')).toBeVisible()

    const enabledAccounting = screen.getByRole('switch', { name: 'Accounting Service' })
    await userEvent.click(enabledAccounting)

    const comboboxes = await screen.findAllByRole('combobox')
    expect(comboboxes.length).toBe(2)

    await userEvent.click(comboboxes[1])
    await userEvent.click(await screen.findByText(mockAccuntingRadiusName))
    await waitFor(() => {
      expect(screen.queryByText('192.168.0.201:1813')).toBeVisible()
    })

    const sharedSecret = await screen.findAllByText('Shared Secret')
    expect(sharedSecret.length).toBe(3)
  })
})

describe('EthernetPortProfile RadSec AAASetting', () => {

  beforeEach(async () => {
    store.dispatch(policyApi.util.resetApiState())

    mockServer.use(
      rest.post(
        AaaUrls.getAAAPolicyViewModelList.url,
        (_, res, ctx) => res(ctx.json(dummyRadiusServiceList))
      ),
      rest.get(
        AaaUrls.getAAAPolicy.url,
        (req, res, ctx) => {
          const { policyId } = req.params
          return (policyId === mockAuthRadSecRadiusId)
            ? res(ctx.json(dummyAuthRadSecRadius))
            : res(ctx.json(dummyAccountingRadSecRadius))
        }
      )
    )
  })

  it('Render component successfully', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.ETHERNET_PORT_SUPPORT_PROXY_RADIUS_TOGGLE ||
      ff === Features.WIFI_RADSEC_TOGGLE)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    render(
      <Provider>
        <Form>
          <EthernetPortAAASettings />
        </Form>
      </Provider>
    )

    const authCombo = await screen.findByRole('combobox')
    await userEvent.click(authCombo)
    await userEvent.click(await screen.findByText(mockAuthRadSecRadiusName))
    await waitFor(() => {
      expect(screen.queryByText('192.168.1.100:2083')).toBeVisible()
    })
    await waitFor(() => {
      const enableAuthProxy = screen.getAllByRole('switch', { name: 'Use Proxy Service' })[0]
      expect(enableAuthProxy).toBeChecked()
    })

    const enabledAccounting = screen.getByRole('switch', { name: 'Accounting Service' })
    await userEvent.click(enabledAccounting)

    const comboboxes = await screen.findAllByRole('combobox')
    expect(comboboxes.length).toBe(2)

    await userEvent.click(comboboxes[1])
    await userEvent.click(await screen.findByText(mockAccountingRadSecRadiusName))
    await waitFor(() => {
      expect(screen.queryByText('192.168.1.101:2083')).toBeVisible()
    })
    await waitFor(() => {
      const enableAccountingProxy = screen.getAllByRole('switch', { name: 'Use Proxy Service' })[1]
      expect(enableAccountingProxy).toBeChecked()
    })

  })
})