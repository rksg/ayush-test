import { useState } from 'react'

import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import { SpaceWrapper } from '@acx-ui/rc/components'

import PinApEdgeDiagram       from '../../../../../assets/images/personal-identity-diagrams/pin-ap-edge-vertical.svg'
import PinApSwitchEdgeDiagram from '../../../../../assets/images/personal-identity-diagrams/pin-ap-switch-edge-vertical.svg'
import PinSwitchEdgeDiagram   from '../../../../../assets/images/personal-identity-diagrams/pin-switch-edge-vertical.svg'

import { ControlDot } from './styledComponents'

const diagrams = [
  {
    id: 'ap_edge',
    src: PinApEdgeDiagram
  },
  {
    id: 'switch_edge',
    src: PinSwitchEdgeDiagram
  },
  {
    id: 'ap_switch_edge',
    src: PinApSwitchEdgeDiagram
  }
]
export const DiagramGallery = () => {
  const { $t } = useIntl()
  const [currentDiagram, setCurrentDiagram] = useState<string>(diagrams[0].id)

  const handleClick = (id: string) => {
    setCurrentDiagram(id)
  }

  const diagramSrc = diagrams.find(item => item.id === currentDiagram)?.src

  return <SpaceWrapper
    size={24}
    direction='vertical'
    justifycontent='center'
  >
    <Row justify='center' style={{ maxHeight: '420px' }}>
      {diagramSrc && <img
        src={diagramSrc}
        alt={$t({ defaultMessage: 'PIN Topology' })}
      />}
    </Row>
    <Row justify='center'>
      <SpaceWrapper size={12}>
        {diagrams.map(item => {
          return <ControlDot
            key={item.id}
            onClick={() => handleClick(item.id)}
            $active={currentDiagram === item.id}
          />
        })}
      </SpaceWrapper>
    </Row>
  </SpaceWrapper>
}