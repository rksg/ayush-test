import React, { useRef, useState } from 'react'

import { ProFormInstance, StepsForm } from '@ant-design/pro-form'
import { Button }                     from 'antd'
import { useIntl }                    from 'react-intl'

import { showActionModal }                                               from '@acx-ui/components'
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setConfigResponse: (response: any) => void;
}) {
  const { $t } = useIntl()
  const [isLoading, setIsLoading] = useState(false)
  const [isSkip, setIsSkip] = useState(false)
  const [isRegenWlan, setIsRegenWlan] = useState(false)

  const [applyConversations] = useApplyConversationsMutation()
  const [updateConversations] = useUpdateConversationsMutation()

  const lastPageIndex = Object.values(RuckusAiConfigurationStepsEnum).length - 1
  const firstPageIndex = 0

  const formMapRef = useRef<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.MutableRefObject<ProFormInstance<any> | undefined>[]
  >([])

  const [showAlert, setShowAlert] = useState<Record<RuckusAiConfigurationStepsEnum, boolean>>(
    Object.values(RuckusAiConfigurationStepsEnum).reduce((acc, step) => {
      acc[step] = false
      return acc
    }, {} as Record<RuckusAiConfigurationStepsEnum, boolean>)
  )

  const updateShowAlert = (step: RuckusAiConfigurationStepsEnum, value: boolean) => {
    setShowAlert((prev) => ({ ...prev, [step]: value }))
  }


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

  const handleOnFinish = async (stepType: RuckusAiConfigurationStepsEnum) => {
    setIsLoading(true)
    let regenerated = false

    try {
      const stepIndex = steps.findIndex(s => s.name === stepType)
      if (stepIndex === -1) {
        return false
      }

      const values = formMapRef.current[stepIndex].current?.getFieldsValue()
      let updatedValues: { [key: string]: unknown }

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
        payload: JSON.stringify(isSkip ? [] : updatedValues)
      }).unwrap()

      if (response.hasChanged) {
        await new Promise((resolve) => {
          const regenerateContent =
            stepType === RuckusAiConfigurationStepsEnum.WLANS
              ? $t({
                // eslint-disable-next-line max-len
                defaultMessage: 'Changing the value of the “Network Objective” will affect the settings in the subsequent steps. Would you like to regenerate the configuration suggestions for the following steps?'
              })
              : $t({
                // eslint-disable-next-line max-len
                defaultMessage: 'The modifications here will affect the settings in the subsequent steps. Would you like to regenerate the configuration suggestions for the following steps?'
              })
          showActionModal({
            type: 'confirm',
            width: 460,
            title: $t({ defaultMessage: 'Regenerate Configurations?' }),
            content: regenerateContent,
            okText: $t({ defaultMessage: 'Regenerate' }),
            cancelText: $t({ defaultMessage: 'Remain Unchanged' }),
            onOk: async () => {
              try {
                const newGenResponse = await updateConversations({
                  params: { sessionId: props.sessionId, type: stepType + '?regenerate=true' },
                  payload: JSON.stringify(updatedValues)
                }).unwrap()
                setPayloads((prevPayloads) => ({
                  ...prevPayloads,
                  [response.nextStep]: newGenResponse
                }))

                regenerated = true
              } catch (error) {
                console.log(error) // eslint-disable-line no-console
              }
              resolve(true)
            },
            onCancel: () => resolve(false)
          })
        })
      }

      if (!regenerated) {
        setPayloads((prevPayloads) => ({
          ...prevPayloads,
          [response.nextStep]: response,
          ...(isSkip && {
            [stepType]: { ...prevPayloads[stepType], payload: '[]' }
          })
        }))
      }

      if (stepType === RuckusAiConfigurationStepsEnum.WLANS) {
        setIsRegenWlan(regenerated)
      }

      setIsSkip(false)
      setIsLoading(false)
      updateShowAlert(stepType, true)

    } catch (error) {
      setIsSkip(false)
      setIsLoading(false)
      return false
    }
    return true
  }

  const steps = [
    {
      name: RuckusAiConfigurationStepsEnum.WLANS,
      title: '',
      component: (props.payload ? (<WlanStep
        payload={props.payload}
        sessionId={props.sessionId}
        formInstance={formMapRef?.current?.[0]?.current}
        showAlert={showAlert[RuckusAiConfigurationStepsEnum.WLANS]}
        description={props.description} />) : null
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
          showAlert={showAlert[RuckusAiConfigurationStepsEnum.WLANDETAIL]}
          payload={payloads[RuckusAiConfigurationStepsEnum.WLANDETAIL].payload}
          setIsRegenWlan={setIsRegenWlan}
          isRegenWlan={isRegenWlan} />)
        : (
          null
        ),
      onFinish: async () =>
        handleOnFinish(RuckusAiConfigurationStepsEnum.WLANDETAIL)
    },
    {
      name: RuckusAiConfigurationStepsEnum.VLAN,
      title: '',
      supportSkip: true,
      component: payloads[RuckusAiConfigurationStepsEnum.VLAN].payload ? (
        <VlanStep
          formInstance={formMapRef.current[2].current}
          sessionId={props.sessionId}
          showAlert={showAlert[RuckusAiConfigurationStepsEnum.VLAN]}
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
      component: <SummaryStep
        currentStep={props.currentStep}
        payload={payloads[RuckusAiConfigurationStepsEnum.SUMMARY].payload}
        setCurrentStep={props.setCurrentStep} />,
      onFinish: async () => {
        setIsLoading(true)
        try {
          const applyResponse = await applyConversations({
            params: { sessionId: props.sessionId }
          }).unwrap()
          props.setStep(RuckusAiStepsEnum.FINISHED)
          props.setConfigResponse(applyResponse)
        } catch (error) {
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
            </Button>,
            <Button key='skip'
              type='link'
              style={{
                position: 'absolute',
                right: '30px',
                bottom: '5px',
                fontSize: '12px',
                display: steps[props.currentStep].supportSkip ? 'block' : 'none'
              }}
              disabled={isLoading}
              onClick={()=>{
                setIsSkip(true)
                renderProps.form?.submit?.()
              }}>
              {$t({ defaultMessage: 'Skip this step' })}
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

