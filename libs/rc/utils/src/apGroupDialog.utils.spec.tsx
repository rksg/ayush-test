import {
  render,
  screen
} from '@acx-ui/test-utils'

import {
  transformVLAN,
  transformAps,
  transformRadios
} from './apGroupDialog.utils'

import {
  RadioEnum,
  RadioTypeEnum,
  NetworkTypeEnum,
  SchedulerTypeEnum
} from './index'

export const network = {
  type: NetworkTypeEnum.AAA,
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  venues: [
    {
      venueId: 'd7b1a9a350634115a92ee7b0f11c7e75',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      allApGroupsRadio: RadioEnum.Both,
      isAllApGroups: true,
      allApGroupsRadioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
      id: '7a97953dc55f4645b3cdbf1527f3d7cb'
    }
  ],
  wlan: {
    enabled: true,
    ssid: '03',
    vlanId: 1
  },
  name: '03',
  enableAuthProxy: false,
  enableAccountingProxy: false,
  id: '373377b0cb6e46ea8982b1c80aabe1fa'
}

const networkVenue_allAps = {
  venueId: 'd7b1a9a350634115a92ee7b0f11c7e75',
  dual5gEnabled: true,
  tripleBandEnabled: false,
  networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
  allApGroupsRadio: RadioEnum.Both,
  isAllApGroups: true,
  allApGroupsRadioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
  id: '7a97953dc55f4645b3cdbf1527f3d7cb'
}

const networkVenue_apgroup = {
  venueId: '02e2ddbc88e1428987666d31edbc3d9a',
  dual5gEnabled: true,
  tripleBandEnabled: false,
  networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
  allApGroupsRadio: RadioEnum.Both,
  isAllApGroups: false,
  id: '7a97953dc55f4645b3cdbf1527f3d7cb',
  scheduler: {
    type: SchedulerTypeEnum.ALWAYS_ON
  },
  apGroups: [{
    radio: RadioEnum._2_4_GHz,
    radioTypes: [RadioTypeEnum._2_4_GHz],
    isDefault: true,
    id: '6cb1e831973a4d60924ac59f1bda073c',
    apGroupId: 'b88d85d886f741a08f521244cb8cc5c5',
    apGroupName: 'APs not assigned to any group',
    vlanPoolId: '1c061cf2649344adaf1e79a9d624a451',
    vlanPoolName: 'pool1'
  }]
}

describe('Test apGroupDialog.utils', () => {
  it('transformVLAN', async () => {
    const { unmount } = render(transformVLAN(networkVenue_allAps, network.wlan))

    expect(screen.getByText('VLAN-1 (Default)')).toBeDefined()

    unmount()

    render(transformVLAN(networkVenue_apgroup, network.wlan))

    expect(screen.getByText('VLAN Pool: pool1 (Custom)')).toBeDefined()
  })

  it('transformAps', async () => {
    const { unmount } = render(transformAps(networkVenue_allAps))

    expect(screen.getByText('All APs')).toBeDefined()

    unmount()

    render(transformAps(networkVenue_apgroup))

    expect(screen.getByText('Unassigned APs')).toBeDefined()
  })

  it('transformRadios', async () => {
    const { unmount } = render(transformRadios(networkVenue_apgroup))

    expect(screen.getByText('2.4 GHz')).toBeDefined()

    unmount()

    render(transformRadios(networkVenue_allAps))

    expect(screen.getByText('2.4 GHz, 5 GHz')).toBeDefined()
  })

})