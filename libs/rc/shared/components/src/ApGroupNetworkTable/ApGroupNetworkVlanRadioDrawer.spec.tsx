import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { KeyValue, Network } from '@acx-ui/rc/utils'
import { render, screen }    from '@acx-ui/test-utils'

import { apGroupNetworkTableData }       from './__tests__/fixtures'
import { ApGroupNetworkVlanRadioDrawer } from './ApGroupNetworkVlanRadioDrawer'

import { ApGroupNetworkVlanRadioContext } from './index'

describe('ApGroupNetworkVlanRadioDrawer', () => {
  it('should render successfully', () => {
    const params = { tenantId: 'tenant-id', apGroupId: 'testApGroupId' }
    const mockedUpdateData = jest.fn()
    const venueId = 'testVenueId'
    const apGroupId = 'testApGroupId'
    const setTableData = jest.fn()
    const drawerStatus = {
      visible: false,
      editData: []
    }
    const setDrawerStatus = jest.fn()
    const vlanPoolingNameMap = [] as KeyValue<string, string>[]
    const tableData = apGroupNetworkTableData as unknown as Network[]

    render(
      <Form>
        <ApGroupNetworkVlanRadioContext.Provider value={{
          venueId: venueId!, apGroupId: apGroupId!,
          tableData, setTableData,
          drawerStatus, setDrawerStatus,
          vlanPoolingNameMap }} >
          <ApGroupNetworkVlanRadioDrawer updateData={mockedUpdateData} />
        </ApGroupNetworkVlanRadioContext.Provider>
      </Form>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/details/networks' }
      }
    )

    expect(screen.queryAllByText('Edit VLAN & Radio')).toStrictEqual([])
  })

  it('should render successfully with drawer', async () => {
    const params = { tenantId: 'tenant-id', apGroupId: 'testApGroupId' }
    const mockedUpdateData = jest.fn()
    const venueId = 'testVenueId'
    const apGroupId = 'testApGroupId'
    const setTableData = jest.fn()
    const tableData = apGroupNetworkTableData as unknown as Network[]
    const drawerStatus = {
      visible: true,
      editData: [tableData[0]] as Network[]
    }
    const setDrawerStatus = jest.fn()
    const vlanPoolingNameMap = [] as KeyValue<string, string>[]

    render(
      <Form>
        <ApGroupNetworkVlanRadioContext.Provider value={{
          venueId: venueId!, apGroupId: apGroupId!,
          tableData, setTableData,
          drawerStatus, setDrawerStatus,
          vlanPoolingNameMap }} >
          <ApGroupNetworkVlanRadioDrawer updateData={mockedUpdateData} />
        </ApGroupNetworkVlanRadioContext.Provider>
      </Form>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/details/networks' }
      }
    )

    expect(await screen.findByText('Edit VLAN & Radio')).toBeVisible()

    await userEvent.click(screen.getByText(/ok/i))
    expect(mockedUpdateData).toHaveBeenCalled()
  })
})
