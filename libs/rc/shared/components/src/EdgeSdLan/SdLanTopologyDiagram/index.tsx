import { Row, Space, Badge } from 'antd'
import { useIntl }           from 'react-intl'

import { cssStr }       from '@acx-ui/components'
import { SpaceWrapper } from '@acx-ui/rc/components'

import DcDmzDiagramHorizontal        from './assets/images/edge-sd-lan-dc-dmz-horizontal.png'
import DcDiagramHorizontal           from './assets/images/edge-sd-lan-dc-horizontal.png'
import DcDmzDiagramVertical        from './assets/images/edge-sd-lan-dc-dmz.png'
import DcDiagramVertical           from './assets/images/edge-sd-lan-dc.png'
import { messageMappings } from './messageMappings'

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

export const SdLanTopologyDiagram = (props: { isGuestTunnelEnabled: boolean, vertical: boolean }) => {
  const { $t } = useIntl()
  const { isGuestTunnelEnabled, vertical } = props
  const lines = lineMap.filter(item => isGuestTunnelEnabled || item.id !== 'se_dmz')

  return <SpaceWrapper
    size={30}
    direction={vertical?'vertical':'horizontal'}
    justifycontent='center'
  >
    <Row justify='center'>
      {
        isGuestTunnelEnabled
          ? <UI.Diagram
              src={vertical ? DcDmzDiagramVertical : DcDmzDiagramHorizontal} 
              alt={$t({ defaultMessage: 'SD-LAN with DMZ' })} 
              $vertical={vertical}
              />
          : <UI.Diagram 
              src={vertical ? DcDiagramVertical : DcDiagramHorizontal} 
              alt={$t({ defaultMessage: 'SD-LAN' })}
              $vertical={vertical}
              />
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