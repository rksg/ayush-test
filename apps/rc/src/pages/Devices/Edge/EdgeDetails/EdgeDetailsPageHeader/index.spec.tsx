/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeDHCPFixtures, EdgeDhcpUrls, EdgeGeneralFixtures, EdgeStatus, EdgeStatusEnum, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                      from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { EdgeDetailsDataContext } from '../EdgeDetailsDataProvider'

import { EdgeDetailsPageHeader } from '.'

const { mockEdgeList, mockEdgeServiceList, mockEdgeCluster } = EdgeGeneralFixtures
const { mockDhcpStatsData } = EdgeDHCPFixtures
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('../../HaStatusBadge', () => ({
  HaStatusBadge: () => <div data-testid='ha-status-badge' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true)
}))
const mockedDeleteApi = jest.fn()
const mockedRebootApi = jest.fn()
const mockedShutdownApi = jest.fn()
const mockedResetApi = jest.fn()

describe('Edge Detail Page Header', () => {
  const currentEdge = mockEdgeList.data[0]
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', serialNumber: currentEdge.serialNumber }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteEdge.url,
        (req, res, ctx) => {
          mockedDeleteApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeUrlsInfo.reboot.url,
        (req, res, ctx) => {
          mockedRebootApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeUrlsInfo.shutdown.url,
        (req, res, ctx) => {
          mockedShutdownApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeUrlsInfo.factoryReset.url,
        (req, res, ctx) => {
          mockedResetApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_req, res, ctx) => res(ctx.json(mockDhcpStatsData))
      )
    )
  })

  it('should more actions to be clickable', async () => {
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: currentEdge as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeDetailsPageHeader />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    await userEvent.click(screen.getByRole('button', { name: 'More Actions' }))
    expect((await screen.findAllByRole('menuitem')).length).toBe(4)
  })

  it('should redirect to edge general setting page after clicked configure', async () => {
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: currentEdge as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeDetailsPageHeader />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    await userEvent.click(screen.getByText('Configure'))
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith({
        pathname: `/${params.tenantId}/t/devices/edge/${currentEdge.serialNumber}/edit/general-settings`,
        hash: '',
        search: ''
      })
    })
  })

  it('should redirect to edge list after deleted edge', async () => {
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: currentEdge as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeDetailsPageHeader />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    const dropdownBtn = screen.getByRole('button', { name: 'More Actions' })
    await userEvent.click(dropdownBtn)

    const deleteBtn = await screen.findByRole('menuitem', { name: 'Delete RUCKUS Edge' })
    await userEvent.click(deleteBtn)

    const deleteDialog = await screen.findByRole('dialog')
    await within(deleteDialog).findByText(`Delete "${currentEdge.name}"?`)
    await userEvent.type(await within(deleteDialog).findByRole('textbox'), 'Delete')
    await userEvent.click(within(deleteDialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => {
      expect(mockedDeleteApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith(`/${params.tenantId}/t/devices/edge`)
    })
    await waitFor(() => {
      expect(deleteDialog).not.toBeVisible()
    })
  })

  it('should reboot edge correctly', async () => {
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: currentEdge as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeDetailsPageHeader />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    const dropdownBtn = screen.getByRole('button', { name: 'More Actions' })
    await userEvent.click(dropdownBtn)

    const rebootBtn = await screen.findByRole('menuitem', { name: 'Reboot' })
    await userEvent.click(rebootBtn)

    const rebootDialog = await screen.findByRole('dialog')
    await within(rebootDialog).findByText(`Reboot "${currentEdge.name}"?`)
    await userEvent.click(within(rebootDialog).getByRole('button', { name: 'Reboot' }))
    await waitFor(() => {
      expect(mockedRebootApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(rebootDialog).not.toBeVisible()
    })
  })

  it('should shutdown edge correctly', async () => {
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: currentEdge as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeDetailsPageHeader />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    const dropdownBtn = screen.getByRole('button', { name: 'More Actions' })
    await userEvent.click(dropdownBtn)

    const shutdownBtn = await screen.findByRole('menuitem', { name: 'Shutdown' })
    await userEvent.click(shutdownBtn)

    const shutdwonDialog = await screen.findByRole('dialog')
    await within(shutdwonDialog).findByText(`Shutdown "${currentEdge.name}"?`)
    await userEvent.click(within(shutdwonDialog).getByRole('button', { name: 'Shutdown' }))
    await waitFor(() => {
      expect(mockedShutdownApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(shutdwonDialog).not.toBeVisible()
    })
  })

  it('should factory rest edge correctly', async () => {
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: currentEdge as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeDetailsPageHeader />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    const dropdownBtn = screen.getByRole('button', { name: 'More Actions' })
    await userEvent.click(dropdownBtn)

    const resetBtn = await screen.findByRole('menuitem', { name: 'Reset & Recover' })
    await userEvent.click(resetBtn)

    const resetDialog = await screen.findByRole('dialog')
    await within(resetDialog).findByText(`Reset & Recover "${currentEdge.name}"?`)
    await userEvent.click(within(resetDialog).getByRole('button', { name: 'Reset' }))
    await waitFor(() => {
      expect(mockedResetApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(resetDialog).not.toBeVisible()
    })
  })

  it('should render HaStatusBadge', async () => {
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: currentEdge as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeDetailsPageHeader />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByTestId('ha-status-badge')).toBeVisible()
  })
})

describe('Edge Detail Page Header - action show up logic', () => {
  const currentEdge = mockEdgeList.data[0]
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', serialNumber: currentEdge.serialNumber }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteEdge.url,
        (req, res, ctx) => {
          mockedDeleteApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeUrlsInfo.reboot.url,
        (req, res, ctx) => {
          mockedRebootApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeUrlsInfo.factoryReset.url,
        (req, res, ctx) => {
          mockedResetApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeServiceList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeServiceList))
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_req, res, ctx) => res(ctx.json(mockDhcpStatsData))
      )
    )
  })

  it('should show reset & reboot in applying config status', async () => {
    const applyingConfigData = {
      ...mockEdgeList,
      data: [{
        ...mockEdgeList.data[0],
        deviceStatus: EdgeStatusEnum.APPLYING_CONFIGURATION
      }]
    }
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(applyingConfigData))
      ))
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: currentEdge as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeDetailsPageHeader />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    const dropdownBtn = screen.getByRole('button', { name: 'More Actions' })
    await userEvent.click(dropdownBtn)

    expect(await screen.findByRole('menuitem', { name: 'Reset & Recover' })).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: 'Reboot' })).toBeInTheDocument()
  })

  it('should show reset & reboot in config failed status', async () => {
    const configFailedData = {
      ...mockEdgeList,
      data: [{
        ...mockEdgeList.data[0],
        deviceStatus: EdgeStatusEnum.CONFIGURATION_UPDATE_FAILED
      }]
    }
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(configFailedData))
      ))
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: currentEdge as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeDetailsPageHeader />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    const dropdownBtn = screen.getByRole('button', { name: 'More Actions' })
    await userEvent.click(dropdownBtn)

    expect(await screen.findByRole('menuitem', { name: 'Reset & Recover' })).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: 'Reboot' })).toBeInTheDocument()
  })

  it('should show reset & reboot in FW update failed status', async () => {
    const fwUpdateFailedData = {
      ...mockEdgeList,
      data: [{
        ...mockEdgeList.data[0],
        deviceStatus: EdgeStatusEnum.FIRMWARE_UPDATE_FAILED
      }]
    }
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(fwUpdateFailedData))
      ))
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: currentEdge as EdgeStatus,
            currentCluster: mockEdgeCluster,
            isEdgeStatusLoading: false,
            isClusterLoading: false
          }}
        >
          <EdgeDetailsPageHeader />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    const dropdownBtn = screen.getByRole('button', { name: 'More Actions' })
    await userEvent.click(dropdownBtn)

    expect(await screen.findByRole('menuitem', { name: 'Reset & Recover' })).toBeInTheDocument()
    expect(await screen.findByRole('menuitem', { name: 'Reboot' })).toBeInTheDocument()
  })
})