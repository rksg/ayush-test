import { APMeshRole } from '@acx-ui/rc/utils'

import { MeshConnectionInfoEntity } from '../types'

export const mockedConnectionRootToMesh: MeshConnectionInfoEntity = {
  connectionType: 'Wireless',
  from: '922102021547',
  to: '922102021999',
  fromMac: '58:FB:96:1E:29:70',
  toMac: 'AA:FB:96:FF:FF:FF',
  fromRole: APMeshRole.RAP,
  toRole: APMeshRole.MAP,
  fromSNR: 60,
  toSNR: 20,
  band: '5 GHz',
  channel: 1423
}

export const mockedConnectionMeshToMesh: MeshConnectionInfoEntity = {
  connectionType: 'Wireless',
  from: '922102021547',
  to: '922102021999',
  fromMac: '58:FB:96:1E:29:70',
  toMac: 'AA:FB:96:FF:FF:FF',
  fromRole: APMeshRole.MAP,
  toRole: APMeshRole.MAP,
  fromSNR: 60,
  toSNR: 20,
  band: '5 GHz',
  channel: 1423
}

export const mockedWiredConnection: MeshConnectionInfoEntity = {
  connectionType: 'Wired',
  from: '922102021547',
  to: '922102021999',
  fromMac: '58:FB:96:1E:29:70',
  toMac: 'AA:FB:96:FF:FF:FF',
  fromRole: APMeshRole.MAP,
  toRole: APMeshRole.MAP,
  fromSNR: 60,
  toSNR: 20,
  band: '5 GHz',
  channel: 1423
}
