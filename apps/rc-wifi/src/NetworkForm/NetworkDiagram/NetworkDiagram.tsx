import { Row, Col } from 'antd'

import { NetworkTypeEnum } from '@acx-ui/rc/utils'

import AaaDiagram           from '../../assets/images/network-wizard-diagrams/aaa.png'
import DpskDiagram          from '../../assets/images/network-wizard-diagrams/dpsk.png'
import OpenDiagram          from '../../assets/images/network-wizard-diagrams/open.png'
import { NetworkTypeLabel } from '../contentsMap'
import { Diagram, Title }   from '../styledComponents'

const diagramMap: Partial<Record<NetworkTypeEnum, string>> = {
  [NetworkTypeEnum.AAA]: AaaDiagram,
  [NetworkTypeEnum.OPEN]: OpenDiagram,
  [NetworkTypeEnum.DPSK]: DpskDiagram
}

export function NetworkDiagram (props: { type?: string }) {
  const type = props.type as NetworkTypeEnum
  const title = NetworkTypeLabel[type]
  const diagram = diagramMap[type]
  return (
    <Row justify='center'>
      <Col>
        <Title>{title}</Title>
        <Diagram>
          {diagram && <img src={diagram} alt={title} />}
        </Diagram>
      </Col>
    </Row>
  )
}
