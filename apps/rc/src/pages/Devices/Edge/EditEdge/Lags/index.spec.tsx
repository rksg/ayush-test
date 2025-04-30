
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { edgeApi }                                                                             from '@acx-ui/rc/services'
import { EdgeGeneralFixtures, EdgeLag, EdgeLagFixtures, EdgePortConfigFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                                 from '@acx-ui/test-utils'

import { EditEdgeDataContext, EditEdgeDataContextType } from '../EditEdgeDataProvider'

import Lags from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockEdgePortConfig } = EdgePortConfigFixtures
const { mockEdgeLagStatusList, mockedEdgeLagList } = EdgeLagFixtures

jest.mock('../ClusterNavigateWarning', () => ({
  ...jest.requireActual('../ClusterNavigateWarning'),
  ClusterNavigateWarning: () => <div data-testid='ClusterNavigateWarning' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeLagTable: (
    { onAdd, onEdit, onDelete }: {
      onAdd: (serialNumber: string, data: EdgeLag) => Promise<void>,
      onEdit: (serialNumber: string, data: EdgeLag) => Promise<void>,
      onDelete: (serialNumber: string, id: string) => Promise<void>
    }
  ) => <div data-testid='EdgeLagTable'>
    <button
      onClick={() => onAdd('t-serialNumber', mockedEdgeLagList.content[0] as EdgeLag)}
      children={'Add'}
    />
    <button
      onClick={() => onEdit('t-serialNumber', mockedEdgeLagList.content[0] as EdgeLag)}
      children={'Edit'}
    />
    <button onClick={() => onDelete('t-serialNumber', '1')} children={'Delete'} />
  </div>
}))

const addRequestSpy = jest.fn()
const editRequestSpy = jest.fn()
const deleteRequestSpy = jest.fn()

describe('EditEdge - Lags', () => {
  let params: { tenantId: string, serialNumber: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000'
    }
    store.dispatch(edgeApi.util.resetApiState())
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.addEdgeLag.url,
        (req, res, ctx) => {
          addRequestSpy()
          return res(ctx.status(202))
        }
      ),
      rest.put(
        EdgeUrlsInfo.updateEdgeLag.url,
        (req, res, ctx) => {
          editRequestSpy()
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeUrlsInfo.deleteEdgeLag.url,
        (req, res, ctx) => {
          deleteRequestSpy()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should render successfully', async () => {
    render(
      <Provider>
        <EditEdgeDataContext.Provider
          value={{
            portData: mockEdgePortConfig.ports,
            lagData: mockedEdgeLagList.content,
            lagStatus: mockEdgeLagStatusList.data,
            isFetching: false,
            clusterInfo: mockEdgeClusterList.data[0],
            isCluster: true
          } as unknown as EditEdgeDataContextType}
        >
          <Lags />
        </EditEdgeDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/lags' }
      })
    expect(screen.getByTestId('ClusterNavigateWarning')).toBeVisible()
    expect(screen.getByTestId('EdgeLagTable')).toBeVisible()
  })

  it('should add lag successfully', async () => {
    render(
      <Provider>
        <EditEdgeDataContext.Provider
          value={{
            portData: mockEdgePortConfig.ports,
            lagData: mockedEdgeLagList.content,
            lagStatus: mockEdgeLagStatusList.data,
            isFetching: false,
            clusterInfo: mockEdgeClusterList.data[0],
            isCluster: true
          } as unknown as EditEdgeDataContextType}
        >
          <Lags />
        </EditEdgeDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/lags' }
      })
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(addRequestSpy).toHaveBeenCalledTimes(1))
  })

  it('should edit lag successfully', async () => {
    render(
      <Provider>
        <EditEdgeDataContext.Provider
          value={{
            portData: mockEdgePortConfig.ports,
            lagData: mockedEdgeLagList.content,
            lagStatus: mockEdgeLagStatusList.data,
            isFetching: false,
            clusterInfo: mockEdgeClusterList.data[0],
            isCluster: true
          } as unknown as EditEdgeDataContextType}
        >
          <Lags />
        </EditEdgeDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/lags' }
      })
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await waitFor(() => expect(editRequestSpy).toHaveBeenCalledTimes(1))
  })

  it('should delete lag successfully', async () => {
    render(
      <Provider>
        <EditEdgeDataContext.Provider
          value={{
            portData: mockEdgePortConfig.ports,
            lagData: mockedEdgeLagList.content,
            lagStatus: mockEdgeLagStatusList.data,
            isFetching: false,
            clusterInfo: mockEdgeClusterList.data[0],
            isCluster: true
          } as unknown as EditEdgeDataContextType}
        >
          <Lags />
        </EditEdgeDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/edit/lags' }
      })
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(deleteRequestSpy).toHaveBeenCalledTimes(1))
  })
})