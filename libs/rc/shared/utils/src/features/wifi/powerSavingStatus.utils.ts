import { ApDeviceStatusEnum, PowerSavingStatusEnum, TopologyDeviceStatus } from '../..'

export function getPowerSavingStatusEnabledTopologyStatus (
  deviceStatus: TopologyDeviceStatus,
  powerSavingStatus: PowerSavingStatusEnum) {
  if (deviceStatus !== TopologyDeviceStatus.Operational &&
      deviceStatus !== TopologyDeviceStatus.Degraded) {
    return false
  }
  return (powerSavingStatus === PowerSavingStatusEnum.POWER_SAVING)
}

export function getPowerSavingStatusEnabledApStatus (
  status: ApDeviceStatusEnum,
  powerSavingStatus: PowerSavingStatusEnum) {
  if (status === ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD ||
      status === ApDeviceStatusEnum.INITIALIZING ||
      status === ApDeviceStatusEnum.OFFLINE) {
    return false
  }
  return (powerSavingStatus === PowerSavingStatusEnum.POWER_SAVING)
}