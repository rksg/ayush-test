/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react'

import { ProFormInstance, StepsForm } from '@ant-design/pro-form'
import dayjs from 'dayjs'

import { GptConversation, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { GptStepsForm } from '../styledComponents'

import type { Dayjs } from 'dayjs'
import { getJwtToken, getTenantId } from '@acx-ui/utils'
import { showActionModal } from '@acx-ui/components'
import { useNavigate } from 'react-router-dom'
import { WlanStep } from './Steps/WlanStep'
import { WlanDetailStep } from './Steps/WlanDetailStep'
import { VlanStep } from './Steps/VlanStep'
import { SummaryStep } from './Steps/SummaryStep'
import { useUpdateSsidMutation, useUpdateSsidProfileMutation, useUpdateVlanMutation } from '@acx-ui/rc/services'

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

  const [step3payload, setStep3payload] = useState({} as {
    'requestId': string;
    'actionType': string;
    'payload': string;
  })
  const mockResponse_step3 = {
    requestId: '567ce50233af4e47a7354d2c47b3a8e6',
    actionType: 'VLAN',
    payload: '[{"VLAN Name":"VLAN1","VLAN ID":"100"},{"VLAN Name":"VLAN2","VLAN ID":"200"}]'
  }

  const [step4payload, setStep4payload] = useState({} as {
    'requestId': string;
    'actionType': string;
    'payload': string;
  })
  const navigate = useNavigate()
  const [updateSsidProfile] = useUpdateSsidProfileMutation()
  const [updateSsid] = useUpdateSsidMutation()
  const [updateVlan] = useUpdateVlanMutation()
  
  

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
            console.log(formMapRef.current[0].current?.getFieldsValue());
            const values = formMapRef.current[0].current?.getFieldsValue();
            const updatedValues = values.step1payload
              .map((item: { [x: string]: any; }, index: any) => ({
                ...item,
                Purpose: step1payload[index]['Purpose']
              }))
              .filter((item: { 'Checked': any; }) => item['Checked'])
              .map(({ Checked, ...rest }: { Checked?: boolean;[key: string]: any }) => rest);

            console.log(updatedValues);

            // Perform the fetch request
            // const response = await fetch(url, {
            //   method: 'POST',
            //   headers: {
            //     'Authorization': `Bearer ${getJwtToken()}`,
            //     'Content-Type': 'application/json',
            //     'Accept': 'application/json'
            //   },
            //   body: JSON.stringify(updatedValues)
            // });

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
          } finally {
            // setStep2payload(mockResponse_step2); // TODO: GPT TESTING, NEED REMOVED!!!
            // return true; // TODO: GPT TESTING, NEED REMOVED!!!

            return true; // TODO: GPT TESTING, NEED REMOVED!!!
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
            console.log(formMapRef.current[1].current?.getFieldsValue())

            const values = formMapRef.current[1].current?.getFieldsValue()
            const updatedValues = values.step2payload.map((item: { [x: string]: any; }, index: any) => ({
              ...item,
              'SSID Name': JSON.parse(step2payload.payload)[index]['SSID Name']
            }))
            console.log(updatedValues);

            const url = `/api/gpt/tenant/${getTenantId()}/onboardAssistant/${props.requestId}/wlan`;

            // Perform the fetch request
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${getJwtToken()}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(updatedValues)
            });

            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setStep3payload(data);
            return true;
          } catch (error) {
            console.log(error);
          } finally {
            return true
          }
        }}
      >
        <WlanDetailStep/>
      </GptStepsForm.StepForm>

      <GptStepsForm.StepForm name='step3'
        title={''}
        onFinish={async () => {
          try {
            console.log(formMapRef.current[2].current?.getFieldsValue())
            const values = formMapRef.current[2].current?.getFieldsValue()
            const updatedValues = values.step3payload.map((item: { [x: string]: any; }, index: any) => ({
              ...item
            })).filter((item: { 'Checked': any; }) => item['Checked'])
              .map(({ Checked, ...rest }: { Checked?: boolean;[key: string]: any }) => rest)

            const url = `/api/gpt/tenant/${getTenantId()}/onboardAssistant/${props.requestId}/vlan`;

            // Perform the fetch request
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${getJwtToken()}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(updatedValues)
            });

            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setStep4payload(data);
            return true;
          } catch (error) {
            console.log(error);
          } finally {
            return true; // TODO: GPT TESTING, NEED REMOVED!!!
          }
        }}


      >
        <VlanStep/>
      </GptStepsForm.StepForm>

      <GptStepsForm.StepForm name='step4'
        title={''}
        onFinish={async () => {
          try {
            const url = `/api/gpt/tenant/${getTenantId()}/onboardAssistant/${props.requestId}/apply`;
            // Perform the fetch request
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${getJwtToken()}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({})
            });

            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const data = await response.json();
            showActionModal({
              title: 'Congratulations! ',
              type: 'info',
              content: 'Your network is now fully configured.',
              onOk: () => {
                navigate(`/${getTenantId()}/t/networks/wireless`,
                  { replace: true })
                // window.location.reload()
              }
            })
            return false;
          } catch (error) {
            console.log(error);
          } finally {
            return false;
          }
        }}>
          <SummaryStep/>
      </GptStepsForm.StepForm>

    </StepsForm>
  )
}
