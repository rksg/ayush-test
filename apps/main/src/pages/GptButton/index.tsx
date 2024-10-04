import { useRef, useState } from 'react'


import { Button, Form, Steps }  from 'antd'
import { useIntl } from 'react-intl'


import { cssStr } from '@acx-ui/components'

import { ReactComponent as Logo } from './assets/gptDog.svg'
import BasicInformationPage       from './BasicInformationPage'
import * as UI                    from './styledComponents'
import VerticalPage               from './VerticalPage'
import GptWizard from './GptWizard'
import { useStartConversationsMutation } from '@acx-ui/rc/services'
import { GptConversation } from '@acx-ui/rc/utils'

export default function RuckusGptButton () {
  const [visible, setVisible] = useState(false)
  const { $t } = useIntl()

  const [step, setStep] = useState('vertical' as String)

  const mockResponse_step2 = {
    requestId: '567ce50233af4e47a7354d2c47b3a8e6',
    actionType: 'WLAN',
    payload: '[{"SSID Name":"Guest","SSID Type":"aaa"},{"SSID Name":"Staff","SSID Type":"dpsk"}]'
  }

  const [currentStep, setCurrentStep] = useState(0 as number)
  const [basicFormRef] = Form.useForm()
  const [startConversations] = useStartConversationsMutation()
  const [venueType, setVenueType] = useState('' as string)
  const [nextStep, setNextStep] = useState({} as GptConversation)


  return <div>
    <UI.ButtonSolid
      icon={<Logo />}
      onClick={() => {
        setVisible(!visible)
      }}
    />
    <UI.GptModal
      titleType={step === 'wizard' ? 'wizard' : 'default'}
      title={step === 'wizard' ?
        <div
          style={{ width: '250px' }}>
          <UI.GptStep
            current={currentStep}
            percent={100} size="small"
            type="default">
            {[
              { key: 'step1' },
              { key: 'step2' },
              { key: 'step3' },
              { key: 'step4' }
            ].map((item) => (
              <Steps.Step key={item.key} />
            ))}
          </UI.GptStep>
        </div> :
        <div style={{ display: 'flex', padding: '20px 20px 0px 20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '20px'
          }}>
            <Logo style={{ width: '43px', height: '36px' }} />
          </div>
          <div style={{
            flexGrow: 1, display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              fontSize: '24px',
              lineHeight: '28px',
              marginBottom: '8px',
              fontFamily: cssStr('--acx-accent-brand-font')
            }}>Onboarding Asistent</div>
            <div
              style={{
                fontFamily: cssStr('--acx-neutral-brand-font'),
                color: '#808284',
                fontSize: '12px',
                lineHeight: '16px',flexGrow: 1
              }}
            >Please answer the following questions for optimal network recommendations.</div>
          </div>
        </div>}
      visible={visible}
      footer={step==='wizard' ? null : <>
        {step !== 'vertical' &&
          <Button key='back'
            onClick={
              () => {
                if (step === 'basic') {
                  setStep('vertical')
                } 
              }
            }>
            {$t({ defaultMessage: 'Back' })}
          </Button>}

        <Button key='next'
          type='primary'
          onClick={async () => {
            if (step === 'vertical') {
              basicFormRef.validateFields().then(() => {
                const result = basicFormRef.getFieldsValue()
                const type = result.venueType === 'OTHER' ? result.othersValue : result.venueType
                setVenueType(type)
                setStep('basic')
              }).catch(() => {
                return
              })

            } else if (step === 'basic') {
              basicFormRef.validateFields().then(

                async () => {
                  try {
                    const result = basicFormRef.getFieldsValue();
                    const response = await startConversations({
                      payload: {
                        venueName: result.venueName,
                        numberOfAp: result.numberOfAp,
                        numberOfSwitch: result.numberOfSwitch,
                        venueType,
                        description: result.description,
                      },
                    }).unwrap();
                    setStep('wizard');
                    setNextStep(response);
                  } catch (error) {
                    console.error('Failed to start conversation:', error);
                  }
                }

              ).catch(() => {
                return
              }
              )

            }
          }}>
          {$t({ defaultMessage: 'Next' })}
        </Button>
      </>}
      mask={true}
      width={1000}
      onCancel={() => {
        basicFormRef.resetFields()
        setStep('vertical')
        setVisible(false)
      }}
      children={
        <>
          <Form form={basicFormRef}
            layout={'vertical'}
            labelAlign='left'>
            {step === 'vertical' && <VerticalPage />}
            {step === 'basic' && <BasicInformationPage />}
          </Form>
          {step === 'wizard' && <GptWizard
            sessionId={nextStep.sessionId}
            requestId={nextStep.sessionId}
            actionType={nextStep.nextStep}
            description={nextStep.description}
            payload={nextStep.payload}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />}
        </>
      }
    />
  </div>
}

export {
  RuckusGptButton
}
