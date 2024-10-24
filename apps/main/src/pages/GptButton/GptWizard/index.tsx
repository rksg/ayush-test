import React, { useRef, useState } from 'react'

import { ProFormInstance, StepsForm } from '@ant-design/pro-form'
import { Button }                     from 'antd'
import { useIntl }                    from 'react-intl'

import { useApplyConversationsMutation, useUpdateConversationsMutation } from '@acx-ui/rc/services'
import { GptConfigurationStepsEnum, GptConversation }                    from '@acx-ui/rc/utils'

import { GptStepsEnum } from '..'
import { GptStepsForm } from '../styledComponents'

import { SummaryStep }    from './Steps/SummaryStep'
import { VlanStep }       from './Steps/VlanStep'
import { WlanDetailStep } from './Steps/WlanDetailStep'
import { WlanStep }       from './Steps/WlanStep'

export default function GptWizard (props: {
  sessionId: string;
  requestId: string;
  actionType: string;
  description: string;
  payload: string;
  currentStep: number;
  step: string;
  setCurrentStep: (currentStep: number) => void;
  setStep: (step: GptStepsEnum) => void;
}) {
  const { $t } = useIntl()
  const [isLoading, setIsLoading] = useState(false)

  const [applyConversations] = useApplyConversationsMutation()
  const [updateConversations] = useUpdateConversationsMutation()

  const lastPageIndex = Object.values(GptConfigurationStepsEnum).length - 1
  const firstPageIndex = 0

  const formMapRef = useRef<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.MutableRefObject<ProFormInstance<any> | undefined>[]
  >([])


  const onPrevious = function () {
    if (props.currentStep === firstPageIndex) {
      props.setStep(GptStepsEnum.BASIC)
    } else {
      props.setCurrentStep(props.currentStep - 1)
    }
  }

  const [payloads, setPayloads] = useState<Record<GptConfigurationStepsEnum, GptConversation>>(
    Object.values(GptConfigurationStepsEnum).reduce((acc, step) => {
      acc[step] = {} as GptConversation
      return acc
    }, {} as Record<GptConfigurationStepsEnum, GptConversation>)
  )

  const handleOnFinish = async (
    stepType: GptConfigurationStepsEnum) => {
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

      setPayloads((prevPayloads) => ({
        ...prevPayloads,
        [response.nextStep]: response
      }))

      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      return false
    }
    return true
  }

  const steps = [
    {
      name: GptConfigurationStepsEnum.WLANS,
      title: '',
      component: (
        <WlanStep payload={props.payload} description={props.description} />
      ),
      onFinish: async () =>
        handleOnFinish(GptConfigurationStepsEnum.WLANS)
    },
    {
      name: GptConfigurationStepsEnum.WLANDETAIL,
      title: '',
      component: <WlanDetailStep
        payload={payloads[GptConfigurationStepsEnum.WLANDETAIL].payload} />,
      onFinish: async () =>
        handleOnFinish(GptConfigurationStepsEnum.WLANDETAIL)
    },
    {
      name: GptConfigurationStepsEnum.VLAN,
      title: '',
      component: payloads[GptConfigurationStepsEnum.VLAN].payload ? (
        <VlanStep payload={payloads[GptConfigurationStepsEnum.VLAN].payload} />
      ) : (
        null
      ),
      onFinish: async () =>
        handleOnFinish(GptConfigurationStepsEnum.VLAN)
    },
    {
      name: GptConfigurationStepsEnum.SUMMARY,
      title: '',
      component: <SummaryStep payload={payloads[GptConfigurationStepsEnum.SUMMARY].payload} />,
      onFinish: async () => {
        setIsLoading(true)
        try {
          await applyConversations({
            params: { sessionId: props.sessionId }
          }).unwrap()
          props.setStep(GptStepsEnum.FINISHED)
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
