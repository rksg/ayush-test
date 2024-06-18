import '@testing-library/jest-dom'
import {
  APMeshRole,
  ApDeviceStatusEnum,
  ConnectionStatus,
  TopologyDeviceStatus,
  DeviceTypes,
  SwitchStatusEnum
} from '@acx-ui/rc/utils'
import { render } from '@acx-ui/test-utils'

import { getDeviceColor, getPathColor, getDeviceIcon, getMeshRole } from './utils'

describe('Topology utils', () => {
  it('test getDeviceColor', async () => {
    expect(getDeviceColor(TopologyDeviceStatus.Degraded)).toBe('var(--acx-semantics-yellow-40)')
    expect(getDeviceColor(ApDeviceStatusEnum.REBOOTING)).toBe('var(--acx-semantics-yellow-40)')
    expect(getDeviceColor(ApDeviceStatusEnum.HEARTBEAT_LOST)).toBe('var(--acx-semantics-yellow-40)')

    expect(getDeviceColor(ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED))
      .toBe('var(--acx-semantics-red-70)')
    expect(getDeviceColor(ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED))
      .toBe('var(--acx-semantics-red-70)')
    expect(getDeviceColor(ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD))
      .toBe('var(--acx-semantics-red-70)')

    expect(getDeviceColor(TopologyDeviceStatus.Unknown)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(ApDeviceStatusEnum.INITIALIZING)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(ApDeviceStatusEnum.OFFLINE)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(SwitchStatusEnum.INITIALIZING)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(SwitchStatusEnum.NEVER_CONTACTED_CLOUD)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(SwitchStatusEnum.DISCONNECTED)).toBe('var(--acx-semantics-red-70)')
  })

  it('test getPatchColor', async () => {
    expect(getPathColor(ConnectionStatus.Good)).toBe('var(--acx-semantics-green-50)')
    expect(getPathColor(ConnectionStatus.Degraded)).toBe('var(--acx-semantics-yellow-40)')
    expect(getPathColor(ConnectionStatus.Disconnected)).toBe('var(--acx-neutrals-50)')
    expect(getPathColor('any-status' as ConnectionStatus)).toBe('var(--acx-neutrals-50)')
  })

  it('test getDeviceIcon', async () => {
    const testCases = [
      { deviceType: DeviceTypes.Ap, deviceStatus: TopologyDeviceStatus.Operational },
      { deviceType: DeviceTypes.Ap, deviceStatus: TopologyDeviceStatus.Degraded },
      { deviceType: DeviceTypes.Ap, deviceStatus: TopologyDeviceStatus.Disconnected },
      { deviceType: DeviceTypes.Ap, deviceStatus: TopologyDeviceStatus.Unknown },
      { deviceType: DeviceTypes.ApMesh, deviceStatus: TopologyDeviceStatus.Operational },
      { deviceType: DeviceTypes.ApMesh, deviceStatus: TopologyDeviceStatus.Degraded },
      { deviceType: DeviceTypes.ApMesh, deviceStatus: TopologyDeviceStatus.Disconnected },
      { deviceType: DeviceTypes.ApMesh, deviceStatus: TopologyDeviceStatus.Unknown },
      { deviceType: DeviceTypes.ApMeshRoot, deviceStatus: TopologyDeviceStatus.Operational },
      { deviceType: DeviceTypes.ApMeshRoot, deviceStatus: TopologyDeviceStatus.Degraded },
      { deviceType: DeviceTypes.ApMeshRoot, deviceStatus: TopologyDeviceStatus.Disconnected },
      { deviceType: DeviceTypes.ApMeshRoot, deviceStatus: TopologyDeviceStatus.Unknown },
      { deviceType: DeviceTypes.ApWired, deviceStatus: TopologyDeviceStatus.Operational },
      { deviceType: DeviceTypes.ApWired, deviceStatus: TopologyDeviceStatus.Degraded },
      { deviceType: DeviceTypes.ApWired, deviceStatus: TopologyDeviceStatus.Disconnected },
      { deviceType: DeviceTypes.ApWired, deviceStatus: TopologyDeviceStatus.Unknown },
      { deviceType: DeviceTypes.Switch, deviceStatus: TopologyDeviceStatus.Operational },
      { deviceType: DeviceTypes.Switch, deviceStatus: TopologyDeviceStatus.Disconnected },
      { deviceType: DeviceTypes.Switch, deviceStatus: TopologyDeviceStatus.Unknown },
      { deviceType: DeviceTypes.SwitchStack, deviceStatus: TopologyDeviceStatus.Operational },
      { deviceType: DeviceTypes.SwitchStack, deviceStatus: TopologyDeviceStatus.Disconnected },
      { deviceType: DeviceTypes.SwitchStack, deviceStatus: TopologyDeviceStatus.Unknown },
      { deviceType: DeviceTypes.Unknown, deviceStatus: TopologyDeviceStatus.Unknown }
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