import { APMeshRole, ApMeshLink } from '@acx-ui/rc/utils'


export const mockedApMeshLink: ApMeshLink = {
  connectionType: 'Mesh',
  from: '922102021547',
  to: '922102021999',
  fromMac: '58:FB:96:1E:29:70',
  toMac: 'AA:FB:96:FF:FF:FF',
  fromRole: APMeshRole.RAP,
  toRole: APMeshRole.MAP,
  fromSNR: 60,
  toSNR: 20,
  band: '5G',
  channel: 1423
}
