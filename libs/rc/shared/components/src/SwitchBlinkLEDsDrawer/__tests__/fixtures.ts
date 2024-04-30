import { SwitchStatusEnum, STACK_MEMBERSHIP, StackMember } from '@acx-ui/rc/utils'

export const stackMembersData = [
  {
    serialNumber: 'FEK3230S0DA',
    unitName: 'ICX7150-C12 Router',
    poeFree: 108600,
    uptime: '41 days, 0 hours',
    deviceStatus: SwitchStatusEnum.OPERATIONAL,
    unitStatus: STACK_MEMBERSHIP.ACTIVE,
    venueName: 'My-Venue',
    switchMac: '58:fb:96:0e:c0:c4',
    unitId: 1,
    model: 'ICX7150-C12P',
    activeSerial: 'FEK3230S0DA',
    poeTotal: 124000,
    id: 'FEK3230S0DA',
    poeUtilization: 15400,
    order: '1'
  },
  {
    serialNumber: 'FEK3230S0DB',
    unitName: 'ICX7150-C12 Router',
    poeFree: 108600,
    uptime: '41 days, 0 hours',
    deviceStatus: SwitchStatusEnum.OPERATIONAL,
    unitStatus: STACK_MEMBERSHIP.MEMBER,
    venueName: 'My-Venue',
    switchMac: '58:fb:96:0e:c0:c4',
    unitId: 2,
    model: 'ICX7150-C12P',
    activeSerial: 'FEK3230S0DA',
    poeTotal: 124000,
    id: 'FEK3230S0DB',
    poeUtilization: 15400,
    order: '2',
    needAck: true
  },
  {
    serialNumber: 'FEK3230S0DC',
    unitName: 'ICX7150-C12 Router',
    poeFree: 108600,
    uptime: '',
    // deviceStatus: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
    // unitStatus: STACK_MEMBERSHIP.STANDBY,
    venueName: 'My-Venue',
    switchMac: '58:fb:96:0e:c0:c4',
    unitId: 3,
    model: 'ICX7150-C12P',
    activeSerial: 'FEK3230S0DA',
    poeTotal: 124000,
    id: 'FEK3230S0DC',
    poeUtilization: 15400,
    order: '3'
  }
] as StackMember[]