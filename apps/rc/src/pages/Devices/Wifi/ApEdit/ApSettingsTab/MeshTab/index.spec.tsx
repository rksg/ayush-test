import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi, venueApi }                                       from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo }                          from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { getUrlForTest }                                         from '@acx-ui/utils'

import { ApEditContext }     from '../..'
import { r760Ap, venueData } from '../../../../__tests__/fixtures'

import { ApMesh } from '.'

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }

const mockMeshUplinkAps = {
  data: [{
    name: 'R720',
    deviceStatus: '2_00_Operational',
    healthStatus: 'Excellent',
    neighbors: [{
      rssi: 53,
      mac: 'C8:84:8C:10:D3:90',
      apName: 'ap1'
    }, {
      rssi: 29,
      mac: '34:20:E3:1D:10:11',
      apName: 'ap2'
    }]
  }],
  fields: ['neighbors', 'name', 'neighbor', 'deviceStatus'],
  page: 1,
  totalCount: 1
}

const mockNoMeshUplinkAps = {
  data: [{
    name: 'R720',
    deviceStatus: '2_00_Operational',
    healthStatus: 'Excellent'
  }],
  fields: ['neighbors', 'name', 'neighbor', 'deviceStatus'],
  page: 1,
  totalCount: 1
}

const mockApMeshSettings1 = {
  venueMeshEnabled: true,
  meshMode: 'MESH',
  uplinkMode: 'SMART'
}

const mockApMeshSettings2 = {
  venueMeshEnabled: true,
  meshMode: 'MESH',
  uplinkMode: 'MANUAL',
  uplinkMacAddresses: [
    'C8:84:8C:10:D3:90',
    '34:20:E3:1D:10:11'
  ]
}

const mockApMeshDisabledSettings = {
  venueMeshEnabled: false,
  meshMode: 'AUTO'
}

describe('ApMeshTab', () => {
  beforeEach (() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    mockServer.use(
      rest.get(
        getUrlForTest(WifiUrlsInfo.getAp).replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(r760Ap))),
      rest.get(
        getUrlForTest(CommonUrlsInfo.getVenue),
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.post(
        getUrlForTest(WifiUrlsInfo.getMeshUplinkAPs),
        (_, res, ctx) => res(ctx.json(mockMeshUplinkAps)))
    )

  })

  it('should render correctly', async () => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getApMeshSettings.url,
        (_, res, ctx) => res(ctx.json(mockApMeshSettings2))
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
          <ApMesh />
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/mesh' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    // uplink AP table
    const checkboxes = await screen.findAllByRole('checkbox')
    expect(checkboxes.length).toBe(2)
    expect(checkboxes[0]).toBeChecked()

    await userEvent.click(await screen.findByRole('button', { name: /Cancel/ }))
  })

  it('should render correctly after edit the AP mesh settings', async () => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getApMeshSettings.url,
        (_, res, ctx) => res(ctx.json(mockApMeshSettings1))
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
          <ApMesh />
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/mesh' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    await userEvent.click(await screen.findByRole('radio', { name: /Root AP/ }))
    await userEvent.click(await screen.findByRole('radio', { name: /Mesh AP/ }))
    await userEvent.click(await screen.findByRole('radio', { name: /Select Uplink AP Manually/ }))

    // uplink AP table
    const checkboxes = await screen.findAllByRole('checkbox')
    expect(checkboxes.length).toBe(2)
    expect(checkboxes[0]).not.toBeChecked()

    await userEvent.click(checkboxes[0])

    await userEvent.click(await screen.findByRole('button', { name: 'Apply Mesh' }))
  })


  it('show info when venue mesh is disabled', async () => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getApMeshSettings.url,
        (_, res, ctx) => res(ctx.json(mockApMeshDisabledSettings))
      )
    )

    render(<Provider><ApMesh /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/mesh' }
    })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await screen.findByText(/Mesh is not enabled at the venue where this AP is installed/)
  })

  it('show info in the table when no uplink APs', async () => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getApMeshSettings.url,
        (_, res, ctx) => res(ctx.json(mockApMeshSettings2))),
      rest.post(
        getUrlForTest(WifiUrlsInfo.getMeshUplinkAPs),
        (_, res, ctx) => res(ctx.json(mockNoMeshUplinkAps)))
    )

    render(<Provider><ApMesh /></Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/mesh' }
    })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    await screen.findByText(/No uplink APs detected/)
  })

})
