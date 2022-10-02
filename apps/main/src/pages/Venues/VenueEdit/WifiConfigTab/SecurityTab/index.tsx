import { useRef, useState } from 'react'

import { Divider, Form, Input, Select, Switch } from 'antd'
import { useIntl }                      from 'react-intl'

import { showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'

// import { VenueEditContext } from '../../index'

export interface SecuritySettingContext {
  SecurityData: unknown,
  updateSecurity: (() => void)
}

export interface SecuritySetting{
  dosProtection: boolean
}

const { Option } = Select

const { useWatch } = Form

export function SecurityTab () {
  const { $t } = useIntl()

  const formRef = useRef<StepsFormInstance<SecuritySetting>>()
  //   const [
  //     dosProtection
  //   ] = [
  //     useWatch<boolean>('dosProtection')
  //   ]

  const [dosProtection, setDosProtection] = useState(false)
  const [rogueApSetting, setRogueApSetting] = useState(false)

  const roguePolicyOptions = <Option>Default</Option>

  const handleUpdateSecuritySettings = async () => {
    try {
      console.log(dosProtection, formRef?.current?.getFieldValue('dosProtection'))
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <StepsForm
      formRef={formRef}
      onFinish={handleUpdateSecuritySettings}
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsForm.StepForm>
        <Divider orientation='left' plain>
          <div style={{
            display: 'grid', gridTemplateColumns: 'auto 100px', gridGap: '5px',
            height: '30px'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              height: '30px'
            }}> {$t({ defaultMessage: 'Dos Protection' })} </div>
            <Form.Item
              style={{
                display: 'flex', alignItems: 'center',
                height: '30px'
              }}
            >
              <Switch onClick={() => setDosProtection(!dosProtection)} />
            </Form.Item>
          </div>
        </Divider>
        { dosProtection &&
        <div>
          <div style={{
            display: 'inline-block',
            paddingTop: '5px',
            paddingRight: '5px'
          }}> {$t({ defaultMessage: 'Block a client for ' })} </div>
          <Form.Item
            style={{
              display: 'inline-block',
              paddingRight: '5px'
            }}
            name={['block']}
            initialValue={60}
            children={<Input style={{ width: '50px' }} />}
          />
          <div style={{
            display: 'inline-block',
            paddingTop: '5px',
            paddingRight: '5px'
          }}> {$t({ defaultMessage: ' seconds after ' })} </div>
          <Form.Item
            style={{
              display: 'inline-block',
              paddingRight: '5px'
            }}
            name={['repeat']}
            initialValue={5}
            children={<Input style={{ width: '50px' }} />}
          />
          <div style={{
            display: 'inline-block',
            paddingTop: '5px',
            paddingRight: '5px'
          }}> {$t({ defaultMessage: '  repeat authentication failures within ' })} </div>
          <Form.Item
            style={{
              display: 'inline-block',
              paddingRight: '5px'
            }}
            name={['within']}
            initialValue={30}
            children={<Input style={{ width: '50px' }} />}
          />
          <div style={{
            display: 'inline-block',
            paddingTop: '5px',
            paddingRight: '5px'
          }}> {$t({ defaultMessage: ' seconds' })} </div>
        </div>
        }
        <Divider orientation='left' plain>
          <div style={{
            display: 'grid', gridTemplateColumns: 'auto 100px', gridGap: '5px',
            height: '30px'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              height: '30px'
            }}> {$t({ defaultMessage: 'Rogue AP Detection:' })} </div>
            <Form.Item
              style={{
                display: 'flex', alignItems: 'center',
                height: '30px'
              }}
            >
              <Switch onClick={() => setRogueApSetting(!rogueApSetting)} />
            </Form.Item>
          </div>
        </Divider>
        { rogueApSetting &&
        <div>
          <Form.Item
            name={['reportThreshold']}
            label={$t({ defaultMessage: 'Report SNR Threshold:' })}
            initialValue={30}
            children={<><Input style={{ width: '50px' }} /> <span>dB</span></>}
          />
          <Form.Item
            name={['roguePolicyId']}
            label={$t({ defaultMessage: 'Report SNR Threshold:' })}
            style={{ width: '200px' }}
          >
            <Select>
              {roguePolicyOptions}
            </Select>
          </Form.Item>
        </div>
        }
      </StepsForm.StepForm>
    </StepsForm>
  )
}
