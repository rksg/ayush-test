import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeClusterTableDataType, EdgeGeneralFixtures, EdgeStatus, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                from '@acx-ui/store'
import { mockServer, renderHook, screen, waitFor, within }                         from '@acx-ui/test-utils'

import { useEdgeClusterActions } from '.'

const mockedDeleteApi = jest.fn()
const mockedDeleteClusterApi = jest.fn()
const mockedRebootApi = jest.fn()
const mockedSendOtp = jest.fn()
const mockedFactoryReset = jest.fn()

const { mockEdgeList, mockEdgeClusterList } = EdgeGeneralFixtures

describe('useEdgeClusterActions', () => {
  beforeEach(() => {
    mockServer.use(
      rest.delete(
        EdgeUrlsInfo.deleteEdge.url,
        (req, res, ctx) => {
          mockedDeleteApi()
          return res(ctx.status(202))
        }
      ),rest.delete(
        EdgeUrlsInfo.deleteEdgeCluster.url,
        (req, res, ctx) => {
          mockedDeleteClusterApi()
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
      rest.patch(
        EdgeUrlsInfo.sendOtp.url,
        (req, res, ctx) => {
          mockedSendOtp()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeUrlsInfo.factoryReset.url,
        (req, res, ctx) => {
          mockedFactoryReset()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should reboot successfully', async () => {
    const mockedCallback = jest.fn()
    const { result } = renderHook(() => useEdgeClusterActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { reboot } = result.current
    reboot(mockEdgeList.data as EdgeStatus[], mockedCallback)
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Reboot "5 SmartEdges"?')
    // eslint-disable-next-line max-len
    expect(dialog).toHaveTextContent('Rebooting the SmartEdge will disconnect all connected clients. Are you sure you want to reboot?')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reboot' }))
    await waitFor(() => {
      expect(mockedRebootApi).toBeCalledTimes(5)
    })
    await waitFor(() => {
      expect(mockedCallback).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('should delete node and cluster successfully', async () => {
    const mockedCallback = jest.fn()
    const { result } = renderHook(() => useEdgeClusterActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { deleteNodeAndCluster } = result.current
    const clusterData = mockEdgeClusterList.data
      .map(item => ({ ...item, isFirstLevel: true })).slice(2,4)
    const nodeData = mockEdgeList.data[4]
    deleteNodeAndCluster(
      [...clusterData, nodeData] as EdgeClusterTableDataType[],
      mockedCallback
    )
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Delete "3 SmartEdges"?')
    // eslint-disable-next-line max-len
    expect(dialog).toHaveTextContent('Are you sure you want to delete these SmartEdges?')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => {
      expect(mockedDeleteApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockedDeleteClusterApi).toBeCalledTimes(2)
    })
    await waitFor(() => {
      expect(mockedCallback).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('should send otp successfully', async () => {
    const mockedCallback = jest.fn()
    const { result } = renderHook(() => useEdgeClusterActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { sendEdgeOnboardOtp } = result.current
    const clusterData = mockEdgeClusterList.data
      .map(item => ({ ...item, isFirstLevel: true })).slice(2,4)
    const nodeData = mockEdgeList.data[4]
    sendEdgeOnboardOtp(
      [...clusterData, nodeData] as EdgeClusterTableDataType[],
      mockedCallback
    )
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Are you sure you want to send OTP?')
    await userEvent.click(within(dialog).getByRole('button', { name: 'OK' }))
    await waitFor(() => {
      expect(mockedSendOtp).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockedCallback).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('should reset and recover successfully', async () => {
    const mockedCallback = jest.fn()
    const { result } = renderHook(() => useEdgeClusterActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { sendFactoryReset } = result.current
    const clusterData = mockEdgeClusterList.data
      .map(item => ({ ...item, isFirstLevel: true })).slice(2,4)
    const nodeData = mockEdgeList.data[4]
    sendFactoryReset(
      [...clusterData, nodeData] as EdgeClusterTableDataType[],
      mockedCallback
    )
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Reset & Recover the Edge')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reset' }))
    await waitFor(() => {
      expect(mockedFactoryReset).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockedCallback).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
