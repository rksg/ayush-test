import userEvent from '@testing-library/user-event'

import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { ApGroupNetworkTableData, vlanPoolList } from '../__tests__/fixtures'

import { ApGroupVlanRadioDrawer, ApGroupVlanRadioDrawerState } from './ApGroupVlanRadioDrawer'

import { ApGroupVlanRadioContext } from './index'

const vlanPoolingNameMap = vlanPoolList.map(vp => ({ key: vp.id, value: vp.name }))
const venueId = 'venue-id'
const apGroupId = 'apgroup-id'
const editData = ApGroupNetworkTableData[0]
const drawerStatus: ApGroupVlanRadioDrawerState = {
  visible: true,
  editData
}

const handleUpdateApGroupVlanRadio = jest.fn()
const setDrawerStatus = jest.fn()

describe('ApGroupVlanRadioDrawer', () => {

  it('should render correctly', async ()=> {
    render(
      <Provider>
        <ApGroupVlanRadioContext.Provider value={{
          venueId, apGroupId,
          drawerStatus, setDrawerStatus,
          vlanPoolingNameMap }} >
          <ApGroupVlanRadioDrawer updateData={handleUpdateApGroupVlanRadio}/>
        </ApGroupVlanRadioContext.Provider>
      </Provider>
    )

    const networkName = await screen.findByText(editData.name)
    expect(networkName).toBeVisible()

    const vlanType = await screen.findByRole('combobox', { name: 'VLAN' })
    expect(vlanType).toBeInTheDocument()

    const vlanIdInput = await screen.findByRole('spinbutton', { name: /VLANs/ })
    expect(vlanIdInput).toBeVisible()

    const radios = await screen.findByRole('combobox', { name: /Radios/ })
    expect(radios).toBeInTheDocument()

    const closeBtn = await screen.findByRole('button', { name: 'Close' })
    await userEvent.click(closeBtn)
    // close deawer
    await waitFor(() => expect(setDrawerStatus).toHaveBeenCalledWith({
      editData: {},
      visible: false
    }))
  })

  it('Save settings with vlan id and radios', async ()=> {
    render(
      <ApGroupVlanRadioContext.Provider value={{
        venueId, apGroupId,
        drawerStatus, setDrawerStatus,
        vlanPoolingNameMap }} >
        <ApGroupVlanRadioDrawer updateData={handleUpdateApGroupVlanRadio}/>
      </ApGroupVlanRadioContext.Provider>
    )

    const networkName = await screen.findByText(editData.name)
    expect(networkName).toBeVisible()

    const vlanIdInput = await screen.findByRole('spinbutton', { name: /VLANs/ })
    expect(vlanIdInput).toBeVisible()
    await userEvent.type(vlanIdInput, '0')

    const radios = await screen.findByRole('combobox', { name: /Radios/ })
    await userEvent.click(radios)
    const titles = await screen.findAllByTitle('2.4 GHz')
    expect(titles).toHaveLength(2)
    await userEvent.click(titles[1])

    const okBtn = await screen.findByRole('button', { name: 'OK' })
    await userEvent.click(okBtn)
    // update table data
    await waitFor(() => expect(handleUpdateApGroupVlanRadio).toHaveBeenCalled())
    // close deawer
    await waitFor(() => expect(setDrawerStatus).toHaveBeenCalledWith({
      editData: {},
      visible: false
    }))
  })

  it('Save settings with vlan pool', async ()=> {
    render(
      <ApGroupVlanRadioContext.Provider value={{
        venueId, apGroupId,
        drawerStatus, setDrawerStatus,
        vlanPoolingNameMap }} >
        <ApGroupVlanRadioDrawer updateData={handleUpdateApGroupVlanRadio}/>
      </ApGroupVlanRadioContext.Provider>
    )

    const networkName = await screen.findByText(editData.name)
    expect(networkName).toBeVisible()

    await userEvent.click(await screen.findByRole('combobox', { name: 'VLAN' }))
    await userEvent.click(await screen.findByTitle('Pool'))

    const vlanPoolCombox = await screen.findByRole('combobox', { name: /VLAN Pool/ })
    expect(vlanPoolCombox).toBeInTheDocument()
    await userEvent.click(vlanPoolCombox)
    await userEvent.click(await screen.findByTitle(vlanPoolingNameMap[0].value))


    const okBtn = await screen.findByRole('button', { name: 'OK' })
    await userEvent.click(okBtn)
    // update table data
    await waitFor(() => expect(handleUpdateApGroupVlanRadio).toHaveBeenCalled())
    // close deawer
    await waitFor(() => expect(setDrawerStatus).toHaveBeenCalledWith({
      editData: {},
      visible: false
    }))
  })
})
