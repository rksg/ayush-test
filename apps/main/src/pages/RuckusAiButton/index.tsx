import { useState } from 'react'

import { Button, Form, Steps } from 'antd'
import { useIntl }             from 'react-intl'

import { cssStr, showActionModal }                                       from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                      from '@acx-ui/feature-toggle'
import { DogAndPerson, OnboardingAssistantDog }                          from '@acx-ui/icons'
import { RuckusAiDog }                                                   from '@acx-ui/icons-new'
import { useStartConversationsMutation, useUpdateConversationsMutation } from '@acx-ui/rc/services'
import { RuckusAiConfigurationStepsEnum, RuckusAiConversation }          from '@acx-ui/rc/utils'
import { useTenantLink, useNavigate }                                    from '@acx-ui/react-router-dom'

import AICanvasModal from '../AICanvas'

import BasicInformationPage    from './BasicInformationPage'
import Congratulations         from './Congratulations'
import { willRegenerateAlert } from './ruckusAi.utils'
import RuckusAiWizard          from './RuckusAiWizard'
import * as UI                 from './styledComponents'
import VerticalPage            from './VerticalPage'
import WelcomePage             from './WelcomePage'
export enum RuckusAiStepsEnum {
  WELCOME = 'WELCOME',
  VERTICAL = 'VERTICAL',
  BASIC = 'BASIC',
  CONFIGURATION = 'CONFIGURATION',
  FINISHED= 'FINISHED'
}

