import {
  RadioEnum,
  RadioTypeEnum,
  SchedulerTypeEnum
} from '@acx-ui/rc/utils'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import {
  network,
  networkVenue_apgroup,
  networkVenue_allAps
} from '../NetworkApGroupDialog/__tests__/NetworkVenueTestData'

import {
  transformVLAN,
  transformAps,
  transformRadios,
  transformScheduling
} from './apGroupPipes'


describe('Test apGroupPipes.utils', () => {
  it('transformVLAN', async () => {
    let view = render(transformVLAN(networkVenue_allAps, network))

    expect(screen.getByText('VLAN-1 (Default)')).toBeDefined()

    view.unmount()
    view = render(transformVLAN(networkVenue_apgroup, network))

    expect(screen.getByText('VLAN Pool: pool1 (Custom)')).toBeDefined()

    view.unmount()
    view = render(transformVLAN({ ...networkVenue_apgroup, apGroups: [{
      radio: RadioEnum._2_4_GHz,
      radioTypes: [RadioTypeEnum._2_4_GHz],
      isDefault: true,
      apGroupId: 'b88d85d886f741a08f521244cb8cc5c5',
      apGroupName: 'APs not assigned to any group',
      vlanId: 1
    }] }, network))

    expect(screen.getByText('VLAN-1 (Custom)')).toBeDefined()

    view.unmount()
    view = render(transformVLAN({ ...networkVenue_apgroup, apGroups: [{
      radio: RadioEnum._2_4_GHz,
      radioTypes: [RadioTypeEnum._2_4_GHz],
      isDefault: true,
      apGroupId: 'b88d85d886f741a08f521244cb8cc5c5',
      apGroupName: 'APs not assigned to any group',
      vlanPoolId: '1c061cf2649344adaf1e79a9d624a451',
      vlanPoolName: 'pool1'
    }, {
      apGroupId: '9150b159b5f748a1bbf55dab35a60bce',
      apGroupName: 'ewrw',
      radio: RadioEnum.Both,
      radioTypes: [ RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
      isDefault: false,
      vlanId: 1
    }] }, network))

    expect(screen.getByText('Per AP Group')).toBeDefined()

    view.unmount()
  })

  it('transformAps', async () => {
    let view = render(transformAps(networkVenue_allAps, network))

    expect(screen.getByText('All APs')).toBeDefined()

    view.unmount()
    view = render(transformAps(networkVenue_apgroup, network))

    expect(screen.getByText('Unassigned APs')).toBeDefined()

    view.unmount()
    view = render(transformAps({ ...networkVenue_apgroup, apGroups: [{
      apGroupId: '9150b159b5f748a1bbf55dab35a60bce',
      apGroupName: 'ewrw',
      radio: RadioEnum.Both,
      radioTypes: [ RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
      isDefault: false,
      vlanId: 1
    }] }, network))
    expect(screen.getByText('ewrw')).toBeDefined()
  })

  it('transformRadios', async () => {
    let view = render(transformRadios(networkVenue_apgroup, network))

    expect(screen.getByText('2.4 GHz')).toBeDefined()

    view.unmount()
    view = render(transformRadios(networkVenue_allAps, network))

    expect(screen.getByText('2.4 GHz, 5 GHz')).toBeDefined()

    view.unmount()
    view = render(transformRadios({ ...networkVenue_allAps,
      allApGroupsRadioTypes: [ RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz, RadioTypeEnum._6_GHz]
    }, network))

    expect(screen.getByText('All')).toBeDefined()

    view.unmount()
    view = render(transformRadios({ ...networkVenue_allAps,
      allApGroupsRadioTypes: undefined
    }, network))

    expect(screen.getByText('2.4 GHz / 5 GHz')).toBeDefined()

    view.unmount()
    view = render(transformRadios({ ...networkVenue_allAps,
      allApGroupsRadioTypes: undefined,
      allApGroupsRadio: RadioEnum._5_GHz
    }, network))

    expect(screen.getByText('5 GHz')).toBeDefined()

    view.unmount()
    view = render(transformRadios({ ...networkVenue_apgroup, apGroups: [{
      radio: RadioEnum._2_4_GHz,
      radioTypes: [RadioTypeEnum._2_4_GHz],
      isDefault: true,
      apGroupId: 'b88d85d886f741a08f521244cb8cc5c5',
      apGroupName: 'APs not assigned to any group',
      vlanPoolId: '1c061cf2649344adaf1e79a9d624a451',
      vlanPoolName: 'pool1'
    }, {
      apGroupId: '9150b159b5f748a1bbf55dab35a60bce',
      apGroupName: 'ewrw',
      radio: RadioEnum.Both,
      radioTypes: [ RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
      isDefault: false,
      vlanId: 1
    }] }, network))

    expect(screen.getByText('Per AP Group')).toBeDefined()
  })

  it('transformScheduling', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(Date.parse('2022-08-04T01:20:00+10:00'))) // Australian Eastern Standard Time

    let view = render(transformScheduling(networkVenue_apgroup))

    expect(screen.getByText('24/7')).toBeDefined()

    /* eslint-disable max-len */
    const scheduler = {
      type: SchedulerTypeEnum.CUSTOM,
      sun: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
      mon: '111111111111111111111111111111111111111111111111000000000000000000000000000000000000000000000000',
      tue: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      wed: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      thu: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
      fri: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
      sat: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'
    }

    view.unmount()
    view = render(transformScheduling(
      { ...networkVenue_apgroup, scheduler }, { day: 'Wed', timeIndex: 91 }))

    expect(screen.getByText('OFF now')).toBeDefined()

    view.unmount()
    view = render(transformScheduling(
      { ...networkVenue_apgroup, scheduler }, { day: 'Mon', timeIndex: 47 }))

    expect(screen.getByText('ON now')).toBeDefined()

    view.unmount()
    view = render(transformScheduling({ ...networkVenue_apgroup, scheduler: {
      type: SchedulerTypeEnum.ALWAYS_OFF
    } }))

    view.unmount()
    view = render(transformScheduling(networkVenue_allAps))

    expect(screen.getByText('24/7')).toBeDefined()

    jest.useRealTimers()
  })
})
