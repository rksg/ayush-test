import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { EdgeSubInterfaceFixtures, SubInterface } from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import { render, screen, waitFor, within }        from '@acx-ui/test-utils'

import { defaultCxtData }                                             from '../__tests__/fixtures'
import { ClusterConfigWizardContext, ClusterConfigWizardContextType } from '../ClusterConfigWizardDataProvider'

import { SubInterfaceTable, SubInterfaceTableProps } from './SubInterfaceTable'

const mockedSetFieldValue = jest.fn()
const mockedGetFieldValue = jest.fn()
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => ({
    form: {
      getFieldValue: mockedGetFieldValue,
      setFieldValue: mockedSetFieldValue
    }
  })
}))

jest.mock('./SubInterfaceDrawer', () => (
  ({ visible, data, handleAdd, handleUpdate }: {
    visible: boolean,
    data?: SubInterface,
    handleAdd: (data: SubInterface) => Promise<unknown>,
    handleUpdate: (data: SubInterface) => Promise<unknown>
  }) =>
    <div data-testid='subDialog'>
      <label>{visible ? 'visible' : 'invisible'}</label>
      <div>{data?.vlan + ''}</div>
      <button onClick={async () => {
        await handleAdd({
          id: 'new_id',
          portType: 'LAN',
          ipMode: 'DHCP',
          vlan: 4095
        } as SubInterface)
      }}>Add</button>
      <button onClick={async () => {
        await handleUpdate({
          ...data,
          vlan: 4095
        } as SubInterface)
      }}>Apply</button>
    </div>
))

const { mockEdgeSubInterfaces } = EdgeSubInterfaceFixtures

