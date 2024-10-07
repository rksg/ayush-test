/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react'

import { ProFormInstance, StepsForm } from '@ant-design/pro-form'
import dayjs from 'dayjs'

import { GptConversation } from '@acx-ui/rc/utils'

import { GptStepsForm } from '../styledComponents'

import type { Dayjs } from 'dayjs'
import { WlanStep } from './Steps/WlanStep'
import { WlanDetailStep } from './Steps/WlanDetailStep'
import { VlanStep } from './Steps/VlanStep'
import { SummaryStep } from './Steps/SummaryStep'
import { useUpdateSsidMutation, useUpdateSsidProfileMutation, useUpdateVlanMutation, useApplyConversationsMutation } from '@acx-ui/rc/services'

type FormValue = {
  jobInfo: {
    name: string;
    type: number;
  };
  syncTableInfo: {
    timeRange: [Dayjs, Dayjs];
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



export default function GptWizard(props: {
  sessionId: string,
  requestId: string,
  actionType: string,
  description: string,
  payload: string,
  currentStep: number,
  setCurrentStep: (currentStep: number) => void
}) {

  type NetworkConfig = {
    'Purpose': string;
    'SSID Name': string;
    'SSID Objective': string;
    'Checked': boolean;
  }

  const step1payload = JSON.parse(props.payload) as NetworkConfig[]

  const [step2payload, setStep2payload] = useState({} as GptConversation)

  const [step3payload, setStep3payload] = useState({} as GptConversation)

  const [step4payload, setStep4payload] = useState({} as GptConversation)

  const [updateSsidProfile] = useUpdateSsidProfileMutation()
  const [updateSsid] = useUpdateSsidMutation()
  const [updateVlan] = useUpdateVlanMutation()
  const [applyConversations] = useApplyConversationsMutation()


  const formMapRef = useRef<
    React.MutableRefObject<ProFormInstance<any> | undefined>[]
  >([])
  useEffect(() => {
    waitTime(1000).then(() => {
      formMapRef?.current?.forEach((formInstanceRef) => {
        formInstanceRef?.current?.setFieldsValue(formValue)
      })
    })


  }, [])



  return (
    <StepsForm
      formMapRef={formMapRef}
      containerStyle={{ width: '100%', padding: '0 30px' }}
      onCurrentChange={(current) => {
        props.setCurrentStep(current)
      }}
      stepsRender={() => null}
      onFinish={(values) => {
        console.log(values)
        return Promise.resolve(false)
      }}
    >
      <GptStepsForm.StepForm
        name='step1'
        title=''
        onFinish={async () => {
          try {
            const values = formMapRef.current[0].current?.getFieldsValue();
            const updatedValues = values.step1payload
              .filter((item: { 'Checked': any; }) => item['Checked'])
              .map(({ Checked, ...rest }: { Checked?: boolean;[key: string]: any }) => rest);

            console.log(updatedValues);

            try{
              const response = await updateSsidProfile({
                params: { sessionId: props.sessionId },
                payload: JSON.stringify(updatedValues)
              }).unwrap()

              setStep2payload(response)

            } catch (error) {
              console.error('Failed to update SSID:', error);
            }

            return true

          } catch (error) {
            console.log(error);
          }
        }}>
        <WlanStep
          payload={props.payload}
          description={props.description}
        />
      </GptStepsForm.StepForm>

      <GptStepsForm.StepForm
        name='step2'
        title=''
        onFinish={async () => {
          try {
            console.log(formMapRef.current[1].current?.getFieldsValue());
            const values = formMapRef.current[1].current?.getFieldsValue();
            const updatedValues = values.step2payload

            console.log(updatedValues);

            try{
              const response = await updateSsid({
                params: { sessionId: props.sessionId },
                payload: JSON.stringify(updatedValues)
              }).unwrap()

              setStep3payload(response)

            } catch (error) {
              console.error('Failed to update SSID:', error);
            }

            return true



          } catch (error) {
            return false
          }
        }}
      >
        <WlanDetailStep
          payload={step2payload.payload} />
      </GptStepsForm.StepForm>

      <GptStepsForm.StepForm name='step3'
        title={''}
        onFinish={async () => {
          try {
            const values = formMapRef.current[2].current?.getFieldsValue();
            const updatedValues = values.step3payload
              .filter((item: { 'Checked': any; }) => item['Checked'])
              .map(({ Checked, ...rest }: { Checked?: boolean;[key: string]: any }) => rest);

            console.log(updatedValues);

            try{
              const response = await updateVlan({
                params: { sessionId: props.sessionId },
                payload: JSON.stringify(updatedValues)
              }).unwrap()

              setStep4payload(response)

            } catch (error) {
              console.error('Failed to update SSID:', error);
            }

            return true
          } catch (error) {
            return false
          }
        }}


      >
        <VlanStep
            payload={step3payload.payload}/>
      </GptStepsForm.StepForm>

      <GptStepsForm.StepForm name='step4'
        title={''}
        onFinish={async () => {
          try {
            const response = await applyConversations({
              params: { sessionId: props.sessionId }
            }).unwrap()
            alert('yes')
          } catch (error) {
            alert('no')
            console.log(error);
          }
        }}>
          <SummaryStep payload={step4payload.payload}/>
      </GptStepsForm.StepForm>

    </StepsForm>
  )
}
