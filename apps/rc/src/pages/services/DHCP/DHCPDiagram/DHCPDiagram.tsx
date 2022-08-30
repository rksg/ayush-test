import { Row, Col } from 'antd'

import {
  DHCPConfigTypeEnum
} from '@acx-ui/rc/utils'


//FIXME: replace these picture when UX ready
import DpskDiagram    from '../../../../assets/images/network-wizard-diagrams/dpsk.png'
import DefaultDiagram from '../../../../assets/images/network-wizard-diagrams/open-cloudpath-on-prem-deployment.png'
import OpenDiagram    from '../../../../assets/images/network-wizard-diagrams/open.png'
import { Diagram }    from '../styledComponents'


interface DHCPDiagramProps {
  type?: DHCPConfigTypeEnum;
}

function getDiagram (props: DHCPConfigTypeEnum | undefined) {
  let diagram = null
  switch (props) {
    case DHCPConfigTypeEnum.SIMPLE:
      diagram = OpenDiagram
      break
    case DHCPConfigTypeEnum.MULTIPLE:
      diagram = DpskDiagram
      break
    case DHCPConfigTypeEnum.Hierarchical:
      diagram = OpenDiagram
      break
    default:
      diagram = DefaultDiagram
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
