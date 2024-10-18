import { useState } from 'react'


import { Button, Form, Steps } from 'antd'
import { useIntl }             from 'react-intl'


import { cssStr }                        from '@acx-ui/components'
import { useStartConversationsMutation } from '@acx-ui/rc/services'
import { GptConversation }               from '@acx-ui/rc/utils'

import { ReactComponent as Logo } from './assets/gptDog.svg'
import BasicInformationPage       from './BasicInformationPage'
import Congratulations            from './Congratulations'
import GptWizard                  from './GptWizard'
import * as UI                    from './styledComponents'
import VerticalPage               from './VerticalPage'
import WelcomePage                from './WelcomePage'

export enum GptStepsEnum {
  WELCOME = 'WELCOME',
  VERTICAL = 'VERTICAL',
  BASIC = 'BASIC',
  CONFIGURATION = 'CONFIGURATION',
  FINISHED= 'FINISHED'
}

export default function RuckusGptButton () {
  const [visible, setVisible] = useState(false)
  const { $t } = useIntl()
  const [step, setStep] = useState(GptStepsEnum.WELCOME as GptStepsEnum)
  const [currentStep, setCurrentStep] = useState(0 as number)
  const [basicFormRef] = Form.useForm()
  const [startConversations] = useStartConversationsMutation()
  const [venueType, setVenueType] = useState('' as string)
  const [nextStep, setNextStep] = useState({} as GptConversation)
  const [isLoading, setIsLoading] = useState(false as boolean)


  const getWizardTitle = function () {
    switch(step){
      case GptStepsEnum.BASIC:
      case GptStepsEnum.VERTICAL:
        return <div style={{ display: 'flex', padding: '20px 20px 0px 20px' }}>
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
            }}>Onboarding Assistant</div>
            <div
              style={{
                fontFamily: cssStr('--acx-neutral-brand-font'),
                color: '#808284',
                fontSize: '12px',
                lineHeight: '16px',flexGrow: 1
              }}
            >Please answer the following questions for optimal network recommendations.</div>
          </div>
        </div>
      case GptStepsEnum.CONFIGURATION:
        return <div
          style={{ width: '250px' }}>
          <UI.GptStep
            current={currentStep}
            percent={100}
            size='small'
            type='default'>
            {[
              { key: 'step1' },
              { key: 'step2' },
              { key: 'step3' },
              { key: 'step4' }
            ].map((item) => (
              <Steps.Step key={item.key} />
            ))}
          </UI.GptStep>
        </div>
      case GptStepsEnum.WELCOME:
      case GptStepsEnum.FINISHED:
      default:
        return null
    }
  }

  const renderFooter = function () {
    switch (step) {
      case GptStepsEnum.WELCOME:
        return <Button key='next'
          type='primary'
          loading={isLoading}
          onClick={async () => {
            setStep(GptStepsEnum.VERTICAL)
          }}>
          {$t({ defaultMessage: 'Start' })}
        </Button>
      case GptStepsEnum.VERTICAL:
        return <>
          <Button key='back'
            onClick={() => {
              setStep(GptStepsEnum.WELCOME)
            }}>
            {$t({ defaultMessage: 'Back' })}
          </Button>
          <Button key='next'
            type='primary'
            loading={isLoading}
            onClick={async () => {
              basicFormRef.validateFields().then(() => {
                const result = basicFormRef.getFieldsValue()
                const type = result.venueType === 'OTHER' ? result.othersValue : result.venueType
                setVenueType(type)
                setStep(GptStepsEnum.BASIC)
              }).catch(() => {
                return
              })
            }}>
            {$t({ defaultMessage: 'Next' })}
          </Button>
        </>
      case GptStepsEnum.BASIC:
        return <>
          <Button key='back'
            onClick={() => {
              setStep(GptStepsEnum.VERTICAL)
            }}>
            {$t({ defaultMessage: 'Back' })}
          </Button>
          <Button key='next'
            type='primary'
            loading={isLoading}
            onClick={async () => {
              basicFormRef.validateFields().then(
                async () => {
                  try {
                    setIsLoading(true)
                    const result = basicFormRef.getFieldsValue()
                    const response = await startConversations({
                      payload: {
                        venueName: result.venueName,
                        numberOfAp: result.numberOfAp,
                        numberOfSwitch: result.numberOfSwitch,
                        venueType,
                        description: result.description
                      }
                    }).unwrap()
                    setIsLoading(false)
                    setStep(GptStepsEnum.CONFIGURATION)
                    setNextStep(response)
                  } catch (error) {
                    setIsLoading(false)
                  }
                }
              ).catch(() => {
                setIsLoading(false)
                return
              })
            }}>
            {$t({ defaultMessage: 'Next' })}
          </Button>
        </>
      default:
      case GptStepsEnum.CONFIGURATION:
        return null
    }
  }

  const closeModal = () => {
    basicFormRef.resetFields()
    setStep(GptStepsEnum.WELCOME)
    setVisible(false)
    setCurrentStep(0)
  }
  return <>
    <UI.ButtonSolid
      icon={<Logo />}
      onClick={() => {
        setVisible(!visible)
      }}
    />
    <UI.GptModal
      titleType={step === GptStepsEnum.CONFIGURATION ? 'wizard' : 'default'}
      title={getWizardTitle()}
      visible={visible}
      footer={renderFooter()}
      mask={true}
      maskClosable={false}
      width={1000}
      onCancel={closeModal}
      children={
        <>
          <Form form={basicFormRef}
            layout={'vertical'}
            labelAlign='left'>
            {step === GptStepsEnum.WELCOME && <WelcomePage />}
            {step === GptStepsEnum.VERTICAL && <VerticalPage />}
            {step === GptStepsEnum.BASIC && <BasicInformationPage />}
          </Form>
          {step === GptStepsEnum.CONFIGURATION && <GptWizard
            sessionId={nextStep.sessionId}
            requestId={nextStep.sessionId}
            actionType={nextStep.nextStep}
            description={nextStep.description}
            payload={nextStep.payload}
            currentStep={currentStep}
            setStep={setStep}
            step={step}
            setCurrentStep={setCurrentStep}
          />}
          {step === GptStepsEnum.FINISHED && <Congratulations closeModal={closeModal} />}
        </>
      }
    />
  </>
}

export {
  RuckusGptButton
}
