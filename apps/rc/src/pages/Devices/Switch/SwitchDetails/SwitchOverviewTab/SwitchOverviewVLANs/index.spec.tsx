import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import { switchApi }                          from '@acx-ui/rc/services'
import { SwitchUrlsInfo, SwitchRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                    from '@acx-ui/store'
import {
  render,
  screen,
  mockServer,
  within,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  lagList,
  portList,
  portList_7150_C12P,
  switchDetails,
  transformdPortViewData,
  transformdPortViewData_7150_C12P,
  vlanList
} from './__tests__/fixtures'

import { SwitchOverviewVLANs, getPortViewData } from '.'

describe('Switch Overview VLAN', () => {
  const params = {
    tenantId: 'tenant-id',
    switchId: 'switch-id',
    serialNumber: 'switch-serialNumber'
  }

  beforeEach(()=>{
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(SwitchUrlsInfo.getVlanListBySwitchLevel.url,
        (req, res, ctx) => res(ctx.json(vlanList))
      ),
      rest.get(SwitchUrlsInfo.getLagList.url,
        (req, res, ctx) => res(ctx.json([]))
      )
    )
  })
  afterEach(() => Modal.destroyAll())

  it('should render vlan table correctly', async () => {
    render(<Provider><SwitchOverviewVLANs switchDetail={switchDetails}/>
    </Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/vlans'
      }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/111/i)).toBeVisible()
    await userEvent.click(screen.getByText(/111/i))
    expect(await screen.findByText(/View VLAN/i)).toBeVisible()
    await userEvent.click(screen.getByRole('button', {
      name: /close/i
    }))
    await userEvent.click(await screen.findByText(/666/i))
    expect(await screen.findByText(/View VLAN/i)).toBeVisible()
    await userEvent.click(screen.getByRole('button', {
      name: /close/i
    }))
    await userEvent.click(await screen.findByText(/222/i))
    expect(await screen.findByText(/View VLAN/i)).toBeVisible()
  })

  describe('Support Switch Level Vlan', () => {
    const addVlanSpy = jest.fn()
    const updateVlanSpy = jest.fn()
    const deleteVlanSpy = jest.fn()
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_LEVEL_VLAN)
      addVlanSpy.mockClear()
      updateVlanSpy.mockClear()
      mockServer.use(
        rest.post(SwitchUrlsInfo.getSwitchPortlist.url,
          (req, res, ctx) => res(ctx.json(portList))
        ),
        rest.get(SwitchUrlsInfo.getLagList.url,
          (req, res, ctx) => res(ctx.json(lagList))
        ),
        rest.post(SwitchUrlsInfo.getSwitchRoutedList.url,
          (_, res, ctx) => res(ctx.json({}))
        ),
        rest.post(SwitchRbacUrlsInfo.addSwitchVlans.url,
          (req, res, ctx) => {
            addVlanSpy()
            return res(ctx.json({}))
          }
        ),
        rest.put(SwitchRbacUrlsInfo.updateSwitchVlan.url,
          (req, res, ctx) => {
            updateVlanSpy()
            return res(ctx.json({}))
          }
        ),
        rest.delete(SwitchRbacUrlsInfo.deleteSwitchVlan.url,
          (req, res, ctx) => {
            deleteVlanSpy()
            return res(ctx.json({}))
          }
        )
      )
    })

    it('should render vlan table correctly', async () => {
      render(<Provider><SwitchOverviewVLANs switchDetail={switchDetails}/>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/vlans'
        }
      })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText(/Add VLAN/i)).toBeVisible()
      expect(await screen.findByText(/Default VLAN settings/i)).toBeVisible()
      expect(await screen.findByText(/111/i)).toBeVisible()
      expect(await screen.findAllByRole('radio')).toHaveLength(vlanList.data.length)

      const vlan555 = await screen.findByRole('row', { name: /555/i }) // LAG
      await userEvent.click(await within(vlan555).findByRole('radio'))
      expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
    })

    it('should edit DEFAULT VLAN by using Default VLAN settings button correctly', async () => {
      render(<Provider><SwitchOverviewVLANs switchDetail={switchDetails}/>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/vlans'
        }
      })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText(/111/i)).toBeVisible()

      await userEvent.click(await screen.findByText(/Default VLAN settings/i))
      const drawer = await screen.findByRole('dialog')
      expect(await within(drawer).findByText('Default VLAN settings')).toBeVisible()

      await userEvent.click(await within(drawer).findByRole('button', { name: /Save/i }))
      expect(updateVlanSpy).toBeCalled()
    })

    it('should edit DEFAULT VLAN correctly', async () => {
      render(<Provider><SwitchOverviewVLANs switchDetail={switchDetails}/>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/vlans'
        }
      })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText(/111/i)).toBeVisible()

      const vlan111 = await screen.findByRole('row', { name: /111/i })
      await userEvent.click(await within(vlan111).findByRole('radio'))

      expect(await screen.findByRole('button', { name: 'Edit' })).toBeVisible()
      expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()

      await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
      const drawer = await screen.findByRole('dialog')
      expect(await within(drawer).findByText('Default VLAN settings')).toBeVisible()

      const vlanIdInput = await screen.findByLabelText('VLAN ID')
      await userEvent.clear(vlanIdInput)
      await userEvent.type(vlanIdInput, '10')

      await userEvent.click(await within(drawer).findByRole('button', { name: /Save/i }))
      expect(updateVlanSpy).toBeCalled()
    })

    it('should add VLAN correctly', async () => {
      render(<Provider><SwitchOverviewVLANs switchDetail={switchDetails}/>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/vlans'
        }
      })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText(/Add VLAN/i)).toBeVisible()
      expect(await screen.findByText(/Default VLAN settings/i)).toBeVisible()
      expect(await screen.findByText(/111/i)).toBeVisible()

      await userEvent.click(await screen.findByText(/Add VLAN/i))
      const drawer = await screen.findByRole('dialog')
      expect(await within(drawer).findByText('Add VLAN')).toBeVisible()
      expect(await within(drawer).findByText('Add Ports')).toBeVisible()

      await userEvent.type( await screen.findByLabelText('VLAN ID'), '6')
      await userEvent.click(await screen.findByText(/Add Ports/i))

      const vlansPortModal = await screen.findByTestId('vlanSettingModal')
      const untagged1_1_5 = await within(vlansPortModal).findByTestId('untagged_module1_1_5')
      const untagged1_1_6 = await within(vlansPortModal).findByTestId('untagged_module1_1_6')
      const untagged1_1_7 = await within(vlansPortModal).findByTestId('untagged_module1_1_7')
      expect(untagged1_1_5).toHaveAttribute('data-disabled', 'true')
      expect(untagged1_1_6).toHaveAttribute('data-disabled', 'true')
      expect(untagged1_1_7).toHaveAttribute('data-disabled', 'true')

      await userEvent.hover(untagged1_1_5)
      await waitFor(async () => expect(await screen.findByRole('tooltip')).toBeInTheDocument())
      expect(screen.getByRole('tooltip')).toHaveTextContent('Port is member of LAG – LAG1')

      await userEvent.click(await within(vlansPortModal).findByTestId('untagged_module1_1_3'))
      await userEvent.click( await within(vlansPortModal).findByRole('button', { name: 'Next' }))
      await userEvent.click(await within(vlansPortModal).findByTestId('tagged_module1_1_4'))
      await userEvent.click( await within(vlansPortModal).findByRole('button', { name: 'Add' }))

      const portsTable = await within(drawer).findByRole('table')
      expect(await within(portsTable).findByText('1/1/3')).toBeVisible()
      expect(await within(portsTable).findByText('1/1/4')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }) )
      expect(addVlanSpy).toBeCalled()
    })

    it('should edit VLAN correctly', async () => {
      render(<Provider><SwitchOverviewVLANs switchDetail={switchDetails}/>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/vlans'
        }
      })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText(/111/i)).toBeVisible()

      const vlan444 = await screen.findByRole('row', { name: /444/i })
      await userEvent.click(await within(vlan444).findByRole('radio'))
      expect(await screen.findByRole('button', { name: 'Delete' })).toBeVisible()

      await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
      const drawer = await screen.findByRole('dialog')
      expect(within(drawer).getByText('Edit VLAN')).toBeVisible()

      const portsTable = await within(drawer).findByRole('table')
      expect(await within(portsTable).findByRole('row', { name: /1\/1\/6/i })).toBeVisible()

      await userEvent.click(await within(drawer).findByRole('button', { name: 'Save' }) )
      expect(updateVlanSpy).toBeCalled()
    })

    it('should delete VLAN correctly', async () => {
      render(<Provider><SwitchOverviewVLANs switchDetail={switchDetails}/>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/vlans'
        }
      })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText(/111/i)).toBeVisible()

      const vlan444 = await screen.findByRole('row', { name: /444/i })
      await userEvent.click(await within(vlan444).findByRole('radio'))

      expect(await screen.findByRole('button', { name: 'Edit' })).toBeVisible()
      expect(await screen.findByRole('button', { name: 'Delete' })).toBeVisible()

      await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
      const dialog = await screen.findByRole('dialog')
      expect(await within(dialog).findByText('Delete "VLAN 444"?')).toBeVisible()
      await userEvent.click(await within(dialog).findByRole('button', { name: /Delete VLAN/i }))
      expect(deleteVlanSpy).toBeCalled()
    })

    it('should not allowed to configure VLAN in CLI mode', async () => {
      render(<Provider><SwitchOverviewVLANs switchDetail={{
        ...switchDetails,
        cliApplied: true
      }}/>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/vlans'
        }
      })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText(/111/i)).toBeVisible()
      expect(screen.queryAllByRole('radio')).toHaveLength(0)
    })

    it('should not allowed to delete auth default vlan', async () => {
      render(<Provider><SwitchOverviewVLANs switchDetail={switchDetails}/>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/vlans'
        }
      })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText(/111/i)).toBeVisible()
      expect(await screen.findAllByRole('radio')).toHaveLength(vlanList.data.length)

      const vlan777 = await screen.findByRole('row', { name: /777/i }) // Auth default vlan
      await userEvent.click(await within(vlan777).findByRole('radio'))
      expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
    })
  })

  describe('getPortViewData', () => {
    it('test getPortViewData', async () => {
      expect(getPortViewData(portList?.data)).toStrictEqual(transformdPortViewData)
      expect(getPortViewData(portList_7150_C12P?.data)).toStrictEqual(
        transformdPortViewData_7150_C12P
      )
    })
  })
})
