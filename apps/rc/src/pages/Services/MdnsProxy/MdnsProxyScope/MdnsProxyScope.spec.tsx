import { renderHook, waitFor } from '@testing-library/react'
import userEvent               from '@testing-library/user-event'
import { Form }                from 'antd'
import { rest }                from 'msw'

import { CommonUrlsInfo, MdnsProxyScopeData, ServiceType, websocketServerUrl } from '@acx-ui/rc/utils'
import { Provider }                                                            from '@acx-ui/store'
import { mockServer, render, screen, within }                                  from '@acx-ui/test-utils'

import { getServiceRoutePath, ServiceOperation } from '../../serviceRouteUtils'
import {
  mockedScope,
  mockedTenantId,
  mockedVenueList,
  mockedApList,
  multipleMockedVenueListP1,
  multipleMockedVenueListP2
} from '../MdnsProxyForm/__tests__/fixtures'
import MdnsProxyFormContext from '../MdnsProxyForm/MdnsProxyFormContext'

import { MdnsProxyScope } from './MdnsProxyScope'

describe('MdnsProxyScope', () => {
  const params = {
    tenantId: mockedTenantId
  }
  // eslint-disable-next-line max-len
  const path = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.CREATE })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedVenueList }))
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedApList }))
      ),
      rest.get(
        websocketServerUrl,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should render table with the givien data', async () => {
    const targetVenueScope = mockedScope.slice()[0]
    const targetVenueName = targetVenueScope.venueName!
    const targetVenueSelectedAps = targetVenueScope.aps.length.toString()

    const { asFragment } = render(
      <Provider>
        <MdnsProxyFormContext.Provider
          value={{
            editMode: false,
            currentData: {
              name: 'mDNS Proxy 123',
              scope: [targetVenueScope]
            }
          }}>
          <Form>
            <MdnsProxyScope />
          </Form>
        </MdnsProxyFormContext.Provider>
      </Provider>, {
        route: { params, path }
      }
    )

    expect(asFragment()).toMatchSnapshot()

    const targetVenueRow = await screen.findByRole('row', { name: new RegExp(targetVenueName) })

    // Check if the selected AP value is correct
    await within(targetVenueRow).findByRole('cell', { name: targetVenueSelectedAps })
  })

  it('should operate the AP table in the drawer', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    const currentScopeData = mockedScope.slice(0, 1)

    render(
      <Provider>
        <MdnsProxyFormContext.Provider
          value={{
            editMode: false,
            currentData: {
              name: 'mDNS Proxy 123',
              scope: currentScopeData
            }
          }}>
          <Form
            form={formRef.current}
          >
            <MdnsProxyScope />
          </Form>
        </MdnsProxyFormContext.Provider>
      </Provider>, {
        route: { params, path }
      }
    )

    // Check if the AP table is rendered
    const targetVenue = mockedVenueList.data[1]
    const targetVenueRow = await screen.findByRole('row', { name: new RegExp(targetVenue.name) })

    await userEvent.click(within(targetVenueRow).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: /Select APs/i }))

    const apTable = await screen.findByTestId('MdnsProxyScopeApTable')


    // Check if the selected AP data has been saved to the form
    const targetAp = mockedApList.data.filter(ap => ap.venueId === targetVenue.id)[0]
    const targetApRow = await within(apTable).findByRole('row', { name: new RegExp(targetAp.name) })
    await userEvent.click(within(targetApRow).getByRole('switch'))

    await userEvent.click(screen.getByRole('button', { name: 'OK' }))

    const scopeVenueData: MdnsProxyScopeData[] = formRef.current.getFieldValue('scope')
    const targetScopeData: MdnsProxyScopeData = {
      venueId: targetVenue.id,
      venueName: targetVenue.name,
      aps: [
        {
          serialNumber: targetAp.serialNumber,
          name: targetAp.name
        }
      ]
    }

    expect(scopeVenueData).toContainEqual(targetScopeData)
  })

  jest.retryTimes(3)
  xit('should set activated APs when switching AP table page', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => {
          const body = req.body as { page: number, current: number }
          const toPage = body.page ? body.page : body.current

          // eslint-disable-next-line max-len
          return res(ctx.json({ ...(toPage === 1 ? multipleMockedVenueListP1 : multipleMockedVenueListP2) }))
        }
      )
    )

    const targetVenue = { ...multipleMockedVenueListP1.data[0] }
    const targetVenueName = targetVenue.name
    const targetScopeData: MdnsProxyScopeData[] = [
      {
        venueId: targetVenue.id,
        venueName: targetVenueName,
        aps: [
          {
            serialNumber: '__ApId1__',
            name: 'AP 1'
          },
          {
            serialNumber: '__ApId2__',
            name: 'AP 2'
          }
        ]
      }
    ]
    const targetVenueSelectedAps = targetScopeData[0].aps.length.toString()
    const page2Venue = { ...multipleMockedVenueListP2.data[0] }

    render(
      <Provider>
        <MdnsProxyFormContext.Provider
          value={{
            editMode: false,
            currentData: {
              name: 'mDNS Proxy 123',
              scope: targetScopeData
            }
          }}>
          <Form>
            <MdnsProxyScope />
          </Form>
        </MdnsProxyFormContext.Provider>
      </Provider>, {
        route: { params, path }
      }
    )


    // Make sure the Selected APs value have been set correctly before switch page
    const targetVenueRow = await screen.findByRole('row', { name: new RegExp(targetVenueName) })
    await within(targetVenueRow).findByRole('cell', { name: targetVenueSelectedAps })


    await userEvent.click(await screen.findByRole('listitem', { name: '2' }))

    // Make sure the table has switched to the second page
    await screen.findByRole('row', { name: new RegExp(page2Venue.name) }, { timeout: 2000 })

    await userEvent.click(await screen.findByRole('listitem', { name: '1' }))

    // Check if the Selected APs value is correct after switch back to the page
    const targetVenueRowNew = await screen.findByRole('row', { name: new RegExp(targetVenueName) })
    await waitFor(() => {
      // eslint-disable-next-line max-len
      expect(within(targetVenueRowNew).getByRole('cell', { name: targetVenueSelectedAps })).toBeInTheDocument()
    }, { timeout: 2000 })
  })
})
