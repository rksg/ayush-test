import React, { useRef, useState } from 'react'

import { ProFormInstance, StepsForm } from '@ant-design/pro-form'
import { Button }                     from 'antd'
import { useIntl }                    from 'react-intl'

import { useApplyConversationsMutation, useUpdateConversationsMutation } from '@acx-ui/rc/services'
import { RuckusAiConfigurationStepsEnum, RuckusAiConversation }          from '@acx-ui/rc/utils'

import { RuckusAiStepsEnum } from '..'
import { GptStepsForm }      from '../styledComponents'

import { SummaryStep }    from './Steps/SummaryStep'
import { VlanStep }       from './Steps/VlanStep'
import { WlanDetailStep } from './Steps/WlanDetailStep'
import { WlanStep }       from './Steps/WlanStep'

export default function RuckusAiWizard (props: {
  sessionId: string;
  requestId: string;
  actionType: string;
  description: string;
  payload: string;
  currentStep: number;
  step: string;
  setCurrentStep: (currentStep: number) => void;
  setStep: (step: RuckusAiStepsEnum) => void;
}) {
  const { $t } = useIntl()
  const [isLoading, setIsLoading] = useState(false)

  const [applyConversations] = useApplyConversationsMutation()
  const [updateConversations] = useUpdateConversationsMutation()

  const lastPageIndex = Object.values(RuckusAiConfigurationStepsEnum).length - 1
  const firstPageIndex = 0

  const formMapRef = useRef<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.MutableRefObject<ProFormInstance<any> | undefined>[]
  >([])


  const onPrevious = function () {
    if (props.currentStep === firstPageIndex) {
      props.setStep(RuckusAiStepsEnum.BASIC)
    } else {
      props.setCurrentStep(props.currentStep - 1)
    }
  }

  const [payloads, setPayloads] =
    useState<Record<RuckusAiConfigurationStepsEnum, RuckusAiConversation>>(
      Object.values(RuckusAiConfigurationStepsEnum).reduce((acc, step) => {
        acc[step] = {} as RuckusAiConversation
        return acc
      }, {} as Record<RuckusAiConfigurationStepsEnum, RuckusAiConversation>)
    )

  const handleOnFinish = async (
    stepType: RuckusAiConfigurationStepsEnum) => {
    setIsLoading(true)
    try {
      const stepIndex = steps.findIndex(s => s.name === stepType)

      if (stepIndex === -1) {
        return false
      }

      const values = formMapRef.current[stepIndex].current?.getFieldsValue()
      let updatedValues

      if (values.data && values.data.some((item: { Checked?: boolean }) =>
        item['Checked'] !== undefined)) {
        updatedValues = values.data
          .filter((item: { Checked: boolean }) => item['Checked'])
          .map(({ Checked, ...rest }: { Checked?: boolean;[key: string]: unknown }) => rest)
      } else {
        updatedValues = values.data
      }

      const response = await updateConversations({
        params: { sessionId: props.sessionId, type: stepType },
        payload: JSON.stringify(updatedValues)
      }).unwrap()

      if (response.hasChanged) {


      }


      setPayloads((prevPayloads) => ({
        ...prevPayloads,
        [response.nextStep]: response
      }))
      // formMapRef.current[stepIndex + 1].current?.resetFields()

      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      return false
    }
    return true
  }

  const steps = [
    {
      name: RuckusAiConfigurationStepsEnum.WLANS,
      title: '',
      component: (
        props.payload ?
          <WlanStep
            formInstance={formMapRef.current[0]?.current}
            payload={props.payload}
            description={props.description} />
          : (null)
      ),
      onFinish: async () =>
        handleOnFinish(RuckusAiConfigurationStepsEnum.WLANS)
    },
    {
      name: RuckusAiConfigurationStepsEnum.WLANDETAIL,
      title: '',
      component: payloads[RuckusAiConfigurationStepsEnum.WLANDETAIL].payload ? (
        <WlanDetailStep
          formInstance={formMapRef.current[1].current}
          sessionId={props.sessionId}
          payload={payloads[RuckusAiConfigurationStepsEnum.WLANDETAIL].payload} />)
        : (
          null
        ),
      onFinish: async () =>
        handleOnFinish(RuckusAiConfigurationStepsEnum.WLANDETAIL)
    },
    {
      name: RuckusAiConfigurationStepsEnum.VLAN,
      title: '',
      component: payloads[RuckusAiConfigurationStepsEnum.VLAN].payload ? (
        <VlanStep
          formInstance={formMapRef.current[2].current}
          sessionId={props.sessionId}
          description={payloads[RuckusAiConfigurationStepsEnum.VLAN].description}
          payload={payloads[RuckusAiConfigurationStepsEnum.VLAN].payload} />
      ) : (
        null
      ),
      onFinish: async () =>
        handleOnFinish(RuckusAiConfigurationStepsEnum.VLAN)
    },
    {
      name: RuckusAiConfigurationStepsEnum.SUMMARY,
      title: '',
      component: <SummaryStep payload={payloads[RuckusAiConfigurationStepsEnum.SUMMARY].payload} />,
      onFinish: async () => {
        setIsLoading(true)
        try {
          await applyConversations({
            params: { sessionId: props.sessionId }
          }).unwrap()
          props.setStep(RuckusAiStepsEnum.FINISHED)
        } catch (error) {
          //TODO: Waiting for UX design and backend integration.
          alert('Please try again.')
        }
        setIsLoading(false)
      }
    }
  ]

  return (
    <StepsForm
      formMapRef={formMapRef}
      containerStyle={{ width: '100%', padding: '0 30px' }}
      current={props.currentStep}
      onCurrentChange={(current) => {
        props.setCurrentStep(current)
      }}
      submitter={{
        submitButtonProps: {},
        render: (renderProps) => {
          return [
            <Button key='pre' disabled={isLoading} onClick={onPrevious}>
              {$t({ defaultMessage: 'Back' })}
            </Button>,
            <Button
              type='primary'
              key='next'
              loading={isLoading}
              onClick={() => renderProps.form?.submit?.()}
            >
              {props.currentStep === lastPageIndex ?
                $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Next' })}
            </Button>
          ]
        }
      }}
      stepsRender={() => null}
      onFinish={() => {
        return Promise.resolve(false)
      }}
    >
      {steps.map((step) => (
        <GptStepsForm.StepForm
          key={step.name}
          name={step.name}
          title={step.title}
          onFinish={step.onFinish}
        >
          {step.component}
        </GptStepsForm.StepForm>
      ))}
    </StepsForm>
  )
}
