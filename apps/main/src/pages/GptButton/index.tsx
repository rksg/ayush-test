import { useState } from 'react'


import { Button, Steps }  from 'antd'
import { useIntl } from 'react-intl'


import { cssStr } from '@acx-ui/components'

import { ReactComponent as Logo } from './assets/gptDog.svg'
import BasicInformationPage       from './BasicInformationPage'
import * as UI                    from './styledComponents'
import VerticalPage               from './VerticalPage'
import GptWizard from './GptWizard'

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

  return <div>
    <UI.ButtonSolid
      icon={<Logo />}
      onClick={() => {
        setVisible(!visible)
      }}
    />
    <UI.GptModal
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
      footer={<>
        {step !== 'vertical' &&
          <Button key='back'
            onClick={
              () => {
                if (step === 'basic') {
                  setStep('vertical')
                } else if (step === 'wizard') {
                  setStep('basic')
                }
              }
            }>
            {$t({ defaultMessage: 'Back' })}
          </Button>}

        <Button key='next'
          type='primary'
          onClick={() => {
            if (step === 'vertical') {
              setStep('basic')
            } else if (step === 'basic') {
              setStep('wizard')
            }
          }}>
          {$t({ defaultMessage: 'Next' })}
        </Button>
      </>}
      mask={true}
      width={1000}
      onCancel={() => setVisible(false)}
      children={
        <>
          {step === 'vertical' && <VerticalPage />}
          {step === 'basic' && <BasicInformationPage />}
          {step === 'wizard' && <GptWizard
            requestId={mockResponse_step2.requestId}
            actionType={mockResponse_step2.actionType}
            description={'test'}
            payload={mockResponse_step2.payload}
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
