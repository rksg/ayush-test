import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features }                               from '@acx-ui/feature-toggle'
import { EdgeEditContext, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import { edgeApi }                                from '@acx-ui/rc/services'
import {
  EdgeGeneralFixtures,
  EdgeLagFixtures,
  EdgePortConfigFixtures,
  EdgeSubInterface,
  EdgeSubInterfaceFixtures,
  EdgeUrlsInfo
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
  ({ visible, data }: { visible: boolean, data?: EdgeSubInterface }) =>
    <div data-testid='subDialog'>
      <label>{visible?'visible':'invisible'}</label>
      <div>{data?.vlan+''}</div>
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
    ImportFileDrawerType: original.ImportFileDrawerType,

    useIsEdgeFeatureReady: jest.fn()
  }
})

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

describe('EditEdge ports - sub-interface', () => {
  let params: { tenantId: string, serialNumber: string }
  beforeEach(() => {
    store.dispatch(edgeApi.util.resetApiState())

    // eslint-disable-next-line max-len
    jest.mocked(useIsEdgeFeatureReady).mockImplementation((ff) => ff !== Features.EDGE_DUAL_WAN_TOGGLE)

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000'
    }

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.get(
        EdgeUrlsInfo.getSubInterfaces.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeSubInterfaces))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteSubInterfaces.url,
        (_req, res, ctx) => res(ctx.status(202))
      ),
      rest.get(
        EdgeUrlsInfo.getLagSubInterfaces.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeSubInterfaces))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteLagSubInterfaces.url,
        (_req, res, ctx) => res(ctx.status(202))
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

  it('should not display import from file when FF is disabled', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)

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

    const btn = screen.queryByRole('button', { name: 'Import from file' })
    expect(btn).toBeNull()
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
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect((await screen.findAllByRole('row')).length).toBe(11)
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
    jest.mocked(useIsEdgeFeatureReady).mockImplementation((ff) => ff === Features.EDGE_DUAL_WAN_TOGGLE)

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
  })
})