describe('SubInterfaceTable', () => {
  const mockProps: SubInterfaceTableProps = {
    serialNumber: '962604D7DCEEE011ED9715000C2949F53E',
    currentTab: 'tab1',
    ip: '192.168.1.1',
    mac: '00:1A:2B:3C:4D:5E',
    namePath: [
      'portSubInterfaces',
      '962604D7DCEEE011ED9715000C2949F53E',
      '4f40f9cd-54fe-49bc-aade-bbc25ee2b6a7'
    ]
  }

  const context: ClusterConfigWizardContextType = {
    ...defaultCxtData,
    clusterNetworkSettings: {
      portSettings: [],
      lagSettings: [],
      virtualIpSettings: [
        {
          virtualIp: '192.168.1.3',
          timeoutSeconds: 10,
          ports: [
            {
              serialNumber: '962604D7DCEEE011ED9715000C2949F53E',
              portName: 'port3.1024'
            }
          ]
        }
      ]
    }
  }

  beforeEach(() => {
    mockedGetFieldValue.mockReset()
    mockedSetFieldValue.mockReset()
    mockedGetFieldValue.mockReturnValue([])
  })

  it('should display port ip and mac correctly', async () => {
    renderTable(mockProps)

    expect(screen.getByText(
      'IP Address: 192.168.1.1 | MAC Address: 00:1A:2B:3C:4D:5E'
    )).toBeInTheDocument()
  })

  it('should display sub-interface row correctly', async () => {
    const mockSubInterface0 = mockEdgeSubInterfaces.content[0] as SubInterface
    const mockSubInterface4 = mockEdgeSubInterfaces.content[4] as SubInterface
    mockedGetFieldValue.mockReturnValue([mockSubInterface0, mockSubInterface4])

    renderTable(mockProps)

    expect(screen.getByText('#')).toBeInTheDocument()
    expect(screen.getByText('IP Type')).toBeInTheDocument()
    expect(screen.getByText('Port Type')).toBeInTheDocument()
    expect(screen.getByText('VLAN')).toBeInTheDocument()
    expect(screen.getByText('IP Address')).toBeInTheDocument()
    expect(screen.getByText('Subnet Mask')).toBeInTheDocument()

    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(3)
    expect(within(rows[1]).getByText('DHCP')).toBeInTheDocument()
    expect(within(rows[1]).getByText('LAN')).toBeInTheDocument()
    expect(within(rows[1]).getByText('2')).toBeInTheDocument()
    expect(within(rows[2]).getByText('STATIC')).toBeInTheDocument()
    expect(within(rows[2]).getByText('LAN')).toBeInTheDocument()
    expect(within(rows[2]).getByText('4.4.4.4')).toBeInTheDocument()
    expect(within(rows[2]).getByText('255.255.255.0')).toBeInTheDocument()
    expect(within(rows[2]).getByText('88')).toBeInTheDocument()
  })

  it('Add a sub-interface', async () => {
    const mockSubInterface = mockEdgeSubInterfaces.content[4] as SubInterface
    mockedGetFieldValue.mockReturnValue([mockSubInterface])

    renderTable(mockProps)

    const user = userEvent.setup()
    await user.click(await screen.findByText('Add Sub-interface'))
    expect(await screen.findByText('visible')).toBeInTheDocument()
    await user.click(await screen.findByText('Add'))

    expect(mockedSetFieldValue).toHaveBeenCalledWith(mockProps.namePath, [
      mockSubInterface,
      {
        id: 'new_id',
        ipMode: 'DHCP',
        portType: 'LAN',
        vlan: 4095
      }
    ])
  })

  it('Delete a sub-interface', async () => {
    const mockSubInterface = mockEdgeSubInterfaces.content[4] as SubInterface
    mockedGetFieldValue.mockReturnValue([mockSubInterface])

    renderTable(mockProps)

    const user = userEvent.setup()
    const rows = await screen.findAllByRole('row')
    await user.click(within(rows[1]).getByRole('radio'))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "88"?')
    const confirmDialog = await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Delete Sub-Interface' }))
    await waitFor(() => expect(confirmDialog).not.toBeVisible())

    expect(mockedSetFieldValue).toHaveBeenCalledWith(mockProps.namePath, [])
  })

  it('Sub-interface as virtual ip interface cannot be deleted', async () => {
    const mockSubInterface = {
      ...mockEdgeSubInterfaces.content[3],
      vlan: 1024,
      interfaceName: 'port3.1024'
    } as SubInterface
    mockedGetFieldValue.mockReturnValue([mockSubInterface])

    renderTable(mockProps)

    const user = userEvent.setup()
    const rows = await screen.findAllByRole('row')
    await user.click(within(rows[1]).getByRole('radio'))

    const deleteButton = await screen.findByRole('button', { name: 'Delete' })
    expect(deleteButton).toBeDisabled()
  })

  it('Add sub-interface button should be disabled when reach maximum limit', async () => {
    const mockSubInterfaces = Array.from({ length: 16 }, (_, i) => ({
      ...mockEdgeSubInterfaces.content[3],
      vlan: i + 1,
      interfaceName: `port3.${i + 1}`,
      id: 'random-id-' + i
    }))
    mockedGetFieldValue.mockReturnValue(mockSubInterfaces)

    renderTable(mockProps)

    const addButton = await screen.findByRole('button', { name: 'Add Sub-interface' })
    expect(addButton).toBeDisabled()
  })

  it('should have edit dialog show up', async () => {
    const mockSubInterface = mockEdgeSubInterfaces.content[4] as SubInterface
    mockedGetFieldValue.mockReturnValue([mockSubInterface])

    renderTable(mockProps)

    const user = userEvent.setup()
    await screen.findAllByRole('columnheader')
    const rows = await screen.findAllByRole('row')
    await user.click(within(rows[1]).getByRole('radio'))
    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    const dialog = await screen.findByTestId('subDialog')
    expect(within(dialog).queryByText('visible')).toBeValid()
    expect(within(dialog).queryByText('88')).toBeValid()

    await user.click(await screen.findByText('Apply'))
    expect(mockedSetFieldValue).toHaveBeenCalledWith(mockProps.namePath, [{
      ...mockSubInterface,
      vlan: 4095
    }])
  })

  const renderTable = (props: SubInterfaceTableProps) => {
    return render(
      <Provider>
        <ClusterConfigWizardContext.Provider value={context}>
          <Form>
            <SubInterfaceTable {...props} />
          </Form>
        </ClusterConfigWizardContext.Provider>
      </Provider>
    )
  }
})