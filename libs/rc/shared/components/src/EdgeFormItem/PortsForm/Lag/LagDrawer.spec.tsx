import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeLag, EdgeLagFixtures, EdgePortConfigFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                       from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                            from '@acx-ui/test-utils'

import { EdgePortsDataContext } from '../PortDataProvider'

import { LagDrawer } from './LagDrawer'

const { mockEdgePortConfig } = EdgePortConfigFixtures
const { mockedEdgeLagList } = EdgeLagFixtures
const noCoreLagList = mockedEdgeLagList.content.map(item => ({ ...item, corePortEnabled: false }))

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

const defaultPortsContextdata = {
  portData: [],
  lagData: noCoreLagList as EdgeLag[],
  isLoading: false,
  isFetching: false
}

const mockedSetVisible = jest.fn()

describe('EditEdge ports - LAG Drawer', () => {
  const mockedEdgeID = 'mocked_edge_id'

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.addEdgeLag.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.delete(
        EdgeUrlsInfo.updateEdgeLag.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('Should add LAG correctly', async () => {
    render(
      <Provider>
        <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
          <LagDrawer
            serialNumber={mockedEdgeID}
            visible={true}
            setVisible={mockedSetVisible}
            portList={mockEdgePortConfig.ports}
          />
        </EdgePortsDataContext.Provider>
      </Provider>)

    const selector = await screen.findAllByRole('combobox')
    await userEvent.selectOptions(selector[0], '2')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedSetVisible).toBeCalled())
  })

  it('Should pop up warning modal when select inused port', async () => {
    render(
      <Provider>
        <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
          <LagDrawer
            serialNumber={mockedEdgeID}
            visible={true}
            setVisible={mockedSetVisible}
            portList={mockEdgePortConfig.ports}
          />
        </EdgePortsDataContext.Provider>
      </Provider>)

    const selector = await screen.findAllByRole('combobox')
    await userEvent.selectOptions(selector[0], '2')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Port1' }))
    await userEvent.click(screen.getByRole('switch', { name: 'Port Enabled' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    const okBtn = await screen.findByRole('button', { name: 'Replace with LAG settings' })
    await userEvent.click(okBtn)
    await waitFor(() => expect(mockedSetVisible).toBeCalled())
    await waitFor(() => expect(okBtn).not.toBeVisible())
  })

  it('Should enable port when enabling LAG', async () => {
    render(
      <Provider>
        <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
          <LagDrawer
            serialNumber={mockedEdgeID}
            visible={true}
            setVisible={mockedSetVisible}
            portList={mockEdgePortConfig.ports}
          />
        </EdgePortsDataContext.Provider>
      </Provider>)

    const lagEnabled = screen.getByRole('switch', { name: /lag enabled/i })
    await waitFor(() => expect(lagEnabled).toBeChecked())
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Port1' }))
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Port2' }))
    const portEnableds = await screen.findAllByRole('switch', { name: 'Port Enabled' })
    for(let portEnabled of portEnableds) {
      await waitFor(() => expect(portEnabled).toBeChecked())
    }
  })

  it('Should pop up a dialog when disabling LAG', async () => {
    render(
      <Provider>
        <EdgePortsDataContext.Provider value={defaultPortsContextdata}>
          <LagDrawer
            serialNumber={mockedEdgeID}
            visible={true}
            setVisible={mockedSetVisible}
            portList={mockEdgePortConfig.ports}
          />
        </EdgePortsDataContext.Provider>
      </Provider>)

    const lagEnabled = screen.getByRole('switch', { name: /lag enabled/i })
    await waitFor(() => expect(lagEnabled).toBeChecked())
    await userEvent.click(lagEnabled)
    const warningStr = await screen.findByText('Warning')
    expect(warningStr).toBeVisible()
    const disableButton = screen.getByRole('button', { name: 'Disable' })
    await userEvent.click(disableButton)
    await waitFor(() => expect(warningStr).not.toBeVisible())
    await waitFor(() => expect(disableButton).not.toBeVisible())
    await waitFor(() => expect(lagEnabled).not.toBeChecked())
  })
})
