import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features }        from '@acx-ui/feature-toggle'
import { EdgeEditContext } from '@acx-ui/rc/components'
import { edgeApi }         from '@acx-ui/rc/services'
import {
  EdgeGeneralFixtures,
  EdgeIpModeEnum,
  EdgeLagFixtures,
  EdgePortConfigFixtures,
  EdgePortTypeEnum,
  EdgeSubInterface,
  EdgeSubInterfaceFixtures,
  EdgeUrlsInfo,
  SubInterface
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { EditEdgeDataContext, EditEdgeDataContextType } from '../EditEdgeDataProvider'

import SubInterfaces from '.'

const { mockEdgeList, mockEdgeData } = EdgeGeneralFixtures
const { mockEdgePortConfig, mockEdgePortStatus } = EdgePortConfigFixtures
const { mockEdgeSubInterfaces } = EdgeSubInterfaceFixtures
const { mockEdgeLagStatusList } = EdgeLagFixtures

jest.mock('@acx-ui/utils', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })
  return {
    ...jest.requireActual('@acx-ui/utils'),
    getIntl: () => intl
  }
})
jest.mock('./SubInterfaceDrawer', () => (
  ({ visible, data, handleAdd, handleUpdate }: {
    visible: boolean,
    data?: EdgeSubInterface,
    handleAdd: (data: SubInterface) => Promise<unknown>
    handleUpdate: (data: SubInterface) => Promise<unknown>
  }) =>
    <div data-testid='subDialog'>
      <label>{visible?'visible':'invisible'}</label>
      <div>{data?.vlan+''}</div>
      {/* eslint-disable-next-line max-len */}
      <button onClick={() => handleAdd(mockEdgeSubInterfaces.content[0] as unknown as SubInterface)}>Add</button>
      {/* eslint-disable-next-line max-len */}
      <button onClick={() => handleUpdate(mockEdgeSubInterfaces.content[0] as unknown as SubInterface)}>Update</button>
    </div>
))
jest.mock('../ClusterNavigateWarning', () => ({
  ...jest.requireActual('../ClusterNavigateWarning'),
  ClusterNavigateWarning: () => <div data-testid='ClusterNavigateWarning' />
}))

jest.mock('@acx-ui/rc/components', () => {
  const original = jest.requireActual('@acx-ui/rc/components')
  return {
    EdgeEditContext: original.EdgeEditContext,
    CsvSize: original.CsvSize,
    ImportFileDrawer: original.ImportFileDrawer,
    ImportFileDrawerType: original.ImportFileDrawerType
  }
})

const mockUseIsEdgeFeatureReady = jest.fn().mockImplementation(() => false)
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: (ff: string) => mockUseIsEdgeFeatureReady(ff)
}))

const defaultContextData = {
  activeSubTab: {
    key: 'sub-interface',
    title: 'Sub-interface'
  },
  formControl: {
    isDirty: false,
    hasError: false,
    applyFn: jest.fn()
  },
  setActiveSubTab: jest.fn(),
  setFormControl: jest.fn()
}

const defaultEditEdgeClusterCtxData = {
  portData: mockEdgePortConfig.ports,
  portStatus: mockEdgePortStatus,
  lagStatus: mockEdgeLagStatusList.data,
  subInterfaceData: [{
    portId: '6ab895d4-cb8a-4664-b3f9-c4d6e0c8b8c1',
    subInterfaces: mockEdgeSubInterfaces.content
  },{
    lagId: 1,
    subInterfaces: mockEdgeSubInterfaces.content
  }],
  generalSettings: mockEdgeData,
  isPortDataFetching: false,
  isPortStatusFetching: false,
  isLagStatusFetching: false,
  isClusterFormed: true
} as unknown as EditEdgeDataContextType

const defaultEditEdgeSingleNodeCtxData = {
  ...defaultEditEdgeClusterCtxData,
  isClusterFormed: false
} as unknown as EditEdgeDataContextType

