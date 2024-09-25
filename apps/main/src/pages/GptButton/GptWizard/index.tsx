/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react'

import { ProFormCheckbox, ProFormInstance, ProFormSelect, ProFormText, StepsForm } from '@ant-design/pro-form'
import { Divider, Form, Steps }                                                           from 'antd'
import dayjs                                                                       from 'dayjs'

import { NetworkTypeEnum, networkTypes } from '@acx-ui/rc/utils'


import { GptStepsForm } from '../styledComponents'

import type { Dayjs } from 'dayjs'
import { getJwtToken, getTenantId } from '@acx-ui/utils'
import { showActionModal } from '@acx-ui/components'
import { useNavigate } from 'react-router-dom'
import { current } from '@reduxjs/toolkit'
const networkTypeMap = {
  [NetworkTypeEnum.OPEN]: 'Open Network',
  [NetworkTypeEnum.PSK]: 'Passphrase (PSK/SAE)',
  [NetworkTypeEnum.DPSK]: 'Dynamic Pre-Shared Key (DPSK)',
  [NetworkTypeEnum.AAA]: 'Enterprise AAA (802.1X)',
  [NetworkTypeEnum.HOTSPOT20]: 'Hotspot 2.0 Access',
  [NetworkTypeEnum.CAPTIVEPORTAL]: 'Captive Portal'
}

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

const getNetworkTypeDescription = (type: string) => {
  if (type === NetworkTypeEnum.OPEN) {
    return 'Open Network';
  } else if (type === NetworkTypeEnum.PSK) {
    return 'Passphrase (PSK/SAE)';
  } else if (type === NetworkTypeEnum.DPSK) {
    return 'Dynamic Pre-Shared Key (DPSK)';
  } else if (type === NetworkTypeEnum.AAA) {
    return 'Enterprise AAA (802.1X)';
  } else if (type === NetworkTypeEnum.HOTSPOT20) {
    return 'Hotspot 2.0 Access';
  } else if (type === NetworkTypeEnum.CAPTIVEPORTAL) {
    return 'Captive Portal';
  } else {
    return 'Unknown Type'; // 默认值
  }
}

const networkOptions = [
  {
    value: NetworkTypeEnum.OPEN,
    label: 'Open Network'
  }, {
    value: NetworkTypeEnum.PSK,
    label: 'Passphrase (PSK/SAE)'
  }, {
    value: NetworkTypeEnum.DPSK,
    label: 'Dynamic Pre-Shared Key (DPSK)'
  }, {
    value: 'aaa',
    label: 'Enterprise AAA (802.1X)'
  }, {
    value: NetworkTypeEnum.CAPTIVEPORTAL,
    label: 'Captive Portal'
  }
]

const objectiveOptions = [
  {
    value: 'Internal',
    label: 'Internal'
  }, {
    value: 'Guest',
    label: 'Guest'
  }, {
    value: 'VIP',
    label: 'VIP'
  }, {
    value: 'Infrastructure',
    label: 'Infrastructure'
  }, {
    value: 'Personal',
    label: 'Personal'
  }, {
    value: 'Public',
    label: 'Public'
  }
]

