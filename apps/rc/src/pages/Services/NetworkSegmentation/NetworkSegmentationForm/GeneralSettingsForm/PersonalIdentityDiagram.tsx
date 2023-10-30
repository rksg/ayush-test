import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import WithApAndSwitchDiagram from '../../../../../assets/images/personal-identity-diagrams/personal-identity-with-ap-and-switch.png'
import ApOnlyDiagram          from '../../../../../assets/images/personal-identity-diagrams/personal-identity-with-ap-only.png'

import { Diagram } from './styledComponents'

interface PersonalIdentityDiagramProps {
  venueInfo: {
    switchCount: number
  }
}

export const PersonalIdentityDiagram = (props: PersonalIdentityDiagramProps) => {

  const { $t } = useIntl()
  const diagram = getDiagram(props)

  return (
    <Row>
      <Col offset={4}>
        <Diagram>
          {
            diagram &&
            <img
              src={diagram}
              alt={$t({ defaultMessage: 'Personal Identity Topology' })}
            />
          }
        </Diagram>
      </Col>
    </Row>
  )
}

const getDiagram = (props: PersonalIdentityDiagramProps) => {
  let diagram = ApOnlyDiagram
  if((props.venueInfo?.switchCount ?? 0) > 0) {
    diagram = WithApAndSwitchDiagram
  }
  return diagram
}