const mockAddSubInterface = jest.fn()
const mockUpdateSubInterface = jest.fn()
const mockAddLagSubInterface = jest.fn()
const mockUpdateLagSubInterface = jest.fn()

describe('EditEdge ports - sub-interface', () => {
  let params: { tenantId: string, serialNumber: string }
  beforeEach(() => {
    store.dispatch(edgeApi.util.resetApiState())

    // eslint-disable-next-line max-len
    mockUseIsEdgeFeatureReady.mockImplementation((ff) => ff !== Features.EDGE_DUAL_WAN_TOGGLE)

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000'
    }

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteSubInterfaces.url,
        (_req, res, ctx) => res(ctx.status(202))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteLagSubInterfaces.url,
        (_req, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeUrlsInfo.addSubInterfaces.url,
        (_req, res, ctx) => {
          mockAddSubInterface()
          return res(ctx.status(202))
        }
      ),
      rest.patch(
        EdgeUrlsInfo.updateSubInterfaces.url,
        (_req, res, ctx) => {
          mockUpdateSubInterface()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeUrlsInfo.addLagSubInterfaces.url,
        (_req, res, ctx) => {
          mockAddLagSubInterface()
          return res(ctx.status(202))
        }
      ),
      rest.patch(
        EdgeUrlsInfo.updateLagSubInterfaces.url,
        (_req, res, ctx) => {
          mockUpdateLagSubInterface()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('no SubInterface', async () => {
    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <EditEdgeDataContext.Provider
            value={{
              portData: [],
              portStatus: [],
              lagStatus: [],
              subInterfaceData: [],
              generalSettings: mockEdgeData,
              isPortDataFetching: false,
              isPortStatusFetching: false,
              isLagStatusFetching: false,
              isClusterFormed: true
            } as unknown as EditEdgeDataContextType}
          >
            <SubInterfaces />
          </EditEdgeDataContext.Provider>
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/sub-interface' }
      })

    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should render SubInterface successfully', async () => {
    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <EditEdgeDataContext.Provider
            value={defaultEditEdgeClusterCtxData}
          >
            <SubInterfaces />
          </EditEdgeDataContext.Provider>
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/sub-interface' }
      })
    expect(screen.getByTestId('ClusterNavigateWarning')).toBeVisible()
    expect((await screen.findAllByRole('row')).length).toBe(11)
  })

  it('should create SubInterface successfully', async () => {
    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <EditEdgeDataContext.Provider
            value={defaultEditEdgeClusterCtxData}
          >
            <SubInterfaces />
          </EditEdgeDataContext.Provider>
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/sub-interface' }
      })
    expect(screen.getByTestId('ClusterNavigateWarning')).toBeVisible()
    expect((await screen.findAllByRole('row')).length).toBe(11)
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockAddSubInterface).toBeCalledTimes(1))
  })

  it('Delete a sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <EditEdgeDataContext.Provider
            value={defaultEditEdgeSingleNodeCtxData}
          >
            <SubInterfaces />
          </EditEdgeDataContext.Provider>
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/sub-interface' }
      })

    const rows = await screen.findAllByRole('row')
    await user.click(within(rows[1]).getByRole('radio'))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "2"?')
    const confirmDialog = await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Delete Sub-Interface' }))
    await waitFor(() => expect(confirmDialog).not.toBeVisible())
  })

  it('should have edit dialog show up', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <EditEdgeDataContext.Provider
            value={defaultEditEdgeSingleNodeCtxData}
          >
            <SubInterfaces />
          </EditEdgeDataContext.Provider>
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/sub-interface' }
      })

    await screen.findAllByRole('columnheader')
    const rows = await screen.findAllByRole('row')
    await user.click(within(rows[1]).getByRole('radio'))
    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    const dialog = await screen.findByTestId('subDialog')
    expect(within(dialog).queryByText('visible')).toBeValid()
    expect(within(dialog).queryByText('2')).toBeValid()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Update' }))
    await waitFor(() => expect(mockUpdateSubInterface).toBeCalledTimes(1))
  })

  it('should be able to import by CSV', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.importSubInterfacesCSV.url,
        (_req, res, ctx) => res(ctx.status(201), ctx.json({}))
      )
    )

    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <EditEdgeDataContext.Provider
            value={defaultEditEdgeSingleNodeCtxData}
          >
            <SubInterfaces />
          </EditEdgeDataContext.Provider>
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/sub-interface' }
      })

    await userEvent.click(await screen.findByRole('button', { name: /Import from file/i }))

    const dialog = await screen.findByRole('dialog')
    const csvFile = new File([''], 'sub-interfaces_import_template.csv', { type: 'text/csv' })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(await within(dialog).findByRole('button', { name: 'Import' }))

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  })

  it('should render LAG SubInterface successfully', async () => {
    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <EditEdgeDataContext.Provider
            value={defaultEditEdgeSingleNodeCtxData}
          >
            <SubInterfaces />
          </EditEdgeDataContext.Provider>
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/sub-interface' }
      })
    const lagTab = await screen.findByRole('tab', { name: 'LAG 1' })
    await userEvent.click(lagTab)
    expect((await screen.findAllByRole('row')).length).toBe(11)
  })

  it('should create LAG SubInterface successfully', async () => {
    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <EditEdgeDataContext.Provider
            value={defaultEditEdgeSingleNodeCtxData}
          >
            <SubInterfaces />
          </EditEdgeDataContext.Provider>
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/sub-interface' }
      })
    const lagTab = await screen.findByRole('tab', { name: 'LAG 1' })
    await userEvent.click(lagTab)
    expect((await screen.findAllByRole('row')).length).toBe(11)
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockAddLagSubInterface).toBeCalledTimes(1))
  })

  it('should update LAG SubInterface successfully', async () => {
    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <EditEdgeDataContext.Provider
            value={defaultEditEdgeSingleNodeCtxData}
          >
            <SubInterfaces />
          </EditEdgeDataContext.Provider>
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/sub-interface' }
      })
    const lagTab = await screen.findByRole('tab', { name: 'LAG 1' })
    await userEvent.click(lagTab)
    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(11)
    await userEvent.click(within(rows[1]).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    const dialog = (await screen.findAllByTestId('subDialog'))[1]
    expect(within(dialog).queryByText('visible')).toBeValid()
    expect(within(dialog).queryByText('2')).toBeValid()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Update' }))
    await waitFor(() => expect(mockUpdateLagSubInterface).toBeCalledTimes(1))
  })

  it('Delete a LAG sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <EditEdgeDataContext.Provider
            value={defaultEditEdgeSingleNodeCtxData}
          >
            <SubInterfaces />
          </EditEdgeDataContext.Provider>
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/sub-interface' }
      })
    const lagTab = await screen.findByRole('tab', { name: 'LAG 1' })
    await userEvent.click(lagTab)
    const rows = await screen.findAllByRole('row')
    await user.click(within(rows[1]).getByRole('radio'))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "2"?')
    const confirmDialog = await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Delete Sub-Interface' }))
    await waitFor(() => expect(confirmDialog).not.toBeVisible())
  })

  it('should be able to import LAG sub-interface by CSV', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.importLagSubInterfacesCSV.url,
        (_req, res, ctx) => res(ctx.status(201), ctx.json({}))
      )
    )

    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <EditEdgeDataContext.Provider
            value={defaultEditEdgeSingleNodeCtxData}
          >
            <SubInterfaces />
          </EditEdgeDataContext.Provider>
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/sub-interface' }
      })

    const lagTab = await screen.findByRole('tab', { name: 'LAG 1' })
    await userEvent.click(lagTab)

    await userEvent.click(await screen.findByRole('button', { name: /Import from file/i }))

    const dialog = await screen.findByRole('dialog')
    const csvFile = new File([''], 'sub-interfaces_import_template.csv', { type: 'text/csv' })

    // eslint-disable-next-line testing-library/no-node-access
    await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)

    await userEvent.click(await within(dialog).findByRole('button', { name: 'Import' }))

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  })

  it('should be greyout when dual WAN FF is enabled', async () => {
    // eslint-disable-next-line max-len
    mockUseIsEdgeFeatureReady.mockImplementation((ff) => ff === Features.EDGE_DUAL_WAN_TOGGLE)

    render(
      <Provider>
        <EdgeEditContext.EditContext.Provider
          value={defaultContextData}
        >
          <EditEdgeDataContext.Provider
            value={defaultEditEdgeSingleNodeCtxData}
          >
            <SubInterfaces />
          </EditEdgeDataContext.Provider>
        </EdgeEditContext.EditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/sub-interface' }
      })

    const lagTab = await screen.findByRole('tab', { name: 'LAG 1' })
    await userEvent.click(lagTab)
    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('radio')).toBeDisabled()
  })

  describe('Core Access', () => {
    it('should show core port and access port column when FF is on', async () => {
      render(
        <Provider>
          <EdgeEditContext.EditContext.Provider
            value={defaultContextData}
          >
            <EditEdgeDataContext.Provider
              value={defaultEditEdgeSingleNodeCtxData}
            >
              <SubInterfaces />
            </EditEdgeDataContext.Provider>
          </EdgeEditContext.EditContext.Provider>
        </Provider>, {
          route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/sub-interface' }
        })

      await screen.findAllByRole('row')
      expect(screen.getByRole('columnheader', { name: 'Core Port' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'Access Port' })).toBeVisible()
    })

    it('should disable delete button when SD-LAN is applied and core port is enabled', async () => {
      render(
        <Provider>
          <EdgeEditContext.EditContext.Provider
            value={defaultContextData}
          >
            <EditEdgeDataContext.Provider
              value={{
                ...defaultEditEdgeSingleNodeCtxData,
                edgeSdLanData: {},
                subInterfaceData: [{
                  portId: '6ab895d4-cb8a-4664-b3f9-c4d6e0c8b8c1',
                  subInterfaces: [{
                    id: 'fa663fd2-3057-44d9-ba25-9b45c93069cd',
                    corePortEnabled: true,
                    portType: EdgePortTypeEnum.LAN,
                    ipMode: EdgeIpModeEnum.DHCP,
                    ip: '',
                    subnet: '',
                    gateway: '',
                    vlan: 2
                  }]
                }]
              }}
            >
              <SubInterfaces />
            </EditEdgeDataContext.Provider>
          </EdgeEditContext.EditContext.Provider>
        </Provider>, {
          route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/sub-interface' }
        })

      const subInterface = await screen.findByRole('row', { name: /1 LAN DHCP/i })
      await userEvent.click(subInterface)
      expect(await screen.findByRole('button', { name: 'Delete' })).toBeDisabled()
    })

    // eslint-disable-next-line max-len
    it('should disable delete button when SD-LAN is applied and access port is enabled', async () => {
      render(
        <Provider>
          <EdgeEditContext.EditContext.Provider
            value={defaultContextData}
          >
            <EditEdgeDataContext.Provider
              value={{
                ...defaultEditEdgeSingleNodeCtxData,
                edgeSdLanData: {},
                subInterfaceData: [{
                  portId: '6ab895d4-cb8a-4664-b3f9-c4d6e0c8b8c1',
                  subInterfaces: [{
                    id: 'fa663fd2-3057-44d9-ba25-9b45c93069cd',
                    accessPortEnabled: true,
                    portType: EdgePortTypeEnum.LAN,
                    ipMode: EdgeIpModeEnum.DHCP,
                    ip: '',
                    subnet: '',
                    gateway: '',
                    vlan: 2
                  }]
                }]
              }}
            >
              <SubInterfaces />
            </EditEdgeDataContext.Provider>
          </EdgeEditContext.EditContext.Provider>
        </Provider>, {
          route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/sub-interface' }
        })

      const subInterface = await screen.findByRole('row', { name: /1 LAN DHCP/i })
      await userEvent.click(subInterface)
      expect(await screen.findByRole('button', { name: 'Delete' })).toBeDisabled()
    })
  })
})
