import { Row, Col } from 'antd'

import AaaDiagram         from '../../assets/images/network-wizard-diagrams/aaa.png'
import { Diagram, Title } from '../styledComponents'

export function NetworkDiagram () {
  return (
    <Row justify='center'>
      <Col>
        <Title>Enterprise AAA </Title>
        <Diagram>
          <img src={AaaDiagram} alt='Background'></img>
        </Diagram>
      </Col>
    </Row>
  )
}
