import userEvent from '@testing-library/user-event'
import _         from 'lodash'

import { EdgeLag, EdgeLagFixtures, EdgePort, EdgePortConfigFixtures } from '@acx-ui/rc/utils'
import { Provider }                                                   from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'


import { LagDrawer } from './LagDrawer'

const { mockEdgePortConfig } = EdgePortConfigFixtures
const { mockedEdgeLagList } = EdgeLagFixtures
const { click } = userEvent
const mockEdgeCorePortPortConfig = _.cloneDeep(mockEdgePortConfig.ports)
mockEdgeCorePortPortConfig.splice(0, 1)

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, onChange, value, ...props }: React.PropsWithChildren<{
    onChange?: (value: string) => void,
    value: string
  }>) => {
    const { dropdownClassName, ...others } = props
    return (
      <select onChange={(e) => onChange?.(e.target.value)} value={value} {...others}>
        {children ? children : null}
      </select>
    )
  }
  Select.Option = 'option'
  return { ...components, Select }
})

jest.mock('../EdgeSdLan/useEdgeSdLanActions', () => ({
  ...jest.requireActual('../EdgeSdLan/useEdgeSdLanActions'),
  useGetEdgeSdLanByEdgeOrClusterId: () => ({
    edgeSdLanData: undefined
  })
}))

const mockedSetFieldValue = jest.fn()
const mockedOnChangeFn = jest.fn()
const mockedOnAdd = jest.fn()
const mockedOnEdit = jest.fn()
const mockedSetVisible = jest.fn()
describe('Edge LAG table drawer', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockReset()
    mockedOnAdd.mockReset()
    mockedOnEdit.mockReset()
    mockedOnChangeFn.mockReset()
    mockedSetVisible.mockReset()
  })


  it('should correctly render', async () => {
    render(
      <Provider>
        <LagDrawer
          clusterId='test-cluster'
          serialNumber='test-edge'
          visible={true}
          setVisible={mockedSetVisible}
          data={mockedEdgeLagList.content[0] as EdgeLag}
          portList={mockEdgeCorePortPortConfig as EdgePort[]}
          existedLagList={mockedEdgeLagList.content as EdgeLag[]}
          onAdd={mockedOnAdd}
          onEdit={mockedOnEdit}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await checkLoaded()
  })

  it('should correctly reset core port enabled when the core port member unselected', async () => {
    render(
      <Provider>
        <LagDrawer
          clusterId='test-cluster'
          serialNumber='test-edge'
          visible={true}
          setVisible={mockedSetVisible}
          portList={mockEdgeCorePortPortConfig as EdgePort[]}
          onAdd={mockedOnAdd}
          onEdit={mockedOnEdit}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await screen.findByText('Add LAG')
    // eslint-disable-next-line max-len
    const corePortEnabled = await screen.findByRole('checkbox', { name: /Use this LAG as Core LAG/ })
    expect(corePortEnabled).toBeDisabled()
    const port2 = screen.getByRole('checkbox', { name: 'Port2' })
    await click(port2)
    expect(corePortEnabled).not.toBeDisabled()
    // enable core port
    await click(corePortEnabled)
    expect(corePortEnabled).toBeChecked()

    // remove unselect memebers
    await click(port2)
    expect(corePortEnabled).not.toBeChecked()
    expect(corePortEnabled).toBeDisabled()
  })
})

const checkLoaded = async (): Promise<void> => {
  await screen.findByText('Edit LAG')
  const portTypeSelect = screen.getByRole('combobox', { name: 'Port Type' })
  const wanPortType = await screen.findByRole('option', { name: 'WAN' })
  expect(wanPortType).toBeDisabled()
  expect(portTypeSelect).toHaveValue('WAN')
  const dhcp = await screen.findByRole('radio', { name: 'DHCP' })
  expect(dhcp).toBeChecked()
}