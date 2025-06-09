import { useReducer } from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn, useIsTierAllowed }                  from '@acx-ui/feature-toggle'
import { policyApi }                                       from '@acx-ui/rc/services'
import { AaaUrls }                                         from '@acx-ui/rc/utils'
import { Provider, store }                                 from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import {
  dummayAccounting,
  dummayRadiusServiceList,
  dummyAuthRadius,
  mockAuthRadiusId,
  dummyRadSecAccounting,
  dummyRadSecRadiusServiceList,
  dummyRadSecAuthRadius,
  mockRadSecAuthRadiusId,
  newEmptyData
} from '../__tests__/fixtures'

import AaaSettingsForm                              from './AaaSettingsForm'
import IdentityProviderFormContext, { mainReducer } from './IdentityProviderFormContext'


const renderInitState = (children: JSX.Element, initState=newEmptyData) => {
  const { result } = renderHook(() => useReducer(mainReducer, initState ))
  const [state, dispatch] = result.current

  const renderElement = (
    <Provider>
      <IdentityProviderFormContext.Provider value={{ state, dispatch }}>
        <Form>
          {children}
        </Form>
      </IdentityProviderFormContext.Provider>
    </Provider>
  )

  return {
    state, dispatch, renderElement
  }
}

describe('Identity Provider Form - AaaSettingsForm', () => {

  beforeEach(async () => {
    store.dispatch(policyApi.util.resetApiState())

    mockServer.use(
      rest.post(
        AaaUrls.getAAAPolicyViewModelList.url,
        (_, res, ctx) => res(ctx.json(dummayRadiusServiceList))
      ),
      rest.get(
        AaaUrls.getAAAPolicy.url,
        (req, res, ctx) => {
          const { policyId } = req.params
          return (policyId === mockAuthRadiusId)
            ? res(ctx.json(dummyAuthRadius))
            : res(ctx.json(dummayAccounting))
        }
      )
    )
  })

  it('Render component successfully', async () => {
    const { renderElement } = renderInitState(
      (<AaaSettingsForm />)
    )
    render(renderElement)

    const authCombo = await screen.findByRole('combobox')
    await userEvent.click(authCombo)
    await userEvent.click(await screen.findByText('auth-1'))
    await waitFor(() => {
      expect(screen.queryByText('192.168.0.100:1812')).toBeVisible()
    })
    expect(screen.queryByText('192.168.0.101:1812')).toBeVisible()

    const enabledAccounting = await screen.findByRole('switch')
    await userEvent.click(enabledAccounting)

    const comboboxes = await screen.findAllByRole('combobox')
    expect(comboboxes.length).toBe(2)

    await userEvent.click(comboboxes[1])
    await userEvent.click(await screen.findByText('accounting-1'))
    await waitFor(() => {
      expect(screen.queryByText('192.168.0.201:1813')).toBeVisible()
    })

    const sharedSecret = await screen.findAllByText('Shared Secret')
    expect(sharedSecret.length).toBe(3)
  })
})

describe('Identity Provider Form - AaaSettingsForm - RadSec', () => {

  beforeEach(async () => {
    store.dispatch(policyApi.util.resetApiState())

    mockServer.use(
      rest.post(
        AaaUrls.queryAAAPolicyList.url,
        (_, res, ctx) => res(ctx.json(dummyRadSecRadiusServiceList))
      ),
      rest.get(
        AaaUrls.getAAAPolicy.url,
        (req, res, ctx) => {
          const { policyId } = req.params
          return (policyId === mockRadSecAuthRadiusId)
            ? res(ctx.json(dummyRadSecAuthRadius))
            : res(ctx.json(dummyRadSecAccounting))
        }
      )
    )

    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
  })

  it('Render component successfully', async () => {
    const { renderElement } = renderInitState(
      (<AaaSettingsForm />)
    )
    render(renderElement)

    const authCombo = await screen.findByRole('combobox')
    await userEvent.click(authCombo)
    await userEvent.click(await screen.findByText('radSec-auth-1'))
    await waitFor(() => {
      expect(screen.queryByText('192.168.1.100:2083')).toBeVisible()
    })
    expect(screen.queryByText('On')).toBeVisible()

    const enabledAccounting = await screen.findByRole('switch')
    await userEvent.click(enabledAccounting)

    const comboboxes = await screen.findAllByRole('combobox')
    expect(comboboxes.length).toBe(2)

    await userEvent.click(comboboxes[1])
    await userEvent.click(await screen.findByText('radSec-accounting-1'))
    await waitFor(() => {
      expect(screen.queryByText('192.168.1.201:2083')).toBeVisible()
    })
  })
})