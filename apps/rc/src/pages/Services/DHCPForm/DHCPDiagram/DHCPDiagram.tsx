import { Row, Col } from 'antd'

import {
  DHCPConfigTypeEnum
} from '@acx-ui/rc/utils'


//FIXME: replace these picture when UX ready
import SimpleDiagram       from '../../../../assets/images/network-wizard-diagrams/dpsk.png'
import HierarchicalDiagram from '../../../../assets/images/network-wizard-diagrams/open-cloudpath-on-prem-deployment.png'
import MultipleDiagram     from '../../../../assets/images/network-wizard-diagrams/open.png'
import { Diagram }         from '../styledComponents'


const diagramMapping = {
  [DHCPConfigTypeEnum.SIMPLE]: SimpleDiagram,
  [DHCPConfigTypeEnum.MULTIPLE]: MultipleDiagram,
  [DHCPConfigTypeEnum.HIERARCHICAL]: HierarchicalDiagram
}


interface DHCPDiagramProps {
  type?: DHCPConfigTypeEnum;
}


export function DHCPDiagram (props: DHCPDiagramProps) {

  const diagram = diagramMapping[props.type || DHCPConfigTypeEnum.SIMPLE]

  return (
    <Row justify='center'>
      <Col>
        <Diagram>
          {diagram && <img src={diagram} alt={''}/>}
        </Diagram>
      </Col>
    </Row>
  )
}
