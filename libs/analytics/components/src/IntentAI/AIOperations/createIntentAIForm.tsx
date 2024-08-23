/* eslint-disable max-len */
import React from 'react'

import { Col, Row }                   from 'antd'
import { MessageDescriptor, useIntl } from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { IntentWizardHeader } from '../common/IntentWizardHeader'

export function createIntentAIForm <FormState, DTO> (config: {
  useInitialValues: () => Partial<FormState>
  getFormDTO: (values: FormState) => DTO
}) {
  const steps: Array<{
    title: MessageDescriptor
    Content: React.ComponentType
    SideNote?: React.ComponentType
  }> = []
  const formManger = { addStep, IntentAIForm }
  return formManger

  function addStep (step: typeof steps[number]) {
    steps.push(step)
    return formManger
  }

  function IntentAIForm () {
    const { $t } = useIntl()
    const initialValues = config.useInitialValues()

    return (<>
      <IntentWizardHeader />
      <StepsForm<FormState>
        // eslint-disable-next-line no-console
        onFinish={async (values) => console.log(config.getFormDTO(values))}
        buttonLabel={{
          submit: $t({ defaultMessage: 'Apply' })
        }}
        initialValues={initialValues}
      >
        {steps.map(({ title, Content, SideNote = React.Fragment }) => {
          return <StepsForm.StepForm title={$t(title)} key={$t(title)}>
            <Row gutter={20}>
              <Col span={15}>
                <StepsForm.TextContent>
                  <StepsForm.Title children={$t(title)} />
                  <Content />
                </StepsForm.TextContent>
              </Col>
              <Col span={7} offset={2}>
                <StepsForm.TextContent>
                  <SideNote />
                </StepsForm.TextContent>
              </Col>
            </Row>
          </StepsForm.StepForm>
        })}
      </StepsForm>
    </>)
  }
}
