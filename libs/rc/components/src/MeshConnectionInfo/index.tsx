import { Popover, Space } from 'antd'
import { useIntl }        from 'react-intl'

import { APMeshRole } from '@acx-ui/rc/utils'

import { APMeshRoleLabelMap }       from './contents'
import * as UI                      from './styledComponents'
import { MeshConnectionInfoEntity } from './types'
import { getSNRColor, getSNRIcon }  from './utils'

export interface MeshConnectionInfoProps {
  data: MeshConnectionInfoEntity
  onVisibleChange: (visible: boolean) => void
}

export default function MeshConnectionInfo (props : MeshConnectionInfoProps) {
  const { data, onVisibleChange } = props

  return (
    <Popover
      content={<MeshConnectionInfoContent data={data} />}
      visible={true}
      trigger='click'
      color='#333333'
      onVisibleChange={onVisibleChange}
    >
      <div style={{ width: '5px', height: '5px' }}></div>
    </Popover>
  )
}

function MeshConnectionInfoContent ({ data }: { data: MeshConnectionInfoEntity }) {
  const { $t } = useIntl()

  const FromSNRIcon = getSNRIcon(data.fromSNR)
  const ToSNRIcon = getSNRIcon(data.toSNR)
  const isWired = data.connectionType === 'Wired'

  const getDeviceText = (entity: MeshConnectionInfoEntity, flow: 'up' | 'down') => {
    let fromDevice, toDevice
    if (entity.fromRole === entity.toRole && entity.toRole === APMeshRole.MAP) {
      fromDevice = $t({ defaultMessage: 'AP-{serialNumber}' }, { serialNumber: entity.from })
      toDevice = $t({ defaultMessage: 'AP-{serialNumber}' }, { serialNumber: entity.to })
    } else {
      fromDevice = $t(APMeshRoleLabelMap[entity.fromRole])
      toDevice = $t(APMeshRoleLabelMap[entity.toRole])
    }
    return $t({ defaultMessage: '{fromDevice} to {toDevice}: ' }, {
      fromDevice: flow === 'down' ? fromDevice : toDevice,
      toDevice: flow === 'down' ? toDevice : fromDevice
    })
  }

  return isWired
    ? <UI.ItemLabel>{ $t({ defaultMessage: 'Ethernet link' }) }</UI.ItemLabel>
    : <Space direction='vertical' size={12}>
      <Space direction='vertical' size={8}>
        <UI.Header>{$t({ defaultMessage: 'Signal Strength' })}</UI.Header>
        <UI.Body>
          <UI.ItemContainer>
            <UI.ItemLabel>{ getDeviceText(data, 'down') }</UI.ItemLabel>
            <UI.ItemValue color={getSNRColor(data.fromSNR)}>
              {FromSNRIcon && <FromSNRIcon />}
              { data.fromSNR }
            </UI.ItemValue>
          </UI.ItemContainer>
          <UI.ItemContainer>
            <UI.ItemLabel>{ getDeviceText(data, 'up') }</UI.ItemLabel>
            <UI.ItemValue color={getSNRColor(data.toSNR)}>
              {ToSNRIcon && <ToSNRIcon />}
              { data.toSNR }
            </UI.ItemValue>
          </UI.ItemContainer>
        </UI.Body>
      </Space>
      <Space direction='vertical' size={8}>
        <UI.Header>{$t({ defaultMessage: 'Radio' })}</UI.Header>
        <UI.Body>
          <UI.ItemContainer>
            <UI.ItemLabel>{ $t({ defaultMessage: 'Band:' }) }</UI.ItemLabel>
            <UI.ItemValue>{ data.band }</UI.ItemValue>
          </UI.ItemContainer>
          <UI.ItemContainer>
            <UI.ItemLabel>{ $t({ defaultMessage: 'Channel:' }) }</UI.ItemLabel>
            <UI.ItemValue>{ data.channel }</UI.ItemValue>
          </UI.ItemContainer>
        </UI.Body>
      </Space>
    </Space>

}
