import { Row, Col } from 'antd'

import { NetworkTypeEnum } from '@acx-ui/rc/utils'

import AaaDiagram         from '../../assets/images/network-wizard-diagrams/aaa.png'
import OpenDiagram        from '../../assets/images/network-wizard-diagrams/open.png'
import { Diagram, Title } from '../styledComponents'

export function NetworkDiagram (props: {
  type: typeof NetworkTypeEnum[keyof typeof NetworkTypeEnum];
}) {
  return (
    <Row justify='center'>
      <Col>
        <Title>
          {props.type === NetworkTypeEnum.AAA && 'Enterprise AAA (802.1X)'}
          {props.type === NetworkTypeEnum.OPEN && 'Open Network'}
        </Title>
        <Diagram>
          {props.type === NetworkTypeEnum.AAA && <img src={AaaDiagram} alt='Background'></img>}
          {props.type === NetworkTypeEnum.OPEN && <img src={OpenDiagram} alt='Background'></img>}
        </Diagram>
      </Col>
    </Row>
  )
}
