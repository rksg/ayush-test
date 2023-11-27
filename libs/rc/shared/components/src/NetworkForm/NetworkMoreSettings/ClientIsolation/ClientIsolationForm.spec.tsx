import userEvent        from '@testing-library/user-event'
import { Form }         from 'antd'
import { FormInstance } from 'antd/es/form/Form'
import { rest }         from 'msw'

import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { ClientIsolationUrls, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import NetworkFormContext from '../../NetworkFormContext'

import {
  mockedVenues,
  mockedClientIsolationList,
  mockedTenantId,
  mockedNetworkVenue
} from './__tests__/fixtures'
import ClientIsolationForm from './ClientIsolationForm'

async function enableClientIsolation () {
  const clientIsolationContainer = await screen.findByText(/Client Isolation/)
  await userEvent.click(within(clientIsolationContainer).getByRole('switch'))
  const allowListContainer = await screen.findByText(/Client Isolation Allowlist by Venue/)
  await userEvent.click(within(allowListContainer).getByRole('switch'))
}

async function enableClientIsolationAllowlist (
  venueIdx: number,
  policyIdx: number,
  form?: FormInstance
) {
  const targetVenue = mockedNetworkVenue[venueIdx]
  const targetVenueRow = await screen.findByRole('row', { name: new RegExp(targetVenue.name!) })
  const targetPolicy = mockedClientIsolationList[policyIdx]

  await userEvent.click(await within(targetVenueRow).findByRole('combobox'))
  await userEvent.click((await screen.findAllByText(targetPolicy.name))[venueIdx])

  if (!form) {
    return
  }

  await waitFor(() => {
    // eslint-disable-next-line max-len
    const value = form.getFieldValue(['wlan','advancedCustomization', 'clientIsolationVenues'])
    expect(value).toContainEqual({
      venueId: targetVenue.venueId,
      clientIsolationAllowlistId: targetPolicy.id
    })
  })
}

describe('ClientIsolationForm', () => {
  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: mockedTenantId }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(mockedVenues))),
      rest.get(ClientIsolationUrls.getClientIsolationList.url,
        (_, res, ctx) => res(ctx.json(mockedClientIsolationList)))
    )
  })

  it('should render the client isolation form', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          editMode: false,
          cloneMode: false,
          data: null
        }}>
          <Form form={formRef.current}>
            <ClientIsolationForm />
          </Form>
        </NetworkFormContext.Provider>
      </Provider>, {
        route: { params }
      }
    )

    await enableClientIsolation()
  })

  it('should edit the client isolation form', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <NetworkFormContext.Provider value={{
          editMode: true,
          cloneMode: false,
          data: {
            venues: mockedNetworkVenue
          }
        }}>
          <Form form={formRef.current}>
            <ClientIsolationForm />
          </Form>
        </NetworkFormContext.Provider>
      </Provider>, {
        route: { params }
      }
    )

    await enableClientIsolation()

    // Select client isolation policy for the 1st venue
    await enableClientIsolationAllowlist(0, 0, formRef.current)

    // Select client isolation policy for the 2nd venue
    await enableClientIsolationAllowlist(1, 1, formRef.current)

    // Change client isolation policy for the 2nd venue
    await enableClientIsolationAllowlist(1, 2, formRef.current)
  })
})
