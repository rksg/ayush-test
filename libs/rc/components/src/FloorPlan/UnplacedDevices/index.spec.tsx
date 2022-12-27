import '@testing-library/jest-dom'

import { fireEvent, screen } from '@testing-library/react'
import userEvent             from '@testing-library/user-event'
import { DndProvider }       from 'react-dnd'
import { HTML5Backend }      from 'react-dnd-html5-backend'

import { ApDeviceStatusEnum, NetworkDeviceType, SwitchStatusEnum, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'
import { render }                                                                          from '@acx-ui/test-utils'


import { NetworkDeviceContext } from '..'

import { UnplacedDevices }      from '.'
import { getDeviceFilterLabel } from './index'

const unplacedDevicesState: TypeWiseNetworkDevices = {
  ap: [{
    deviceStatus: ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD,
    floorplanId: '94bed28abef24175ab58a3800d01e24a',
    id: '302002015732',
    name: '3 02002015736',
    serialNumber: '302002015732',
    xPercent: 65.20548,
    yPercent: 9.839357,
    networkDeviceType: NetworkDeviceType.ap
  }],
  switches: [{
    deviceStatus: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
    floorplanId: '94bed28abef24175ab58a3800d01e24a',
    id: 'FEK3224R72N',
    name: 'FEK3224R232N',
    serialNumber: 'FEK3224R72N',
    xPercent: 52.739727,
    yPercent: 7.056452,
    networkDeviceType: NetworkDeviceType.switch
  }],
  LTEAP: [{
    deviceStatus: ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD,
    floorplanId: '94bed28abef24175ab58a3800d01e24a',
    id: '302002015732',
    name: '3 02002015736',
    serialNumber: '302002015732',
    xPercent: 65.20548,
    yPercent: 9.839357,
    networkDeviceType: NetworkDeviceType.lte_ap
  }],
  RogueAP: [],
  cloudpath: [],
  DP: []
}

describe('Floor Plans Unlpaced Device list', () => {

  it('should render correctly', async () => {

    await render(<NetworkDeviceContext.Provider value={jest.fn()}>
      <DndProvider backend={HTML5Backend}>
        <UnplacedDevices closeDropdown={jest.fn()} unplacedDevicesState={unplacedDevicesState} />
      </DndProvider>
    </NetworkDeviceContext.Provider>)

    expect(await screen.findAllByTestId('SignalUp')).toHaveLength(2)

    expect(await screen.getAllByRole('listitem')[0]).not.toBeNull()

    await userEvent.click(await screen.findByText('All'))

    await userEvent.click(await screen.findByText('Wi-Fi APs'))

    await expect(await screen.getAllByRole('listitem')[0]).not.toBeNull()

    const searchInput = screen.getByTestId('text-search')

    await fireEvent.change(searchInput, { target: { value: 'AP' } })

    await fireEvent.click(await screen.findByText('All'))

    await fireEvent.change(searchInput, { target: { value: '' } })

    const _listItem = await screen.getAllByRole('listitem')[0]

    fireEvent.dragStart(_listItem)

    expect(await screen.findByText('Drop here to unplace')).toBeVisible()

    fireEvent.drop(_listItem)

  })

  it('test getDeviceFilterLabel function', async () => {
    expect(getDeviceFilterLabel(NetworkDeviceType.ap)).toBe('Wi-Fi APs')
    expect(getDeviceFilterLabel(NetworkDeviceType.lte_ap)).toBe('LTE APs')
    expect(getDeviceFilterLabel(NetworkDeviceType.switch)).toBe('Switches')
    expect(getDeviceFilterLabel(NetworkDeviceType.cloudpath)).toBe('Cloudpath Servers')
    expect(getDeviceFilterLabel('undefined' as NetworkDeviceType)).toBe(undefined)
  })

})
