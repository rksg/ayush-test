import { useState } from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, ServiceType, Venue }                                                 from '@acx-ui/rc/utils'
import { Provider }                                                                           from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { getServiceRoutePath, ServiceOperation }         from '../../serviceRouteUtils'
import { mockedApList, mockedTenantId, mockedVenueList } from '../MdnsProxyForm/__tests__/fixtures'

import { MdnsProxyScopeApDrawer } from './MdnsProxyScopeApDrawer'




describe('MdnsProxyScopeApDrawer', () => {
  const params = {
    tenantId: mockedTenantId
  }
  // eslint-disable-next-line max-len
  const path = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.CREATE })
  const apToBeActivated = mockedApList.data[1]

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(mockedApList))
      )
    )
  })

  it('should render table with the giving data', async () => {
    const { asFragment } = render(
      <Provider>
        <MdnsProxyScopeApDrawer
          venue={mockedVenueList.data[1] as Venue}
          selectedApsId={[apToBeActivated.serialNumber]}
          visible={true}
          setVisible={jest.fn()}
          setAps={jest.fn()}
        />
      </Provider>, {
        route: { params, path }
      }
    )

    // eslint-disable-next-line max-len
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(asFragment()).toMatchSnapshot()

    const targetAp = mockedApList.data[0]

    // Check if the AP is in the table
    await screen.findByRole('row', { name: new RegExp(targetAp.name) })

    // Check if the AP activate column is displaying correctly
    const activatedRow = await screen.findByRole('row', { name: new RegExp(apToBeActivated.name) })
    await within(activatedRow).findByRole('switch', { checked: true })
  })

  it('should activate the APs by clicking Activate row action', async () => {
    render(
      <Provider>
        <MdnsProxyScopeApDrawer
          venue={mockedVenueList.data[1] as Venue}
          selectedApsId={[apToBeActivated.serialNumber]}
          visible={true}
          setVisible={jest.fn()}
          setAps={jest.fn()}
        />
      </Provider>, {
        route: { params, path }
      }
    )

    // eslint-disable-next-line max-len
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // Click all the records
    await waitFor(() => {
      const allCheckboxClicked = mockedApList.data.map(async ap => {
        const row = await screen.findByRole('row', { name: new RegExp(ap.name) })
        return userEvent.click(within(row).getByRole('checkbox'))
      })

      return Promise.all(allCheckboxClicked)
    }, { timeout: 2000 })

    await userEvent.click(await screen.findByRole('button', { name: 'Activate' }))

    // Check if each record is activated
    await waitFor(() => {
      const allCheckboxClicked = mockedApList.data.map(async ap => {
        const row = await screen.findByRole('row', { name: new RegExp(ap.name) })
        const activatedAp = await within(row).findByRole('switch')
        expect(activatedAp).toBeChecked()
      })

      return Promise.all(allCheckboxClicked)
    }, { timeout: 2000 })
  }, 10000)

  it('should deactivate the AP by clicking switch component in Apply column', async () => {
    render(
      <Provider>
        <MdnsProxyScopeApDrawer
          venue={mockedVenueList.data[1] as Venue}
          selectedApsId={[apToBeActivated.serialNumber]}
          visible={true}
          setVisible={jest.fn()}
          setAps={jest.fn()}
        />
      </Provider>, {
        route: { params, path }
      }
    )

    // eslint-disable-next-line max-len
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const activatedRow = await screen.findByRole('row', { name: new RegExp(apToBeActivated.name) })
    await userEvent.click(within(activatedRow).getByRole('switch'))

    const activatedSwitch = within(activatedRow).getByRole('switch')
    expect(activatedSwitch).not.toBeChecked()
  })

  it('should close drawer', async () => {
    const { result: drawerVisible } = renderHook(() => {
      const [ visible, setVisible ] = useState(true)
      return { visible, setVisible }
    })

    render(
      <Provider>
        <MdnsProxyScopeApDrawer
          venue={mockedVenueList.data[1] as Venue}
          visible={drawerVisible.current.visible}
          setVisible={drawerVisible.current.setVisible}
          setAps={jest.fn()}
        />
      </Provider>, {
        route: { params, path }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(drawerVisible.current.visible).toEqual(false)
  })

  it('should save data', async () => {
    const setAps = jest.fn()
    const selectedVenue = mockedVenueList.data[1] as Venue

    render(
      <Provider>
        <MdnsProxyScopeApDrawer
          venue={selectedVenue}
          visible={true}
          setVisible={jest.fn()}
          setAps={setAps}
        />
      </Provider>, {
        route: { params, path }
      }
    )

    const targetRow = await screen.findByRole('row', { name: new RegExp(apToBeActivated.name) })
    await userEvent.click(await within(targetRow).findByRole('switch'))

    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))

    expect(setAps).toHaveBeenCalledWith(selectedVenue, [{
      serialNumber: apToBeActivated.serialNumber, name: apToBeActivated.name
    }])
  })
})
