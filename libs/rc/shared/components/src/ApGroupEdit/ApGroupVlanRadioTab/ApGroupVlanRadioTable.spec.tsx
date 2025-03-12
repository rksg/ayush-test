import userEvent from '@testing-library/user-event'

import { Network }                         from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { render, screen, waitFor, within } from '@acx-ui/test-utils'

import { ApGroupNetworkTableData, vlanPoolList } from '../__tests__/fixtures'

import { ApGroupVlanRadioDrawerState } from './ApGroupVlanRadioDrawer'
import { ApGroupVlanRadioTable }       from './ApGroupVlanRadioTable'

import { ApGroupVlanRadioContext } from './index'

const vlanPoolingNameMap = vlanPoolList.map(vp => ({ key: vp.id, value: vp.name }))
const venueId = '991eb992ece042a183b6945a2398ddb9'
const apGroupId = '58195e050b8a4770acc320f6233ad8d9'
const mockedTableData = ApGroupNetworkTableData as unknown as Network[]

const setDrawerStatus = jest.fn()
const drawerStatus: ApGroupVlanRadioDrawerState = {
  visible: false,
  editData: {}
}
describe('ApGroupVlanRadioTable', () => {
  const params = {
    tenantId: 'tenant-id',
    apGroupId: '58195e050b8a4770acc320f6233ad8d9',
    action: 'edit',
    activeTab: 'vlanRadio'
  }

  it('should render correctly', async ()=> {
    render(
      <Provider>
        <ApGroupVlanRadioContext.Provider value={{
          venueId, apGroupId,
          tableData: mockedTableData,
          drawerStatus, setDrawerStatus,
          vlanPoolingNameMap }} >
          <ApGroupVlanRadioTable />
        </ApGroupVlanRadioContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      })

    const rows = await screen.findAllByRole('row')
    expect(rows.length).toBe(5)
    // eslint-disable-next-line max-len
    screen.getByRole('row', { name: 'joe-aaa Enterprise AAA (802.1X) - WPA2 Enterprise VLAN-10 (Default) 5 GHz, 2.4 GHz' })
    screen.getByRole('row', { name: 'joe-open Open Network VLAN-10 (Default) 5 GHz, 2.4 GHz' })
    screen.getByRole('row',
      { name: 'joe-open-owe-transition Open Network VLAN-10 (Default) 5 GHz, 2.4 GHz' })
    screen.getByRole('row',
      { name: 'joe-open-owe-transition-owe-tr Open Network VLAN-10 (Default) 5 GHz, 2.4 GHz' })
  })

  it('should trigger edit drawer', async ()=> {
    render(
      <Provider>
        <ApGroupVlanRadioContext.Provider value={{
          venueId, apGroupId,
          tableData: mockedTableData,
          drawerStatus, setDrawerStatus,
          vlanPoolingNameMap }} >
          <ApGroupVlanRadioTable />
        </ApGroupVlanRadioContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )

    // eslint-disable-next-line max-len
    const row = await screen.findByRole('row', { name: /joe-open-owe-transition Open Network/i })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    await waitFor(() => expect(setDrawerStatus).toBeCalledWith({
      visible: true,
      editData: mockedTableData[2]
    }))
  })

  it('should not select system network', async ()=> {
    render(
      <Provider>
        <ApGroupVlanRadioContext.Provider value={{
          venueId, apGroupId,
          tableData: mockedTableData,
          drawerStatus, setDrawerStatus,
          vlanPoolingNameMap }} >
          <ApGroupVlanRadioTable />
        </ApGroupVlanRadioContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/devices/apgroups/:apGroupId/:action/:activeTab' }
      }
    )

    // eslint-disable-next-line max-len
    const row = await screen.findByRole('row', { name: /joe-open-owe-transition-owe-tr/i })
    expect(within(row).getByRole('radio')).toBeDisabled()
  })
})
