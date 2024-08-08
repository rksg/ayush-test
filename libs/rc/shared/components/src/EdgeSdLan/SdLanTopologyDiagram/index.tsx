import { Row, Space, Badge } from 'antd'
import { useIntl }           from 'react-intl'

import { cssStr }   from '@acx-ui/components'
import { Features } from '@acx-ui/feature-toggle'

import { SpaceWrapper }          from '../../SpaceWrapper'
import { useIsEdgeFeatureReady } from '../../useEdgeActions'

import DcDmzDiagramHorizontal   from './assets/images/edge-sd-lan-dc-dmz-horizontal.png'
import DcDmzDiagramVertical     from './assets/images/edge-sd-lan-dc-dmz-vertical.png'
import DcDiagramHorizontal      from './assets/images/edge-sd-lan-dc-horizontal.png'
import DcDiagramVertical        from './assets/images/edge-sd-lan-dc-vertical.png'
import MvDcDmzDiagramHorizontal from './assets/images/edge-sd-lan-mv-dc-dmz-horizontal.svg'
import MvDcDmzDiagramVertical   from './assets/images/edge-sd-lan-mv-dc-dmz-vertical.svg'
import MvDcDiagramHorizontal    from './assets/images/edge-sd-lan-mv-dc-horizontal.svg'
import MvDcDiagramVertical      from './assets/images/edge-sd-lan-mv-dc-vertical.svg'
import { messageMappings }      from './messageMappings'
import * as UI                  from './styledComponents'

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

export const SdLanTopologyDiagram = (props: {
  isGuestTunnelEnabled: boolean,
  vertical: boolean,
  className?: string
}) => {
  const { $t } = useIntl()
  const { isGuestTunnelEnabled, vertical, className } = props
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  const lines = lineMap.filter(item => isGuestTunnelEnabled || item.id !== 'se_dmz')

  return <SpaceWrapper
    className={className}
    size={30}
    direction='vertical'
    justifycontent='center'
  >
    <Row justify='center'>
      {
        isGuestTunnelEnabled
          ? <UI.Diagram
            src={vertical
              ? (isEdgeSdLanMvEnabled ? MvDcDmzDiagramVertical : DcDmzDiagramVertical)
              : (isEdgeSdLanMvEnabled ? MvDcDmzDiagramHorizontal : DcDmzDiagramHorizontal)
            }
            alt={$t({ defaultMessage: 'SD-LAN with DMZ' })}
            $vertical={vertical}
          />
          : <UI.Diagram
            src={vertical
              ? (isEdgeSdLanMvEnabled ? MvDcDiagramVertical : DcDiagramVertical)
              : (isEdgeSdLanMvEnabled ? MvDcDiagramHorizontal : DcDiagramHorizontal)}
            alt={$t({ defaultMessage: 'SD-LAN' })}
            $vertical={vertical}
          />
      }
    </Row>
    <Row justify='end'>
      <Space
        size={vertical ? 5 : 30}
        direction={vertical ? 'vertical' : 'horizontal'}
      >
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