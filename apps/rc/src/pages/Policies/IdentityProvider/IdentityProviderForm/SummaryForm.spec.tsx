import { useReducer } from 'react'

import { rest } from 'msw'

import { policyApi }                                       from '@acx-ui/rc/services'
import { AaaUrls }                                         from '@acx-ui/rc/utils'
import { Provider, store }                                 from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import {
  dummayAccounting,
  dummyAuthRadius,
  dummyIdenetityPrividerData1,
  dummyIdenetityPrividerData2,
  mockAuthRadiusId,
  newEmptyData
} from '../__tests__/fixtures'

import IdentityProviderFormContext, { mainReducer } from './IdentityProviderFormContext'
import SummaryForm                                  from './SummaryForm'


const renderInitState = (children: JSX.Element, initState=newEmptyData) => {
  const { result } = renderHook(() => useReducer(mainReducer, initState ))
  const [state, dispatch] = result.current

  const renderElement = (
    <Provider>
      <IdentityProviderFormContext.Provider value={{ state, dispatch }}>
        {children}
      </IdentityProviderFormContext.Provider>
    </Provider>
  )

  return {
    state, dispatch, renderElement
  }
}

describe('Identity Provider Form - SummaryForm', () => {

  beforeEach(async () => {
    store.dispatch(policyApi.util.resetApiState())

    mockServer.use(
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
      (<SummaryForm />), dummyIdenetityPrividerData1
    )
    render(renderElement)

    // profile name
    expect(await screen.findByText('HS20 Identity Provider 1')).toBeVisible()
    // NAI Realm
    expect(screen.queryByText('abc.com (1 EAP methods)')).toBeVisible()
    // PLMN
    expect(screen.queryByText('001 001')).toBeVisible()
    // Roaming Consortium
    expect(screen.queryByText('roi1 (1a2b3c4d5e)')).toBeVisible()
    // Authentication Service
    await waitFor(() => {
      expect(screen.queryByText('auth-1')).toBeVisible()
    })
    expect(screen.queryByText('192.168.0.101: 1812')).toBeVisible()
    // Accounting Service
    await waitFor(() => {
      expect(screen.queryByText('accounting-1')).toBeVisible()
    })
    expect(screen.queryByText('192.168.0.201: 1813')).toBeVisible()
  })

  it('Render component successfully without accounting service', async () => {
    const { renderElement } = renderInitState(
      (<SummaryForm />), dummyIdenetityPrividerData2
    )
    render(renderElement)

    // profile name
    expect(await screen.findByText('HS20 Identity Provider 2')).toBeVisible()
    // NAI Realm
    expect(screen.queryByText('xyz.com (0 EAP methods)')).toBeVisible()
    // Authentication Service
    await waitFor(() => {
      expect(screen.queryByText('auth-1')).toBeVisible()
    })
    expect(screen.queryByText('192.168.0.101: 1812')).toBeVisible()
    // Accounting Service
    expect(screen.queryByText('Disabled')).toBeVisible()
  })

})