/* eslint-disable max-len */
import { useReducer } from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                         from '@acx-ui/feature-toggle'
import { policyApi }                                      from '@acx-ui/rc/services'
import { IdentityProviderUrls }                           from '@acx-ui/rc/utils'
import { Provider, store }                                from '@acx-ui/store'
import { mockServer, render, renderHook, screen, within } from '@acx-ui/test-utils'

import { dummyIdenetityPrividerData1, dummyTableResult, newEmptyData } from '../__tests__/fixtures'

import IdentityProviderFormContext, { mainReducer } from './IdentityProviderFormContext'
import NetworkIdentifierForm                        from './NetworkIdentifierForm'


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

jest.mock('./NaiRealm/NaiRealmTable', () => ({
  ...jest.requireActual('./NaiRealm/NaiRealmTable'),
  __esModule: true,
  default: () => <div data-testid={'realm-table'} children={'mockRealmTable'} />
}))

jest.mock('./Plmn/PlmnTable', () => ({
  ...jest.requireActual('./Plmn/PlmnTable'),
  __esModule: true,
  default: () => <div data-testid={'plmn-table'} children={'mockPlmnTable'} />
}))

jest.mock('./RoamConsortiumOi/RoamConsortiumOiTable', () => ({
  ...jest.requireActual('./RoamConsortiumOi/RoamConsortiumOiTable'),
  __esModule: true,
  default: () => <div data-testid={'roi-table'} children={'mockRoiTable'} />
}))

describe('Identity Provider Form - NetworkIdentifierForm', () => {

  beforeEach(async () => {
    store.dispatch(policyApi.util.resetApiState())

    mockServer.use(
      rest.post(
        IdentityProviderUrls.getIdentityProviderList.url,
        (_, res, ctx) => res(ctx.json(dummyTableResult))
      ),
      rest.get(
        IdentityProviderUrls.getPreconfiguredIdentityProvider.url,
        (_, res, ctx) => res(ctx.json([{
          name: 'Preconfigured Provider1'

        }, {
          name: 'Preconfigured Provider2'
        }]))
      )
    )
  })

  it('Render component successfully', async () => {
    const { renderElement } = renderInitState(
      (<NetworkIdentifierForm />), dummyIdenetityPrividerData1
    )
    render(renderElement)

    const nameInput = await screen.findByRole('textbox', { name: /Profile Name/ })
    expect(nameInput).toBeVisible()
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'HS20 Identity Provider 100')

    expect(screen.getByTestId('realm-table')).toBeInTheDocument()
    expect(screen.getByTestId('plmn-table')).toBeInTheDocument()
    expect(screen.getByTestId('roi-table')).toBeInTheDocument()
  })

  it('Render PreconfiguredIdpsDropdown component successfully', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.PRECONFIGURED_HS20_IDP_TOGGLE)
    const { renderElement } = renderInitState(
      (<NetworkIdentifierForm />), dummyIdenetityPrividerData1
    )
    render(renderElement)

    expect(await screen.findByText('Provider Settings')).toBeVisible()
    const btn = await screen.findByRole('button', { name: /Import from Identity Provider/ })
    expect(btn).toBeVisible()
    await userEvent.click(btn)

    const menu = await screen.findByRole('menu')
    expect(await within(menu).findByRole('menuitem',{ name: /Preconfigured Provider1/ })).toBeInTheDocument()
    expect(await within(menu).findByRole('menuitem',{ name: /Preconfigured Provider2/ })).toBeInTheDocument()
  })
})

