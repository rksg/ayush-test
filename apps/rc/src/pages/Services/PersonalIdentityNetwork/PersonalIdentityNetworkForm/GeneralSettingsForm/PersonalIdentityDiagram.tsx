import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import WithApAndSwitchDiagram from '../../../../../assets/images/personal-identity-diagrams/personal-identity-with-ap-and-switch.png'
import ApOnlyDiagram          from '../../../../../assets/images/personal-identity-diagrams/personal-identity-with-ap-only.png'

import { Diagram } from './styledComponents'

interface PersonalIdentityDiagramProps {
  hasSwitch?: boolean
}

export const PersonalIdentityDiagram = (props: PersonalIdentityDiagramProps) => {

  const { $t } = useIntl()
  const diagram = props.hasSwitch ? WithApAndSwitchDiagram : ApOnlyDiagram

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