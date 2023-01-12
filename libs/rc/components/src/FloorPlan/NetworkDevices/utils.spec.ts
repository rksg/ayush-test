import '@testing-library/jest-dom'

import { ApDeviceStatusEnum, FloorplanContext, NetworkDeviceResponse, NetworkDeviceType, RogueCategory, RogueDeviceCategoryType, SwitchStatusEnum } from '@acx-ui/rc/utils'

import { apStatusTransform, calculateDeviceColor } from './utils'

const rogueCategory: Record<RogueCategory, number> = {
  Malicious: 10,
  Ignored: 0,
  Unclassified: 0,
  Known: 0
}

const deviceData: NetworkDeviceResponse = {
  fields: [
    // eslint-disable-next-line max-len
    'serialNumber','xPercent','yPercent','switchName','name','rogueCategory','apMac','id','floorplanId','deviceStatus'],
  totalCount: 5,
  page: 1,
  data: [
    {
      ap: [{
        deviceStatus: ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '302002015732',
        name: '3 02002015736',
        serialNumber: '302002015732',
        xPercent: 65.20548,
        yPercent: 9.839357,
        networkDeviceType: NetworkDeviceType.ap
      },
      {
        deviceStatus: ApDeviceStatusEnum.INITIALIZING,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '302002015733',
        name: '3 02002015736',
        serialNumber: '302002015733',
        xPercent: 65.20548,
        yPercent: 9.839357,
        networkDeviceType: NetworkDeviceType.ap
      },
      {
        deviceStatus: ApDeviceStatusEnum.OFFLINE,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '302002015734',
        name: '3 02002015736',
        serialNumber: '302002015734',
        xPercent: 65.20548,
        yPercent: 9.839357,
        networkDeviceType: NetworkDeviceType.ap
      },
      {
        deviceStatus: ApDeviceStatusEnum.OPERATIONAL,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '302002015735',
        name: '3 02002015736',
        serialNumber: '302002015735',
        xPercent: 65.20548,
        yPercent: 9.839357,
        networkDeviceType: NetworkDeviceType.ap
      },
      {
        deviceStatus: ApDeviceStatusEnum.APPLYING_FIRMWARE,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '302002015736',
        name: '3 02002015736',
        serialNumber: '302002015736',
        xPercent: 65.20548,
        yPercent: 9.839357,
        networkDeviceType: NetworkDeviceType.ap
      },
      {
        deviceStatus: ApDeviceStatusEnum.APPLYING_CONFIGURATION,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '302002015737',
        name: '3 02002015736',
        serialNumber: '302002015737',
        xPercent: 65.20548,
        yPercent: 9.839357,
        networkDeviceType: NetworkDeviceType.ap
      },
      {
        deviceStatus: ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '302002015738',
        name: '3 02002015736',
        serialNumber: '302002015738',
        xPercent: 65.20548,
        yPercent: 9.839357,
        networkDeviceType: NetworkDeviceType.ap
      },
      {
        deviceStatus: ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '302002015739',
        name: '3 02002015736',
        serialNumber: '302002015739',
        xPercent: 65.20548,
        yPercent: 9.839357,
        networkDeviceType: NetworkDeviceType.ap
      },
      {
        deviceStatus: ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '302002015740',
        name: '3 02002015736',
        serialNumber: '302002015740',
        xPercent: 65.20548,
        yPercent: 9.839357,
        networkDeviceType: NetworkDeviceType.ap
      },
      {
        deviceStatus: ApDeviceStatusEnum.REBOOTING,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '3020020157411',
        name: '3 02002015736',
        serialNumber: '3020020157411',
        xPercent: 65.20548,
        yPercent: 9.839357,
        networkDeviceType: NetworkDeviceType.ap
      },
      {
        deviceStatus: ApDeviceStatusEnum.HEARTBEAT_LOST,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '302002015742',
        name: '3 02002015736',
        serialNumber: '302002015742',
        xPercent: 65.20548,
        yPercent: 9.839357,
        networkDeviceType: NetworkDeviceType.ap
      },
      {
        deviceStatus: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '302002015742',
        name: '3 02002015736',
        serialNumber: '302002015742',
        xPercent: 65.20548,
        yPercent: 9.839357,
        networkDeviceType: NetworkDeviceType.ap
      },
      {
        deviceStatus: ApDeviceStatusEnum.OPERATIONAL,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '3020020157412',
        name: 'rogue_ap',
        serialNumber: '3020020157412',
        xPercent: 65.20548,
        yPercent: 9.839357,
        snr: 24,
        macAddress: 'ff:ff:12:34:22:33',
        networkDeviceType: NetworkDeviceType.ap
      },
      {
        deviceStatus: ApDeviceStatusEnum.OPERATIONAL,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '3020020157412',
        name: 'rogue_ap1',
        serialNumber: '3020020157412',
        xPercent: 65.20548,
        yPercent: 9.839357,
        snr: 24,
        macAddress: 'ff:ff:12:34:22:33',
        networkDeviceType: NetworkDeviceType.ap,
        rogueCategory: rogueCategory,
        rogueCategoryType: RogueDeviceCategoryType.malicious
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
      },
      {
        deviceStatus: SwitchStatusEnum.OPERATIONAL,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: 'FEK3224R72N1',
        name: 'FEK3224R232N',
        serialNumber: 'FEK3224R72N1',
        xPercent: 52.739727,
        yPercent: 7.056452,
        networkDeviceType: NetworkDeviceType.switch
      },
      {
        deviceStatus: SwitchStatusEnum.DISCONNECTED,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: 'FEK3224R72N2',
        name: 'FEK3224R232N',
        serialNumber: 'FEK3224R72N2',
        xPercent: 52.739727,
        yPercent: 7.056452,
        networkDeviceType: NetworkDeviceType.switch
      },
      {
        deviceStatus: ApDeviceStatusEnum.APPLYING_CONFIGURATION,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: 'FEK3224R72N3',
        name: 'FEK3224R232N',
        serialNumber: 'FEK3224R72N3',
        xPercent: 52.739727,
        yPercent: 7.056452,
        networkDeviceType: NetworkDeviceType.switch
      }],
      LTEAP: [{
        deviceStatus: ApDeviceStatusEnum.REBOOTING,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '302002015741',
        name: '3 02002015736',
        serialNumber: '302002015741',
        xPercent: 65.20548,
        yPercent: 9.839357,
        networkDeviceType: NetworkDeviceType.lte_ap
      }],
      RogueAP: [{
        deviceStatus: ApDeviceStatusEnum.INITIALIZING,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '3020020157412',
        name: '3 02002015736',
        serialNumber: '3020020157412',
        xPercent: 65.20548,
        yPercent: 9.839357,
        snr: 24,
        macAddress: 'ff:ff:12:34:22:33',
        networkDeviceType: NetworkDeviceType.rogue_ap
      }],
      cloudpath: [{
        deviceStatus: ApDeviceStatusEnum.INITIALIZING,
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        id: '3020020157412',
        name: '3 02002015736',
        serialNumber: '3020020157412',
        xPercent: 65.20548,
        yPercent: 9.839357,
        networkDeviceType: NetworkDeviceType.cloudpath
      }],
      DP: []
    }
  ]
}
describe('Floor Plans', () => {
  it('test calculateDeviceColor function', async () => {
    expect(calculateDeviceColor(deviceData.data[0].ap[0], FloorplanContext.ap, false))
      .toBe('ap-status-severity-attention')
    expect(calculateDeviceColor(deviceData.data[0].ap[1], FloorplanContext.ap, false))
      .toBe('ap-status-severity-attention')
    expect(calculateDeviceColor(deviceData.data[0].ap[2], FloorplanContext.ap, false))
      .toBe('ap-status-severity-attention')
    expect(calculateDeviceColor(deviceData.data[0].ap[3], FloorplanContext.ap, false))
      .toBe('ap-status-severity-cleared')
    expect(calculateDeviceColor(deviceData.data[0].ap[4], FloorplanContext.ap, false))
      .toBe('ap-status-severity-cleared')
    expect(calculateDeviceColor(deviceData.data[0].ap[5], FloorplanContext.ap, true ))
      .toBe('ap-rogue-type-ignored')
    expect(calculateDeviceColor(deviceData.data[0].ap[6], FloorplanContext.ap, false))
      .toBe('ap-status-severity-critical')
    expect(calculateDeviceColor(deviceData.data[0].ap[7], FloorplanContext.ap, false))
      .toBe('ap-status-severity-critical')
    expect(calculateDeviceColor(deviceData.data[0].ap[8], FloorplanContext.ap, false))
      .toBe('ap-status-severity-critical')
    expect(calculateDeviceColor(deviceData.data[0].ap[9], FloorplanContext.ap, false))
      .toBe('ap-status-severity-minor')
    expect(calculateDeviceColor(deviceData.data[0].ap[10], FloorplanContext.ap, false))
      .toBe('ap-status-severity-minor')
    expect(calculateDeviceColor(deviceData.data[0].ap[11], FloorplanContext.ap, false))
      .toBe('ap-status-severity-attention')
    expect(calculateDeviceColor(deviceData.data[0].ap[12], FloorplanContext.rogue_ap, true))
      .toBe('ap-rogue-type-undefined')
    expect(calculateDeviceColor(deviceData.data[0].ap[13], FloorplanContext.ap, true).toLowerCase())
      .toBe('ap-rogue-type-malicious')
    expect(calculateDeviceColor(deviceData.data[0].LTEAP[0], FloorplanContext.ap, false))
      .toBe('ap-status-severity-minor')
    expect(calculateDeviceColor(deviceData.data[0].RogueAP[0], FloorplanContext.ap, false))
      .toBe('ap-rogue-type-undefined')
    expect(calculateDeviceColor(deviceData.data[0].RogueAP[0], FloorplanContext.ap, true))
      .toBe('ap-rogue-type-undefined')
    expect(calculateDeviceColor(deviceData.data[0].cloudpath[0], FloorplanContext.ap, false))
      .toBe('cloudpath-server')
    expect(calculateDeviceColor(deviceData.data[0].switches[1], FloorplanContext.ap, false))
      .toBe('switch-status-operational')
    expect(calculateDeviceColor(deviceData.data[0].switches[2], FloorplanContext.ap, false))
      .toBe('switch-status-disconnected')
    expect(calculateDeviceColor(deviceData.data[0].switches[3], FloorplanContext.ap, false))
      .toBe('')
  })

  it('should test apStatusTransform with APVIEW', () => {
    expect(apStatusTransform(deviceData.data[0].ap[0].deviceStatus, 0).message)
      .toBe('Never contacted cloud')
    expect(apStatusTransform(deviceData.data[0].ap[1].deviceStatus, 0).message)
      .toBe('Initializing')
    expect(apStatusTransform(deviceData.data[0].ap[2].deviceStatus, 0).message)
      .toBe('Offline')
    expect(apStatusTransform(deviceData.data[0].ap[3].deviceStatus, 0).message)
      .toBe('Operational')
    expect(apStatusTransform(deviceData.data[0].ap[4].deviceStatus, 0).message)
      .toBe('Applying firmware')
    expect(apStatusTransform(deviceData.data[0].ap[5].deviceStatus, 0).message)
      .toBe('Applying configuration')
    expect(apStatusTransform(deviceData.data[0].ap[8].deviceStatus, 0).message)
      .toBe('Disconnected from cloud')
    expect(apStatusTransform(deviceData.data[0].ap[9].deviceStatus, 0).message)
      .toBe('Rebooting')
    expect(apStatusTransform(deviceData.data[0].ap[10].deviceStatus, 0).message)
      .toBe('Heartbeat lost')
  })
})