export default function RuckusAiButton () {
  const { $t } = useIntl()
  const isInCanvasPlmList = useIsTierAllowed(Features.CANVAS)
  const isCanvasQ2Enabled = useIsSplitOn(Features.CANVAS_Q2)
  const isCanvasEnabled = useIsSplitOn(Features.CANVAS) || isInCanvasPlmList || isCanvasQ2Enabled

  const [basicFormRef] = Form.useForm()

  const [visible, setVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false as boolean)

  const [step, setStep] = useState(RuckusAiStepsEnum.WELCOME as RuckusAiStepsEnum)
  const [nextStep, setNextStep] = useState({} as RuckusAiConversation)
  const [currentStep, setCurrentStep] = useState(0 as number)
  const [venueType, setVenueType] = useState('' as string)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [configResponse, setConfigResponse] = useState({} as any)

  const [showAlert, setShowAlert] = useState(false as boolean)
  const [selectedType, setSelectedType] = useState('' as string)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [startConversations] = useStartConversationsMutation()
  const [updateConversations] = useUpdateConversationsMutation()

  const getWizardTitle = function () {
    switch(step){
      case RuckusAiStepsEnum.BASIC:
      case RuckusAiStepsEnum.VERTICAL:
        return <><div style={{ display: 'flex', padding: '20px 20px 0px 20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '20px'
          }}>
            <OnboardingAssistantDog style={{ width: '43px', height: '36px' }} />
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
            }}>{$t({ defaultMessage: 'Onboarding Assistant' })}</div>
            <div
              style={{
                fontFamily: cssStr('--acx-neutral-brand-font'),
                color: cssStr('--acx-neutrals-60'),
                fontSize: '12px',
                lineHeight: '16px',
                flexGrow: 1
              }}>
              { // eslint-disable-next-line max-len
                $t({ defaultMessage: 'Please answer the following questions for optimal network recommendations.' })}
            </div>
          </div>

        </div>
        <div style={{ margin: '10px 30px 0px 80px' }}>
          {showAlert && willRegenerateAlert($t)}
        </div>
        </>
      case RuckusAiStepsEnum.CONFIGURATION:
        return <div
          style={{ width: '250px' }}>
          <UI.GptStep
            current={currentStep}
            percent={100}
            size='small'
            type='default'>
            {[
              { key: RuckusAiConfigurationStepsEnum.WLANS },
              { key: RuckusAiConfigurationStepsEnum.WLANDETAIL },
              { key: RuckusAiConfigurationStepsEnum.VLAN },
              { key: RuckusAiConfigurationStepsEnum.SUMMARY }
            ].map((item) => (
              <Steps.Step key={item.key} />
            ))}
          </UI.GptStep>
        </div>
      case RuckusAiStepsEnum.WELCOME:
      case RuckusAiStepsEnum.FINISHED:
      default:
        return null
    }
  }

  const renderFooter = function () {
    switch (step) {
      case RuckusAiStepsEnum.WELCOME:
        return isCanvasEnabled ? <div style={{ height: '26px' }}/> : <Button key='next'
          type='primary'
          loading={isLoading}
          onClick={startOnboardingAssistant}>
          {$t({ defaultMessage: 'Start' })}
        </Button>
      case RuckusAiStepsEnum.VERTICAL:
        return <Button key='next'
          type='primary'
          loading={isLoading}
          onClick={async () => {
            basicFormRef.validateFields().then(() => {
              const result = basicFormRef.getFieldsValue()
              const type = result.venueType === 'OTHER' ? result.othersValue : result.venueType
              setVenueType(type)
              setStep(RuckusAiStepsEnum.BASIC)
            }).catch(() => {
              return
            })
          }}>
          {$t({ defaultMessage: 'Next' })}
        </Button>
      case RuckusAiStepsEnum.BASIC:
        return <>
          <Button key='back'
            onClick={() => {
              setStep(RuckusAiStepsEnum.VERTICAL)
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
                    const response = nextStep.sessionId
                      ? await updateConversations({
                        params: { sessionId: nextStep.sessionId, type: 'start' },
                        payload: {
                          venueName: result.venueName,
                          venueType,
                          description: result.description,
                          ...(result.numberOfSwitch && { numberOfSwitch: result.numberOfSwitch }),
                          ...(result.numberOfAp && { numberOfAp: result.numberOfAp })
                        }
                      }).unwrap()
                      : await startConversations({
                        payload: {
                          venueName: result.venueName,
                          venueType,
                          description: result.description,
                          ...(result.numberOfSwitch && { numberOfSwitch: result.numberOfSwitch }),
                          ...(result.numberOfAp && { numberOfAp: result.numberOfAp })
                        }
                      }).unwrap()

                    if (response.hasChanged) {
                      await new Promise((resolve) => {
                        showActionModal({
                          type: 'confirm',
                          width: 460,
                          title: $t({ defaultMessage: 'Regenerate Configurations?' }),
                          content: $t({
                            // eslint-disable-next-line max-len
                            defaultMessage: 'The modifications here will affect the settings in the subsequent steps. Would you like to regenerate the configuration suggestions for the following steps?'
                          }),
                          okText: $t({ defaultMessage: 'Regenerate' }),
                          cancelText: $t({ defaultMessage: 'Remain Unchanged' }),
                          onOk: async () => {
                            try {
                              const newGenResponse = await updateConversations({
                                // eslint-disable-next-line max-len
                                params: { sessionId: nextStep.sessionId, type: 'start?regenerate=true' },
                                payload: {
                                  venueName: result.venueName,
                                  venueType,
                                  description: result.description,
                                  // eslint-disable-next-line max-len
                                  ...(result.numberOfSwitch && { numberOfSwitch: result.numberOfSwitch }),
                                  ...(result.numberOfAp && { numberOfAp: result.numberOfAp })
                                }
                              }).unwrap()
                              setNextStep(newGenResponse)
                            } catch (error) {
                              console.log(error) // eslint-disable-line no-console
                            }
                            resolve(true)
                          },
                          onCancel: () => resolve(false)
                        })
                      })
                    } else {
                      setNextStep(response)
                    }
                    setIsLoading(false)
                    setStep(RuckusAiStepsEnum.CONFIGURATION)
                    setShowAlert(true)
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
      case RuckusAiStepsEnum.FINISHED:
        return <Button key='next'
          type='primary'
          loading={isLoading}
          onClick={closeModal}>
          {$t({ defaultMessage: 'Finish' })}
        </Button>
      case RuckusAiStepsEnum.CONFIGURATION:
      default:
        return null
    }
  }

  const closeModal = () => {
    basicFormRef.resetFields()
    setShowAlert(false)
    setStep(RuckusAiStepsEnum.WELCOME)
    setVisible(false)
    setCurrentStep(0)
    setNextStep({} as RuckusAiConversation)
    setConfigResponse({})
    setSelectedType('')
  }

  const canvasLink = useTenantLink('/canvas')
  const navigate = useNavigate()

  const startOnboardingAssistant = () => {
    setStep(RuckusAiStepsEnum.VERTICAL)
  }

  const goChatCanvas = () => {
    if(isCanvasQ2Enabled){
      setIsModalOpen(true)
    }else{
      navigate(canvasLink)
    }
    setVisible(false)
  }

  return <>
    { isCanvasEnabled ? <UI.AiButton
      onClick={() => {
        setVisible(!visible)
      }}
    ><RuckusAiDog /></UI.AiButton>
      : <UI.ButtonSolid
        icon={<OnboardingAssistantDog />}
        onClick={() => {
          setVisible(!visible)
        }}
      />
    }

    <AICanvasModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}/>

    <UI.GptModal
      needBackground={step === RuckusAiStepsEnum.WELCOME || step === RuckusAiStepsEnum.FINISHED}
      titleType={step === RuckusAiStepsEnum.CONFIGURATION ? 'wizard' : 'default'}
      title={getWizardTitle()}
      footer={renderFooter()}
      onCancel={closeModal}
      visible={visible}
      mask={true}
      maskClosable={false}
      width={1000}
      destroyOnClose={true}
      children={
        <>
          {isCanvasEnabled && step === RuckusAiStepsEnum.WELCOME && <>
            <DogAndPerson style={{
              position: 'absolute',
              bottom: '-1px',
              left: '25px',
              zIndex: '2'
            }} />
            <div style={{
              position: 'absolute',
              fontSize: '12px',
              bottom: '20px',
              right: '40px',
              zIndex: '2'
            }}>
              {$t({ defaultMessage: 'AI-Powered by' })}
              <span style={{ fontWeight: 600, paddingLeft: '4px' }}>
                {$t({ defaultMessage: 'Mlisa' })}
              </span>
            </div>
          </>}
          <Form form={basicFormRef}
            layout={'vertical'}
            labelAlign='left'>
            {step === RuckusAiStepsEnum.WELCOME && <WelcomePage
              startOnboardingAssistant={startOnboardingAssistant}
              goChatCanvas={goChatCanvas}
            />
            }
            {step === RuckusAiStepsEnum.VERTICAL && <VerticalPage
              selectedType={selectedType}
              setSelectedType={setSelectedType} />}
            {step === RuckusAiStepsEnum.BASIC && <BasicInformationPage/>}
          </Form>
          <div style={{ display: step === RuckusAiStepsEnum.CONFIGURATION ? 'block' : 'none' }}>
            <RuckusAiWizard
              sessionId={nextStep.sessionId}
              requestId={nextStep.sessionId}
              actionType={nextStep.nextStep}
              description={nextStep.description}
              payload={nextStep.payload}
              currentStep={currentStep}
              setStep={setStep}
              step={step}
              setCurrentStep={setCurrentStep}
              setConfigResponse={setConfigResponse}
            />
          </div>
          {step === RuckusAiStepsEnum.FINISHED && <Congratulations
            configResponse={configResponse}
            closeModal={closeModal} />}
        </>
      }
    />
  </>
}

export {
  RuckusAiButton
}
