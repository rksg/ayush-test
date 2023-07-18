import { useContext } from 'react'

import { Space }                                     from 'antd'
import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { APMeshRoleEthernet, APMeshRoleMesh, APMeshRoleRoot } from '@acx-ui/icons'
import { APMeshRole, NetworkDevice, NetworkDeviceType }       from '@acx-ui/rc/utils'

import ApMeshConnection, { genApMeshConnectionId }     from '../../ApMeshConnection'
import { getMeshRole }                                 from '../../Topology/utils'
import { ApMeshTopologyDevice, ApMeshTopologyContext } from '../PlainView/ApMeshTopologyContext'

import * as UI           from './styledComponents'
import { getDeviceName } from './utils'

type APMeshRoleWithoutDisabled = Exclude<APMeshRole, 'DISABLED'>

const ApMeshTooltipDetailMap: Record<APMeshRoleWithoutDisabled, MessageDescriptor> = {
  [APMeshRole.RAP]: defineMessage({ defaultMessage: `Linked directly to {downlinkCount, plural,
    =0 {0 mesh AP} one {# mesh AP} other {# mesh APs}}
    {downlinkUnplacedCount, plural, =0 {} other {(# unplaced)}}` }),
  [APMeshRole.MAP]: defineMessage({ defaultMessage: `Linked to Root AP "{rootApName}"
    {isRootApUnplaced, select, true {(unplaced)} other {}}
    {hops, plural, =0 {} one {({hops} Hop)} other {({hops} Hops)}}` }),
  [APMeshRole.EMAP]: defineMessage({ defaultMessage: 'Linked to Root AP "{rootApName}"' })
}

const ApMeshRoleIconMap: Record<APMeshRoleWithoutDisabled, React.FunctionComponent> = {
  [APMeshRole.RAP]: APMeshRoleRoot,
  [APMeshRole.MAP]: APMeshRoleMesh,
  [APMeshRole.EMAP]: APMeshRoleEthernet
}

export function useApMeshDevice (device?: NetworkDevice) {
  const { isApMeshTopologyEnabled, meshDeviceList } = useContext(ApMeshTopologyContext)
  // eslint-disable-next-line max-len
  const isApMeshEnabled = isApMeshTopologyEnabled && device?.networkDeviceType === NetworkDeviceType.ap
  const apMeshData: ApMeshTopologyDevice | undefined = meshDeviceList?.find(
    ap => ap.serialNumber === device?.serialNumber
  )
  const { $t } = useIntl()

  const getApMeshRoleConnectionDetail = (apMeshData: ApMeshTopologyDevice) => {
    const meshRole = apMeshData.meshRole

    return $t(ApMeshTooltipDetailMap[meshRole as APMeshRoleWithoutDisabled], {
      downlinkCount: apMeshData.downlinkCount ?? 0,
      downlinkUnplacedCount: apMeshData.downlinkUnplacedCount ?? 0,
      rootApName: apMeshData.rootApName,
      isRootApUnplaced: apMeshData.isRootApUnplaced,
      hops: apMeshData.hops
    })
  }

  const getApMeshRoleTooltip = () => {
    if (!apMeshData) return getDeviceName(device)

    return (
      <Space direction='vertical'>
        <Space style={{ color: '#C4C4C4' }}>
          <span>{device?.name}</span>
          <span>({getMeshRole(apMeshData.meshRole)})</span>
        </Space>
        <span style={{ color: '#FFFFFF' }}>{getApMeshRoleConnectionDetail(apMeshData)}</span>
      </Space>
    )
  }

  const getDeviceContainerId = () => {
    return isApMeshEnabled && device?.id
      ? genApMeshConnectionId(device.id)
      : undefined
  }

  const getApMeshRoleIcon = () => {
    if (!apMeshData) return null

    const RoleIcon = ApMeshRoleIconMap[apMeshData.meshRole as APMeshRoleWithoutDisabled]
    return (
      <UI.MeshApRoleIconContainer id={getDeviceContainerId()}>
        <RoleIcon />
      </UI.MeshApRoleIconContainer>
    )
  }

  return {
    isApMeshEnabled,
    getApMeshRoleTooltip,
    getApMeshRoleIcon
  }
}


export function ApMeshConnections () {
  const { isApMeshTopologyEnabled, meshLinkList } = useContext(ApMeshTopologyContext)

  if (!isApMeshTopologyEnabled || !meshLinkList) return null

  return <>{meshLinkList.map(link =>
    <ApMeshConnection key={`${link.to}-${link.from}`} linkInfo={link} />)
  }</>
}
