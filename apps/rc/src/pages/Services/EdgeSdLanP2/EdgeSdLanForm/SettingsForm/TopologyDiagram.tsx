import { Row, Col, Space, Badge } from 'antd'
import { useIntl }                from 'react-intl'

import { cssStr } from '@acx-ui/components'

import DcDmzDiagram        from '../../../../../assets/images/edge-sd-lan-diagrams/edge-sd-lan-dc-dmz.png'
import DcDiagram           from '../../../../../assets/images/edge-sd-lan-diagrams/edge-sd-lan-dc.png'
import { messageMappings } from '../messageMappings'

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

  return <Row gutter={[0, 30]}>
    <Col span={24}>
      {
        isGuestTunnelEnabled
          ? <UI.Diagram src={DcDmzDiagram} alt={$t({ defaultMessage: 'SD-LAN with DMZ' })} />
          : <UI.Diagram src={DcDiagram} alt={$t({ defaultMessage: 'SD-LAN' })} />
      }
    </Col>
    <Col span={24}>
      <Space size={5} direction='vertical'>
        {lines.map(item => {
          return <Badge
            key={item.id}
            color={item.color}
            text={$t(item.text)}
          />
        })}
      </Space>
    </Col>
  </Row>
}