export default function GptWizard (props: {
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

  const [step2payload, setStep2payload] = useState({} as {
    'requestId': string;
    'actionType': string;
    'payload': string;
  })
  const mockResponse_step2 = {
    requestId: '567ce50233af4e47a7354d2c47b3a8e6',
    actionType: 'WLAN',
    payload: '[{"SSID Name":"Guest","SSID Type":"aaa"},{"SSID Name":"Staff","SSID Type":"dpsk"}]'
  }

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
  const mockResponse_step4 = {
    "venue": {
      "venueName": "JK Venue",
      "numberOfAp": 6,
      "ssidDescription": "For JK Venue, a hotel with 6 WiFi access points and 7 switches, setting up a robust and secure WiFi network is essential to cater to both guest and operational needs. Here's a recommended list for SSID Profiles:",
      "venueType": "HOTEL",
      "description": "Good",
      "numberOfSwitch": 7
    },
    "vlan": [
      {"VLAN Name": "Guest" , "VLAN ID": 10},
      {"VLAN Name": "Staff" , "VLAN ID": 20},
      {"VLAN Name": "VIP"   , "VLAN ID": 30},
      {"VLAN Name": "IoT"   , "VLAN ID": 40},
      {"VLAN Name": "Public", "VLAN ID": 50}
    ],
    "ssid": [
      {
        "SSID Type": "guest",
        "SSID Objective": "Guest",
        "SSID Name": "Guest",
        "Purpose": "This network is for all hotel guests to access the internet freely during their stay."
      },
      {
        "SSID Type": "aaa",
        "SSID Objective": "Internal",
        "SSID Name": "Staff",
        "Purpose": "This network is for hotel staff to manage operations and communicate effectively."
      },
      {
        "SSID Type": "guest",
        "SSID Objective": "VIP",
        "SSID Name": "VIP",
        "Purpose": "This network is reserved for high-priority guests, providing them with a premium internet experience."
      },
      {
        "SSID Type": "dpsk",
        "SSID Objective": "Infrastructure",
        "SSID Name": "IoT",
        "Purpose": "This network supports infrastructure devices like security cameras and smart devices used throughout the hotel."
      },
      {
        "SSID Type": "open",
        "SSID Objective": "Public",
        "SSID Name": "Public",
        "Purpose": "This network is available for public use without authentication, ideal for visitors to the hotel."
      }
    ]
  }

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
      stepsRender={(steps, dom) => {
        // // 根据业务逻辑，保留3个步骤
        // //  if (needFilter) {
        //    return (
        //      <Steps current={currentStep}>
        //        {[
        //          { title: '步骤1', key: 'step1' },
        //          { title: '步骤2', key: 'step2' },
        //          { title: '步骤3', key: 'step3' },
        //        ].map((item) => (
        //          <Steps.Step key={item.key} title={item.title} />
        //        ))}
        //      </Steps>
        //    );
        return null
       }}
      onFinish={(values) => {
        console.log(values)
        return Promise.resolve(false)
      }}
    >
      <GptStepsForm.StepForm
        name='step1'
        title=''
        onFinish={async () => {
          return true
          try {
            console.log(formMapRef.current[0].current?.getFieldsValue());
            const values = formMapRef.current[0].current?.getFieldsValue();
            const updatedValues = values.step1payload
              .map((item: { [x: string]: any; }, index: any) => ({
                ...item,
                Purpose: step1payload[index]['Purpose']
              }))
              .filter((item: { 'Checked': any; }) => item['Checked'])
              .map(({ Checked, ...rest }: { Checked?: boolean; [key: string]: any }) => rest);

            console.log(updatedValues);

            const url = `/api/gpt/tenant/${getTenantId()}/onboardAssistant/${props.requestId}/ssidProfile`;

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
            setStep2payload(data);
            return true;
          } catch (error) {
            console.log(error);
          } finally {
            // setStep2payload(mockResponse_step2); // TODO: GPT TESTING, NEED REMOVED!!!
            // return true; // TODO: GPT TESTING, NEED REMOVED!!!

            return true; // TODO: GPT TESTING, NEED REMOVED!!!
          }
        }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          <div style={{
            flex: '0 1 auto',
            // padding: '30px',
            display: 'flex',          // 启用 Flexbox 布局
            flexDirection: 'column',  // 垂直排列子元素
            justifyContent: 'center' // 垂直居中子元素
            // alignItems: 'center'      // 水平居中子元素
          }}> {/* 顶部部分 */}

            <span style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', fontFamily: 'Montserrat' }}>
              Recommended SSID Profiles
            </span>
            <span style={{ fontSize: '16px', color: '#808284', margin: '20px 0' }}>
              {props.description}
            </span>

            {step1payload.map((item, index) => (
              <React.Fragment key={index}>
                <ProFormCheckbox
                  name={['step1payload', index, 'Checked']}
                  initialValue={true}
                ></ProFormCheckbox>
                <ProFormText
                  label='SSID name'
                  name={['step1payload', index, 'SSID Name']} // 设置 name 对应原始数据结构
                  initialValue={item['SSID Name']}
                />
                <ProFormSelect
                  tooltip={{
                    title: (
                      <ul style={{ margin: 0, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <li>Internal: For employees, teachers, lecturers, and students.</li>
                        <li>Guest: For external guests, visitors, and customers.</li>
                        <li>VIP: For high-priority guests, visitors, and customers.</li>
                        <li>Infrastructure: For infrastructure devices, such as VoIP phones, barcode scanners, cameras, printers, security cameras, projectors, point-of-sale system, IoT devices, and smart home devices.</li>
                        <li>Personal: For home use, and personal devices, such as smartphones, tablets, and computers.</li>
                        <li>Public: For open public use without authentication.</li>
                      </ul>
                    ),
                    overlayStyle: { width: '700px' }


                  }}
                  label='SSID Objective'
                  name={['step1payload', index, 'SSID Objective']} // 设置 name 对应原始数据结构
                  initialValue={item['SSID Objective']}
                  options={objectiveOptions}
                />

                  <span
                   style={{
                    backgroundColor: '#F7F7F7',
                    padding: '20px 0px 0px 20px',
                    borderRadius: '8px'
                  }}>
                <ProFormText label='Purpose'
                  name={['step1payload', index, 'Purpose']}
                  children={item['Purpose']}
                />
                </span>
                <Divider dashed />
              </React.Fragment>
            ))}
          </div>
        </div>
      </GptStepsForm.StepForm>

      <GptStepsForm.StepForm
        name='step2'
        title=''
        // onFinish={
        //   async () => {
        //     console.log(formMapRef.current[1].current?.getFieldsValue())

        //     const values = formMapRef.current[1].current?.getFieldsValue()
        //     const updatedValues = values.step2payload.map((item: { [x: string]: any; }, index: any) => ({
        //       ...item,
        //       'SSID Name': step1payload[index]['SSID Name']
        //     }))
        //     console.log(updatedValues)

        //     setStep3payload(mockResponse_step3)

        //     return Promise.resolve(true)
        //   }}
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
            // setStep3payload(mockResponse_step3); // TODO: GPT TESTING, NEED REMOVED!!!
            // return true; // TODO: GPT TESTING, NEED REMOVED!!!

            return true
          }
        }}


          >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            flex: '0 1 auto',
            // padding: '30px',
            display: 'flex',          // 启用 Flexbox 布局
            flexDirection: 'column',  // 垂直排列子元素
            justifyContent: 'center' // 垂直居中子元素
            // alignItems: 'center'      // 水平居中子元素
          }}> {/* 顶部部分 */}

            {/* step2payload */}

            <span style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', fontFamily: 'Montserrat' }}>
              Recommended SSID Profiles
            </span>
            <span style={{ fontSize: '16px', color: '#808284', margin: '20px 0' }}>
            Based on your selection, below is the list of SSIDs and their recommended respective configurations.
            </span>


            {step2payload.payload && JSON.parse(step2payload.payload).map((item: { [x: string]: any; }, index:number) => (
              <React.Fragment key={index}>
                <ProFormText label='SSID name'
                  name={['step2payload', index, 'SSID Name']}
                  children={item['SSID Name']}
                />
                <ProFormSelect
                  label='Network Type'
                  name={['step2payload', index, 'SSID Type']}
                  initialValue={item['SSID Type']}
                  options={networkOptions}
                />
                <Divider dashed />
              </React.Fragment>
            ))}

          </div>
        </div>
      </GptStepsForm.StepForm>

      <GptStepsForm.StepForm name='step3'
        title={''}
        // onFinish={
        //   async () => {
        //     console.log(formMapRef.current[2].current?.getFieldsValue())


        //     const values = formMapRef.current[2].current?.getFieldsValue()
        //     const updatedValues = values.step3payload.map((item: { [x: string]: any; }, index: any) => ({
        //       ...item
        //     })).filter((item: { 'Checked': any; }) => item['Checked'])
        //       .map(({ Checked, ...rest }: { Checked?: boolean; [key: string]: any }) => rest)
        //     console.log(updatedValues)




        //     // setStep2payload(mockResponse_step2)


        //     return Promise.resolve(true)
        //   }}
        onFinish={async () => {
          try {
            console.log(formMapRef.current[2].current?.getFieldsValue())


            const values = formMapRef.current[2].current?.getFieldsValue()
            const updatedValues = values.step3payload.map((item: { [x: string]: any; }, index: any) => ({
              ...item
            })).filter((item: { 'Checked': any; }) => item['Checked'])
              .map(({ Checked, ...rest }: { Checked?: boolean; [key: string]: any }) => rest)
            console.log(updatedValues)
            console.log(updatedValues);

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
            // setStep4payload(mockResponse_step4); // TODO: GPT TESTING, NEED REMOVED!!!
            // return true; // TODO: GPT TESTING, NEED REMOVED!!!

            return true; // TODO: GPT TESTING, NEED REMOVED!!!
          }
        }}


          >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            flex: '0 1 auto',
            // padding: '30px',
            display: 'flex',          // 启用 Flexbox 布局
            flexDirection: 'column',  // 垂直排列子元素
            justifyContent: 'center' // 垂直居中子元素
            // alignItems: 'center'      // 水平居中子元素
          }}> {/* 顶部部分 */}

            <span style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', fontFamily: 'Montserrat' }}>
              Recommended Settings for ICX
            </span>
            <span style={{ fontSize: '16px', color: '#808284', margin: '20px 0' }}>
              Optimal VLAN settings suggested by RuckusGPT to enhance network performance and management for ICX devices.
            </span>


            {step3payload.payload && JSON.parse(step3payload.payload).map((item: { [x: string]: any; }, index: number) => (

              <React.Fragment key={index}>
                <ProFormCheckbox
                  name={['step3payload', index, 'Checked']}
                  initialValue={true}
                ></ProFormCheckbox>
                <ProFormText label='VLAN ID'
                  name={['step3payload', index, 'VLAN ID']}
                  initialValue={item['VLAN ID']}
                />
                <ProFormSelect
                  label='VLAN Name'
                  name={['step3payload', index, 'VLAN Name']}
                  initialValue={item['VLAN Name']}
                  options={networkOptions}
                />
                <Divider dashed />
              </React.Fragment>
            ))}


          </div>
        </div>
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            flex: '0 1 auto',
            // padding: '30px',
            display: 'flex',          // 启用 Flexbox 布局
            flexDirection: 'column',  // 垂直排列子元素
            justifyContent: 'center' // 垂直居中子元素
            // alignItems: 'center'      // 水平居中子元素
          }}> {/* 顶部部分 */}

            <span style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', fontFamily: 'Montserrat' }}>
              Summary
            </span>
            <span style={{ fontSize: '16px', color: '#808284', margin: '20px 0' }}>
            Alright, we have completed the setup for your network. Below is a summary.<br/>
            Would you like me to create these configurations and apply them to the venue <b>{step4payload.payload && JSON.parse(step4payload.payload).venue.venueName}</b>?
            </span>


            <Form.Item
              label={'Wireless Networks'}
              children={<ul>
                {step4payload.payload && JSON.parse(step4payload.payload).ssid &&
                JSON.parse(step4payload.payload).ssid.map((item: any, index: number) => (
                  <li key={index}>{`${item['SSID Name']} with ${getNetworkTypeDescription(item['SSID Type'])}`}</li>
                ))}
              </ul>
              }
            />
            <Form.Item
              label={'VLAN Configuration'}
              children={<ul>
                {step4payload.payload && JSON.parse(step4payload.payload).vlan
                 && JSON.parse(step4payload.payload).vlan.map((item: any, index: number) => (
                  <li key={index}>{`${item['VLAN Name']} @ VLAN  ${item['VLAN ID']}`}</li>
                ))}
              </ul>}
            />

          </div>
        </div>
      </GptStepsForm.StepForm>

    </StepsForm>
  )
}
