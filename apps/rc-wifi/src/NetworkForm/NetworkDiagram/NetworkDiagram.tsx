import { Row, Col } from 'antd'

import { NetworkTypeEnum } from '@acx-ui/rc/utils'

import AaaDiagram  from '../../assets/images/network-wizard-diagrams/aaa.png'
import DpskDiagram from '../../assets/images/network-wizard-diagrams/dpsk.png'
import OpenDiagram from '../../assets/images/network-wizard-diagrams/open.png'
import { Diagram } from '../styledComponents'

export function NetworkDiagram (props: {
  type: typeof NetworkTypeEnum[keyof typeof NetworkTypeEnum];
}) {
  return (
    <Row justify='center'>
      <Col>
        <Diagram>
          {props.type === NetworkTypeEnum.AAA && <img src={AaaDiagram} alt='Background'></img>}
          {props.type === NetworkTypeEnum.OPEN && <img src={OpenDiagram} alt='Background'></img>}
          {props.type === NetworkTypeEnum.DPSK && <img src={DpskDiagram} alt='Background'></img>}
        </Diagram>
      </Col>
    </Row>
  )
}
