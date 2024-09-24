import { useState } from 'react'


import { Button }  from 'antd'
import { useIntl } from 'react-intl'


import { cssStr } from '@acx-ui/components'

import { ReactComponent as Logo } from './assets/gptDog.svg'
import BasicInformationPage       from './BasicInformationPage'
import * as UI                    from './styledComponents'
import VerticalPage               from './VerticalPage'

export default function RuckusGptButton () {
  const [visible, setVisible] = useState(false)
  const { $t } = useIntl()

  const [step, setStep] = useState('vertical' as String)


  return <div>
    <UI.ButtonSolid
      icon={<Logo />}
      onClick={() => {
        setVisible(!visible)
      }}
    />
    <UI.GptModal
      title={
        <div style={{ display: 'flex', padding: '20px' }}>
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
      visible={true}//{visible}
      footer={<>
        {step === 'basic' &&
          <Button key='back' onClick={() => { setStep('vertical') }}>
            {$t({ defaultMessage: 'Back' })}
          </Button>}

        <Button key='next'
          type='primary'
          onClick={() => {
            if (step === 'vertical') {
              setStep('basic')
            } else {
              // setStep('wizard')
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

          {step === 'vertical' && <VerticalPage/>}
          {step === 'basic' && <BasicInformationPage/>}
        </>
      }
    />
  </div>
}

export {
  RuckusGptButton
}
