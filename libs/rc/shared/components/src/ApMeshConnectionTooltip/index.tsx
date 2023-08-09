import { Popover, Space } from 'antd'
import { useIntl }        from 'react-intl'

import { APMeshRole, ApMeshLink } from '@acx-ui/rc/utils'

import { apMeshRoleLabelMap }      from './contents'
import * as UI                     from './styledComponents'
import { getSNRColor, getSNRIcon } from './utils'

export interface ApMeshConnectionTooltipProps {
  data: ApMeshLink
  onVisibleChange: (visible: boolean) => void
}

export default function ApMeshConnectionTooltip (props : ApMeshConnectionTooltipProps) {
  const { data, onVisibleChange } = props

  return (
    <Popover
      content={<ApMeshConnectionContent data={data} />}
      visible={true}
      trigger='click'
      color='#333333'
      onVisibleChange={onVisibleChange}
    >
      <div style={{ width: '5px', height: '5px' }}></div>
    </Popover>
  )
}

function ApMeshConnectionContent ({ data }: { data: ApMeshLink }) {
  const { $t } = useIntl()

  const FromSNRIcon = getSNRIcon(data.fromSNR)
  const ToSNRIcon = getSNRIcon(data.toSNR)
  const isWired = data.connectionType === 'Wired'

  const getDeviceText = (entity: ApMeshLink, flow: 'up' | 'down') => {
    let fromDevice, toDevice
    if (entity.fromRole === entity.toRole && entity.toRole === APMeshRole.MAP) {
      fromDevice = $t({ defaultMessage: 'AP-{name}' }, { name: entity.fromName })
      toDevice = $t({ defaultMessage: 'AP-{name}' }, { name: entity.toName })
    } else {
      fromDevice = $t(apMeshRoleLabelMap[entity.fromRole])
      toDevice = $t(apMeshRoleLabelMap[entity.toRole])
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
