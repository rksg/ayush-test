import '@testing-library/jest-dom'
import { ApDeviceStatusEnum, ConnectionStatus, DeviceStatus, SwitchStatusEnum } from '@acx-ui/rc/utils'

import { getDeviceColor, getPathColor, switchStatus } from './utils'

describe('Topology utils', () => {
  it('test getDeviceColor', async () => {
    expect(getDeviceColor(DeviceStatus.Degraded)).toBe('var(--acx-semantics-yellow-40)')
    expect(getDeviceColor(ApDeviceStatusEnum.REBOOTING)).toBe('var(--acx-semantics-yellow-40)')
    expect(getDeviceColor(ApDeviceStatusEnum.HEARTBEAT_LOST)).toBe('var(--acx-semantics-yellow-40)')

    expect(getDeviceColor(ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED))
      .toBe('var(--acx-semantics-red-70)')
    expect(getDeviceColor(ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED))
      .toBe('var(--acx-semantics-red-70)')
    expect(getDeviceColor(ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD))
      .toBe('var(--acx-semantics-red-70)')

    expect(getDeviceColor(DeviceStatus.Unknown)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(ApDeviceStatusEnum.INITIALIZING)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(ApDeviceStatusEnum.OFFLINE)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(SwitchStatusEnum.INITIALIZING)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(SwitchStatusEnum.NEVER_CONTACTED_CLOUD)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(SwitchStatusEnum.DISCONNECTED)).toBe('var(--acx-neutrals-50)')
  })

  it('test switchStatus', async () => {
    expect(switchStatus(SwitchStatusEnum.OPERATIONAL)).toBe('Operational')
    expect(switchStatus(SwitchStatusEnum.DISCONNECTED)).toBe('Disconnected')
    expect(switchStatus(SwitchStatusEnum.NEVER_CONTACTED_CLOUD)).toBe('Never contacted cloud')
    expect(switchStatus(SwitchStatusEnum.INITIALIZING)).toBe('Initializing')
    expect(switchStatus(SwitchStatusEnum.APPLYING_FIRMWARE)).toBe('Firmware updating')
    expect(switchStatus(SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED))
      .toBe('Never contacted Active Switch')

    expect(getPathColor('any-status' as ConnectionStatus)).toBe('var(--acx-neutrals-50)')
  })
})