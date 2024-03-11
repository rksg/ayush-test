import userEvent                                    from '@testing-library/user-event'
import { rest }                                     from 'msw'
import { IntlProvider }                             from 'react-intl'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  EdgeGeneralFixtures,
  EdgeLagFixtures,
  EdgePortConfigFixtures,
  EdgePortWithStatus,
  EdgeSubInterface,
  EdgeSubInterfaceFixtures,
  EdgeUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  act,
  mockServer,
  renderHook,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { EdgePortTabEnum }                from '..'
import { EditContext as EdgeEditContext } from '../../EdgeEditContext'
import { EdgePortsDataContext }           from '../PortDataProvider'

import SubInterface from '.'

const { mockEdgeList } = EdgeGeneralFixtures
const { mockEdgePortConfig } = EdgePortConfigFixtures
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
const defaultEmptyPortsContextdata = {
  portData: [],
  lagData: [],
  isLoading: false,
  isFetching: false
}

const defaultPortsContextdata = {
  ...defaultEmptyPortsContextdata,
  portData: mockEdgePortConfig.ports as EdgePortWithStatus[]
}

describe('EditEdge ports - sub-interface', () => {
  const mockedEdgeID = 'mocked_edge_id'
  const defaultProps = {
    serialNumber: mockedEdgeID,
    // portData: mockEdgePortConfig.ports as EdgePortWithStatus[],
    lagData: mockEdgeLagStatusList.data
  }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.get(
        EdgeUrlsInfo.getSubInterfaces.url,
        (req, res, ctx) => res(ctx.json(mockEdgeSubInterfaces))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteSubInterfaces.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.get(
        EdgeUrlsInfo.getLagSubInterfaces.url,
        (req, res, ctx) => res(ctx.json(mockEdgeSubInterfaces))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteLagSubInterfaces.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('no SubInterface', async () => {
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <EdgePortsDataContext.Provider value={defaultEmptyPortsContextdata}>
            <SubInterface
              serialNumber={mockedEdgeID}
            />
          </EdgePortsDataContext.Provider>
        </EdgeEditContext.Provider>
      </Provider>)

    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should render SubInterface successfully', async () => {
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
            <SubInterface
              {...defaultProps}
            />
          </EdgePortsDataContext.Provider>
        </EdgeEditContext.Provider>
      </Provider>)

    expect((await screen.findAllByRole('row')).length).toBe(11)
  })

  it('Delete a sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
            <SubInterface
              {...defaultProps}
            />
          </EdgePortsDataContext.Provider>
        </EdgeEditContext.Provider>
      </Provider>)

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
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
            <SubInterface
              {...defaultProps}
            />
          </EdgePortsDataContext.Provider>
        </EdgeEditContext.Provider>
      </Provider>)

    await screen.findAllByRole('columnheader')
    const rows = await screen.findAllByRole('row')
    await user.click(within(rows[1]).getByRole('radio'))
    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    const dialog = await screen.findByTestId('subDialog')
    expect(within(dialog).queryByText('visible')).toBeValid()
    expect(within(dialog).queryByText('2')).toBeValid()
  })

  it('should close subInterface drawer after routed into another subTab', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: 'sub-interface'
    }
    const getWrapper = (basePath: string = '') =>
      ({ children }: { children: React.ReactElement }) => (
        <IntlProvider locale='en'>
          <Provider>
            <MemoryRouter initialEntries={['/t-id/t/devices/edge/001/edit/ports/sub-interface']}>
              <Routes>
                {
                // eslint-disable-next-line max-len
                  <Route path={`${basePath}/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab`}
                    element={
                      <div>
                        <EdgeEditContext.Provider
                          value={defaultContextData}
                        >
                          <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
                            <SubInterface
                              {...defaultProps}
                            />
                          </EdgePortsDataContext.Provider>
                        </EdgeEditContext.Provider>
                        {children}
                      </div>
                    } />
                }
              </Routes>
            </MemoryRouter>
          </Provider>
        </IntlProvider>
      )
    const { result } = renderHook(() => useNavigate(), { wrapper: getWrapper('') })

    await screen.findAllByRole('columnheader')
    await userEvent.click(await screen.findByRole('button', { name: 'Add Sub-interface' }))
    const addFormDialog = await screen.findByTestId('subDialog')
    expect(within(addFormDialog).queryByText('visible')).toBeValid()
    act(() => {
      // eslint-disable-next-line max-len
      result.current(`/${params.tenantId}/t/devices/edge/${params.serialNumber}/edit/${params.activeTab}/${EdgePortTabEnum.PORTS_GENERAL}`)
    })

    await waitFor(async () => {
      expect(within(await screen.findByTestId('subDialog')).queryByText('invisible')).toBe(null)
    })
  })

  it('should be able to import by CSV', async () => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.importSubInterfacesCSV.url,
        (req, res, ctx) => res(ctx.status(201), ctx.json({}))
      )
    )

    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
            <SubInterface
              {...defaultProps}
            />
          </EdgePortsDataContext.Provider>
        </EdgeEditContext.Provider>
      </Provider>)

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
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
            <SubInterface
              {...defaultProps}
            />
          </EdgePortsDataContext.Provider>
        </EdgeEditContext.Provider>
      </Provider>)

    const btn = screen.queryByRole('button', { name: 'Import from file' })
    expect(btn).toBeNull()
  })

  it('should render LAG SubInterface successfully', async () => {
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
            <SubInterface
              {...defaultProps}
            />
          </EdgePortsDataContext.Provider>
        </EdgeEditContext.Provider>
      </Provider>)
    const lagTab = await screen.findByRole('tab', { name: 'LAG 1' })
    await userEvent.click(lagTab)
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect((await screen.findAllByRole('row')).length).toBe(11)
  })

  it('Delete a LAG sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
            <SubInterface
              {...defaultProps}
            />
          </EdgePortsDataContext.Provider>
        </EdgeEditContext.Provider>
      </Provider>)
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
        (req, res, ctx) => res(ctx.status(201), ctx.json({}))
      )
    )

    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
            <SubInterface
              {...defaultProps}
            />
          </EdgePortsDataContext.Provider>
        </EdgeEditContext.Provider>
      </Provider>)

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
})
