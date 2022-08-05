import {
  Col,
  Row
} from 'antd'

import { StepFormProps, StepsForm }                 from '@acx-ui/components'
import { CreateNetworkFormFields, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'

import { DhcpCheckbox }     from './DhcpCheckbox'
import { RedirectUrlInput } from './RedirectUrlInput'

export function OnboardingForm (props: StepFormProps<CreateNetworkFormFields>) {
  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>Onboarding</StepsForm.Title>
        <RedirectUrlInput formRef={props.formRef} />
        <DhcpCheckbox />
      </Col>
      <Col span={14}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL} />
      </Col>
    </Row>
  )
}


