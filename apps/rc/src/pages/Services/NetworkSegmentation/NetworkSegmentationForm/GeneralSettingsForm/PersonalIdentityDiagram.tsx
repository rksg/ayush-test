import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import PinDiagram from '../../../../../assets/images/personal-identity-diagrams/personal-identity-all.png'

import { Diagram } from './styledComponents'

export const PersonalIdentityDiagram = () => {

  const { $t } = useIntl()
  const diagram = getDiagram()

  return (
    <Row >
      <Col offset={2} >
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

const getDiagram = () => {
  return PinDiagram
}