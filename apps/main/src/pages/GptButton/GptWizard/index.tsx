import React, { useEffect, useRef, useState } from 'react'

import { ProFormInstance, StepsForm } from '@ant-design/pro-form'
import { Button }                     from 'antd'
import dayjs                          from 'dayjs'

import { useUpdateSsidMutation, useUpdateSsidProfileMutation, useUpdateVlanMutation, useApplyConversationsMutation, useUpdateConversationsMutation } from '@acx-ui/rc/services'
import { GptConversation }                                                                                                                           from '@acx-ui/rc/utils'

import { GptStepsEnum } from '..'
import { GptStepsForm } from '../styledComponents'

import { SummaryStep }    from './Steps/SummaryStep'
import { VlanStep }       from './Steps/VlanStep'
import { WlanDetailStep } from './Steps/WlanDetailStep'
import { WlanStep }       from './Steps/WlanStep'

type FormValue = {
  jobInfo: {
    name: string;
    type: number;
  };
  syncTableInfo: {
    timeRange: [dayjs.Dayjs, dayjs.Dayjs];
    title: string;
  };
}
const formValue: FormValue = {
  jobInfo: {
    name: 'normal job',
    type: 1
  },
  syncTableInfo: {
    timeRange: [dayjs().subtract(1, 'm'), dayjs()],
    title: 'example table title'
  }
}
const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(formValue)
    }, time)
  })
}

export enum GptConfigurationStepsEnum {
  WLANS = 'ssidProfile',
  WLANDETAIL = 'ssid',
  VLAN = 'vlan',
  SUMMARY = 'apply'
}

export default function GptWizard (props: {
  sessionId: string;
  requestId: string;
  actionType: string;
  description: string;
  payload: string;
  currentStep: number;
  setCurrentStep: (currentStep: number) => void;
  step: string;
  setStep: (step: GptStepsEnum) => void;
}) {

  const [isLoading, setIsLoading] = useState(false)

  const [applyConversations] = useApplyConversationsMutation()
  const [updateConversations] = useUpdateConversationsMutation()

  const formMapRef = useRef<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.MutableRefObject<ProFormInstance<any> | undefined>[]
  >([])

  useEffect(() => {
    waitTime(1000).then(() => {
      formMapRef?.current?.forEach((formInstanceRef) => {
        formInstanceRef?.current?.setFieldsValue(formValue)
      })
    })
  }, [])

  const onPrevious = function () {
    if (props.currentStep === 0) {
      props.setStep(GptStepsEnum.BASIC)
    } else if (props.currentStep === 3) {
      props.setCurrentStep(0)
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


  const steps = [
    {
      name: GptConfigurationStepsEnum.WLANS,
      title: '',
      component: (
        <WlanStep payload={props.payload} description={props.description} />
      ),
      onFinish: async () => {
        setIsLoading(true)
        try {
          const values = formMapRef.current[0].current?.getFieldsValue()
          const updatedValues = values.step1payload
            .filter((item: { Checked: unknown }) => item['Checked'])
            .map(({ Checked, ...rest }: { Checked?: boolean; [key: string]: unknown }) => rest)

          const response = await updateConversations({
            params: { sessionId: props.sessionId, type: GptConfigurationStepsEnum.WLANS },
            payload: JSON.stringify(updatedValues)
          }).unwrap()

          setPayloads((prevPayloads) => ({
            ...prevPayloads,
            [GptConfigurationStepsEnum.WLANDETAIL]: response // 更新 Step 2 payload
          }))

          setIsLoading(false)
          return true
        } catch (error) {
          setIsLoading(false)
          return false
        }
      }
    },
    {
      name: GptConfigurationStepsEnum.WLANDETAIL,
      title: '',
      component: <WlanDetailStep
        payload={payloads[GptConfigurationStepsEnum.WLANDETAIL].payload} />,
      onFinish: async () => {
        setIsLoading(true)
        try {
          const values = formMapRef.current[1].current?.getFieldsValue()
          const updatedValues = values.step2payload

          const response = await updateConversations({
            params: { sessionId: props.sessionId, type: GptConfigurationStepsEnum.WLANDETAIL },
            payload: JSON.stringify(updatedValues)
          }).unwrap()

          setPayloads((prevPayloads) => ({
            ...prevPayloads,
            [GptConfigurationStepsEnum.VLAN]: response // 更新 Step 3 payload
          }))

          setIsLoading(false)
          return true
        } catch (error) {
          setIsLoading(false)
          return false
        }
      }
    },
    {
      name: GptConfigurationStepsEnum.VLAN,
      title: '',
      component: <VlanStep payload={payloads[GptConfigurationStepsEnum.VLAN].payload} />,
      onFinish: async () => {
        setIsLoading(true)
        try {
          const values = formMapRef.current[2].current?.getFieldsValue()
          const updatedValues = values.step3payload
            .filter((item: { Checked: unknown }) => item['Checked'])
            .map(({ Checked, ...rest }: { Checked?: boolean; [key: string]: unknown }) => rest)

          const response = await updateConversations({
            params: { sessionId: props.sessionId, type: GptConfigurationStepsEnum.VLAN },
            payload: JSON.stringify(updatedValues)
          }).unwrap()

          setPayloads((prevPayloads) => ({
            ...prevPayloads,
            [GptConfigurationStepsEnum.SUMMARY]: response // 更新 Step 4 payload
          }))

          setIsLoading(false)
          return true
        } catch (error) {
          setIsLoading(false)
          return false
        }
      }
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
              Back
            </Button>,
            <Button
              type='primary'
              key='next'
              loading={isLoading}
              onClick={() => renderProps.form?.submit?.()}
            >
              {props.currentStep === 3 ? 'Apply' : 'Next'}
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
