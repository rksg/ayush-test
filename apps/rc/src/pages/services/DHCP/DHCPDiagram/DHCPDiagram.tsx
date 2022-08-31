import { Row, Col } from 'antd'

import {
  DHCPConfigTypeEnum
} from '@acx-ui/rc/utils'


//FIXME: replace these picture when UX ready
import SimpleDiagram       from '../../../../assets/images/network-wizard-diagrams/dpsk.png'
import HierarchicalDiagram from '../../../../assets/images/network-wizard-diagrams/open-cloudpath-on-prem-deployment.png'
import MultipleDiagram     from '../../../../assets/images/network-wizard-diagrams/open.png'
import { Diagram }         from '../styledComponents'


interface DHCPDiagramProps {
  type?: DHCPConfigTypeEnum;
}

function getDiagram (props: DHCPConfigTypeEnum | undefined) {
  let diagram = null
  switch (props) {
    case DHCPConfigTypeEnum.SIMPLE:
      diagram = SimpleDiagram
      break
    case DHCPConfigTypeEnum.MULTIPLE:
      diagram = MultipleDiagram
      break
    case DHCPConfigTypeEnum.Hierarchical:
      diagram = HierarchicalDiagram
      break
    default:
      diagram = SimpleDiagram
  }

  return diagram
}

export function DHCPDiagram (props: DHCPDiagramProps) {
  const diagram = getDiagram(props.type)

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
