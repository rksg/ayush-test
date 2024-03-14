import '@testing-library/jest-dom'
import {
  APMeshRole,
  ApDeviceStatusEnum,
  ConnectionStatus,
  DeviceStatus,
  DeviceTypes,
  SwitchStatusEnum
} from '@acx-ui/rc/utils'
import { render } from '@acx-ui/test-utils'

import { getDeviceColor, getPathColor, getDeviceIcon, switchStatus, getMeshRole } from './utils'

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
    expect(getDeviceColor(SwitchStatusEnum.DISCONNECTED)).toBe('var(--acx-semantics-red-70)')
  })

  it('test switchStatus', async () => {
    expect(switchStatus(SwitchStatusEnum.OPERATIONAL)).toBe('Operational')
    expect(switchStatus(SwitchStatusEnum.DISCONNECTED)).toBe('Disconnected')
    expect(switchStatus(SwitchStatusEnum.NEVER_CONTACTED_CLOUD)).toBe('Never contacted cloud')
    expect(switchStatus(SwitchStatusEnum.INITIALIZING)).toBe('Initializing')
    expect(switchStatus(SwitchStatusEnum.APPLYING_FIRMWARE)).toBe('Firmware updating')
    expect(switchStatus(SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED))
      .toBe('Never contacted Active Switch')

    expect(getPathColor(ConnectionStatus.Good)).toBe('var(--acx-semantics-green-50)')
    expect(getPathColor(ConnectionStatus.Degraded)).toBe('var(--acx-semantics-yellow-40)')
    expect(getPathColor(ConnectionStatus.Disconnected)).toBe('var(--acx-neutrals-50)')
    expect(getPathColor('any-status' as ConnectionStatus)).toBe('var(--acx-neutrals-50)')
  })

  it('test getDeviceIcon', async () => {
    const testCases = [
      { deviceType: DeviceTypes.Ap, deviceStatus: DeviceStatus.Operational },
      { deviceType: DeviceTypes.Ap, deviceStatus: DeviceStatus.Degraded },
      { deviceType: DeviceTypes.Ap, deviceStatus: DeviceStatus.Disconnected },
      { deviceType: DeviceTypes.Ap, deviceStatus: DeviceStatus.Unknown },
      { deviceType: DeviceTypes.ApMesh, deviceStatus: DeviceStatus.Operational },
      { deviceType: DeviceTypes.ApMesh, deviceStatus: DeviceStatus.Degraded },
      { deviceType: DeviceTypes.ApMesh, deviceStatus: DeviceStatus.Disconnected },
      { deviceType: DeviceTypes.ApMesh, deviceStatus: DeviceStatus.Unknown },
      { deviceType: DeviceTypes.ApMeshRoot, deviceStatus: DeviceStatus.Operational },
      { deviceType: DeviceTypes.ApMeshRoot, deviceStatus: DeviceStatus.Degraded },
      { deviceType: DeviceTypes.ApMeshRoot, deviceStatus: DeviceStatus.Disconnected },
      { deviceType: DeviceTypes.ApMeshRoot, deviceStatus: DeviceStatus.Unknown },
      { deviceType: DeviceTypes.ApWired, deviceStatus: DeviceStatus.Operational },
      { deviceType: DeviceTypes.ApWired, deviceStatus: DeviceStatus.Degraded },
      { deviceType: DeviceTypes.ApWired, deviceStatus: DeviceStatus.Disconnected },
      { deviceType: DeviceTypes.ApWired, deviceStatus: DeviceStatus.Unknown },
      { deviceType: DeviceTypes.Switch, deviceStatus: DeviceStatus.Operational },
      { deviceType: DeviceTypes.Switch, deviceStatus: DeviceStatus.Disconnected },
      { deviceType: DeviceTypes.Switch, deviceStatus: DeviceStatus.Unknown },
      { deviceType: DeviceTypes.SwitchStack, deviceStatus: DeviceStatus.Operational },
      { deviceType: DeviceTypes.SwitchStack, deviceStatus: DeviceStatus.Disconnected },
      { deviceType: DeviceTypes.SwitchStack, deviceStatus: DeviceStatus.Unknown },
      { deviceType: DeviceTypes.Unknown, deviceStatus: DeviceStatus.Unknown }
    ]

    testCases.forEach(({ deviceType, deviceStatus }) => {
      const { container } = render(<div>{getDeviceIcon(deviceType, deviceStatus)}</div>)
      expect(container).toMatchSnapshot()
    })
  })

  it('test getMeshRole', async () => {
    expect(getMeshRole(APMeshRole.EMAP)).toBe('eMesh AP')
  })
})