import {
  Col,
  Row
} from 'antd'

import { StepsForm }       from '@acx-ui/components'
import { NetworkTypeEnum } from '@acx-ui/rc/utils'

import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'

import { DhcpCheckbox }     from './DhcpCheckbox'
import { RedirectUrlInput } from './RedirectUrlInput'

export function OnboardingForm () {
  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>Onboarding</StepsForm.Title>
        <RedirectUrlInput />
        <DhcpCheckbox />
      </Col>
      <Col span={14}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL} />
      </Col>
    </Row>
  )
}


