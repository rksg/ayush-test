import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  EdgeGeneralFixtures,
  EdgeLag,
  EdgeLagFixtures,
  EdgePortConfigFixtures,
  EdgePortInfo,
  EdgeSdLanFixtures,
  EdgeSdLanUrls,
  EdgeUrlsInfo,
  CommonFixtures,
  CommonFixtureTypes
} from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { EdgePortsDataContext } from '../PortDataProvider'

import Lag from '.'

const { mockEdgeList } = EdgeGeneralFixtures
const { mockedEdgeLagList, mockEdgeLagStatusList } = EdgeLagFixtures
const { mockPortInfo } = EdgePortConfigFixtures
const { mockedSdLanDataListP2 } = EdgeSdLanFixtures
const { MockSelectComp } = CommonFixtures

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = (props: CommonFixtureTypes.MockSelectProps) =>
    <MockSelectComp {...props} />
  Select.Option = 'option'
  return { ...components, Select }
})

const defaultPortsContextdata = {
  portData: [],
  lagData: mockedEdgeLagList.content as EdgeLag[],
  portStatus: mockPortInfo as EdgePortInfo[],
  isLoading: false,
  isFetching: false
}

describe('EditEdge ports - LAG', () => {
  const mockedEdgeID = 'mocked_edge_id'

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.get(
        EdgeUrlsInfo.getEdgeLagList.url,
        (_, res, ctx) => res(ctx.json(mockedEdgeLagList))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteEdgeLag.url,
        (_, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataListP2 }))
      )
    )
  })

  it('Should render LAG tab correctly', async () => {
    render(
      <Provider>
        <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
          <Lag
            serialNumber={mockedEdgeID}
            lagStatusList={mockEdgeLagStatusList.data}
            isLoading={false}
          />
        </EdgePortsDataContext.Provider>
      </Provider>)
    const rows = await screen.findAllByRole('row', { name: /LAG \d/i })
    expect(rows.length).toBe(2)
  })

  it('Should open add LAG drawer and submit correctly', async () => {
    const spyAddLag = jest.fn()
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.addEdgeLag.url,
        (_, res, ctx) => {
          spyAddLag()
          return res(ctx.status(202))
        }
      )
    )
    render(
      <Provider>
        <EdgePortsDataContext.Provider value={{
          ...defaultPortsContextdata,
          lagData: [] as EdgeLag[]
        }}>
          <Lag
            serialNumber={mockedEdgeID}
            lagStatusList={mockEdgeLagStatusList.data}
            isLoading={false}
          />
        </EdgePortsDataContext.Provider>
      </Provider>)

    await userEvent.click(screen.getByRole('button', { name: 'Add LAG' }))
    const drawer = await screen.findByRole('dialog')
    expect(within(drawer).getByText('Add LAG')).toBeVisible()
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: '' }),
      '0'
    )
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Port Type' }),
      'WAN'
    )
    await userEvent.click(screen.getByRole('radio', { name: 'DHCP' }))
    await userEvent.click(within(drawer).getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(spyAddLag).toBeCalled())
  })

  it('Should edit LAG correctly', async () => {
    const spyEditLag = jest.fn()
    mockServer.use(
      rest.put(
        EdgeUrlsInfo.updateEdgeLag.url,
        (_, res, ctx) => {
          spyEditLag()
          return res(ctx.status(202))
        }
      )
    )
    render(
      <Provider>
        <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
          <Lag
            serialNumber={mockedEdgeID}
            lagStatusList={mockEdgeLagStatusList.data}
            isLoading={false}
          />
        </EdgePortsDataContext.Provider>
      </Provider>)

    const lag0Row = await screen.findByRole('row', { name: /LAG 1/i })
    await userEvent.click(within(lag0Row).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const drawer = await screen.findByRole('dialog')
    expect(within(drawer).getByText('Edit LAG')).toBeVisible()
    const natEnabled = await screen.findByRole('switch', { name: /Use NAT Service/ })
    expect(natEnabled).toBeChecked()
    await userEvent.click(natEnabled)
    await userEvent.click(within(drawer).getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(spyEditLag).toBeCalled())
  })

  it('Should delete LAG correctly', async () => {
    render(
      <Provider>
        <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
          <Lag
            serialNumber={mockedEdgeID}
            lagStatusList={mockEdgeLagStatusList.data}
            isLoading={false}
          />
        </EdgePortsDataContext.Provider>
      </Provider>)

    const row = await screen.findByRole('row', { name: /LAG 1/i })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete LAG' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })
})
