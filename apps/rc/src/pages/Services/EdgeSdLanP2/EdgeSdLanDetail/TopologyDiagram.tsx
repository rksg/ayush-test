import { Row, Space, Badge } from 'antd'
import { useIntl }           from 'react-intl'

import { cssStr }       from '@acx-ui/components'
import { SpaceWrapper } from '@acx-ui/rc/components'

import DcDmzDiagram        from '../../../../assets/images/edge-sd-lan-diagrams/edge-sd-lan-dc-dmz-horizontal.png'
import DcDiagram           from '../../../../assets/images/edge-sd-lan-diagrams/edge-sd-lan-dc-horizontal.png'
import { messageMappings } from '../EdgeSdLanForm/messageMappings'

import * as UI from './styledComponents'

const lineMap = [
  {
    id: 'ap_se',
    color: cssStr('--acx-semantics-yellow-50'),
    text: messageMappings.diagram_legend_ap_se
  }, {
    id: 'se_dmz',
    color: cssStr('--acx-semantics-green-50'),
    text: messageMappings.diagram_legend_se_dmz
  }, {
    id: 'physicalPath',
    color: cssStr('--acx-viz-sequential-5'),
    text: messageMappings.diagram_legend_physical
  }
]

export const TopologyDiagram = (props: { isGuestTunnelEnabled: boolean }) => {
  const { $t } = useIntl()
  const { isGuestTunnelEnabled } = props
  const lines = lineMap.filter(item => isGuestTunnelEnabled || item.id !== 'se_dmz')

  return <SpaceWrapper
    size={30}
    direction='vertical'
    justifycontent='center'
  >
    <Row justify='center'>
      {
        isGuestTunnelEnabled
          ? <UI.Diagram src={DcDmzDiagram} alt={$t({ defaultMessage: 'SD-LAN with DMZ' })} />
          : <UI.Diagram src={DcDiagram} alt={$t({ defaultMessage: 'SD-LAN' })} />
      }
    </Row>
    <Row justify='center'>
      <Space size={30}>
        {lines.map(item => {
          return <Badge
            key={item.id}
            color={item.color}
            text={$t(item.text)}
          />
        })}
      </Space>
    </Row>
  </SpaceWrapper>
}