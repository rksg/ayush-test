import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { apApi, venueApi }                                       from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, WifiRbacUrlsInfo, WifiUrlsInfo }    from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ApNetworkingContext }          from '..'
import { ApDataContext, ApEditContext } from '../..'
import { r760Ap, venueData }            from '../../../../__tests__/fixtures'

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

const mockDisabledVenueMeshSetting = {
  enabled: false,
  radioType: '5-GHz',
  zeroTouchEnabled: false
}

const mockEnabledVenueMeshSetting = {
  ...mockDisabledVenueMeshSetting,
  enabled: true
}

const mockApMeshDisabledSettings = {
  venueMeshEnabled: false,
  meshMode: 'AUTO'
}

const defaultApEditCtxData = {
  editContextData: {
    tabTitle: '',
    isDirty: false,
    hasError: false,
    updateChanges: jest.fn(),
    discardChanges: jest.fn()
  },
  setEditContextData: jest.fn()
}

describe('ApMeshTab', () => {
  const defaultR760ApCtxData = { apData: r760Ap, venueData }

  beforeEach (() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    mockServer.use(
      rest.post(WifiUrlsInfo.getMeshUplinkAPs.url,
        (_, res, ctx) => res(ctx.json(mockMeshUplinkAps))
      ),
      rest.post(CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      )
    )

  })

  it('should render correctly', async () => {
    const mockVenueMeshReq = jest.fn()
    mockServer.use(
      rest.get(
        WifiRbacUrlsInfo.getVenueMesh.url,
        (_, res, ctx) => {
          mockVenueMeshReq()
          return res(ctx.json({}))
        }
      ),
      rest.get(
        WifiUrlsInfo.getApMeshSettings.url,
        (_, res, ctx) => res(ctx.json(mockApMeshSettings2))
      )
    )

    render(
      <Provider>
        <ApEditContext.Provider value={{
          ...defaultApEditCtxData,
          editNetworkingContextData: {} as ApNetworkingContext,
          setEditNetworkingContextData: jest.fn()
        }}>
          <ApDataContext.Provider value={defaultR760ApCtxData}>
            <ApMesh />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    expect(mockVenueMeshReq).not.toBeCalled()

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
        <ApEditContext.Provider value={defaultApEditCtxData}>
          <ApDataContext.Provider value={defaultR760ApCtxData}>
            <ApMesh />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
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
  })


  it('show info when venue mesh is disabled', async () => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getApMeshSettings.url,
        (_, res, ctx) => res(ctx.json(mockApMeshDisabledSettings))
      )
    )

    render(<Provider>
      <ApDataContext.Provider value={defaultR760ApCtxData}>
        <ApMesh />
      </ApDataContext.Provider>
    </Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
    })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await screen.findByText(/Mesh is not enabled at the venue where this AP is installed/)
  })

  it('show info in the table when no uplink APs', async () => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getApMeshSettings.url,
        (_, res, ctx) => res(ctx.json(mockApMeshSettings2))),
      rest.post(WifiUrlsInfo.getMeshUplinkAPs.url,
        (_, res, ctx) => res(ctx.json(mockNoMeshUplinkAps)))
    )

    render(<Provider>
      <ApDataContext.Provider value={defaultR760ApCtxData}>
        <ApMesh />
      </ApDataContext.Provider>
    </Provider>, {
      route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
    })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    await screen.findByText(/No uplink APs detected/)

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it('Show error message when uplinkType is manul without uplink ap', async () => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getApMeshSettings.url,
        (_, res, ctx) => res(ctx.json(mockApMeshSettings1))
      )
    )

    render(
      <Provider>
        <ApEditContext.Provider value={defaultApEditCtxData}>
          <ApDataContext.Provider value={defaultR760ApCtxData}>
            <ApMesh />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    await userEvent.click(await screen.findByRole('radio', { name: /Root AP/ }))
    await userEvent.click(await screen.findByRole('radio', { name: /Mesh AP/ }))
    await userEvent.click(await screen.findByRole('radio', { name: /Select Uplink AP Manually/ }))
  })

  describe('Wifi RBAC enabled', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_RBAC_API)
    })

    it('should trigger get venue mesh setting API', async () => {
      const mockVenueMeshReq = jest.fn()
      const mockApMeshReq = jest.fn()
      mockServer.use(
        rest.get(
          WifiRbacUrlsInfo.getVenueMesh.url,
          (_, res, ctx) => {
            mockVenueMeshReq()
            return res(ctx.json(mockEnabledVenueMeshSetting))
          }
        ),
        rest.get(
          WifiRbacUrlsInfo.getApMeshSettings.url,
          (_, res, ctx) => {
            mockApMeshReq()
            return res(ctx.json(mockApMeshSettings1))
          }
        )
      )

      render(
        <Provider>
          <ApEditContext.Provider value={defaultApEditCtxData}>
            <ApDataContext.Provider value={defaultR760ApCtxData}>
              <ApMesh />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, {
          route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
        })

      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
      expect(mockVenueMeshReq).toBeCalled()
      expect(mockApMeshReq).toBeCalled()
      await userEvent.click(await screen.findByRole('radio', { name: /Root AP/ }))
      await userEvent.click(await screen.findByRole('radio', { name: /Mesh AP/ }))
      await userEvent.click(await screen.findByRole('radio', { name: /Select Uplink AP Manually/ }))
    })

    it('should NOT trigger get ap mesh setting API when mesh is not enabled', async () => {
      const mockVenueMeshReq = jest.fn()
      const mockApMeshReq = jest.fn()
      mockServer.use(
        rest.get(
          WifiRbacUrlsInfo.getVenueMesh.url,
          (_, res, ctx) => {
            mockVenueMeshReq()
            return res(ctx.json(mockDisabledVenueMeshSetting))
          }
        ),
        rest.get(
          WifiRbacUrlsInfo.getApMeshSettings.url,
          (_, res, ctx) => {
            mockApMeshReq()
            return res(ctx.json({}))
          }
        )
      )

      render(
        <Provider>
          <ApEditContext.Provider value={defaultApEditCtxData}>
            <ApDataContext.Provider value={defaultR760ApCtxData}>
              <ApMesh />
            </ApDataContext.Provider>
          </ApEditContext.Provider>
        </Provider>, {
          route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
        })

      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
      expect(mockVenueMeshReq).toBeCalled()
      expect(mockApMeshReq).not.toBeCalled()
      await screen.findByText(/Mesh is not enabled/)
    })
  })

})
