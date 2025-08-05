import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi, venueApi }                                       from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, WifiRbacUrlsInfo }                  from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ApDataContext, ApEditContext } from '../..'
import { r760Ap, venueData }            from '../../../../__tests__/fixtures'

import { ApMesh } from '.'

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }

const mockApMeshSettings1 = {
  venueMeshEnabled: true,
  meshMode: 'MESH',
  uplinkMode: 'SMART'
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
      rest.post(CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))
      )
    )

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
