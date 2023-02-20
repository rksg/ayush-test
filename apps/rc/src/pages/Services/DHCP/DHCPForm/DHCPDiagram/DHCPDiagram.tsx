import { Row, Col } from 'antd'

import {
  DHCPConfigTypeEnum
} from '@acx-ui/rc/utils'


//FIXME: replace these picture when UX ready
import HierarchicalDiagram from '../../../../../assets/images/service-dhcp-diagrams/hierarchicalDHCP.png'
import MultipleDiagram     from '../../../../../assets/images/service-dhcp-diagrams/multipleAPDHCP.png'
import SimpleDiagram       from '../../../../../assets/images/service-dhcp-diagrams/simpleDHCP.png'
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
    <Row justify='start'>
      <Col>
        <Diagram>
          {diagram && <img src={diagram} alt={''} width={550} />}
        </Diagram>
      </Col>
    </Row>
  )
}
