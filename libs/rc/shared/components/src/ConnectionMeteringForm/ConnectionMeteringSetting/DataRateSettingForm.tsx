import { useEffect, useState } from 'react'

import { Form,  Switch,  Checkbox, InputNumber } from 'antd'
import { useIntl }                               from 'react-intl'
import styled                                    from 'styled-components/macro'

import { StepsForm, Tooltip }         from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'

const Label = styled.span`
  font-size: var(--acx-body-4-font-size);
  line-height: 34px;
`


interface RateInputProps{
  enabled: boolean
  value?: number
  onChange: (value:number)=>void
}

function RateInput (props:RateInputProps) {
  const { $t } = useIntl()
  if (props.enabled) {
    return (<Label><InputNumber value={props.value}
      min={1}
      onChange={(v)=>props.onChange(v)}/>{$t({ defaultMessage: ' Mbps' })}</Label>)
  }
  return (<Label> {$t({ defaultMessage: 'Unlimited' })}</Label>)
}


interface RateSettingProps {
  label: string
  rate?: number
  onChange: (value:number|undefined)=>void
  tooltip?: string
}
function RateSetting (props:RateSettingProps) {
  const [checked, setChecked] = useState((props.rate ?? 0) > 0)
  const [rate, setRate] = useState(props.rate ? props.rate : undefined)
  useEffect(()=>{
    props.onChange(rate)
  }, [rate])

  useEffect(()=> {
    if (!checked) {
      props.onChange(undefined)
    } else {
      props.onChange(rate)
    }
  }, [checked])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '60%', float: 'left' }}>
        <Checkbox checked={checked}
          onChange={(e)=>setChecked(e.target.checked)}>{props.label}
        </Checkbox>

        {props.tooltip &&
        <Tooltip title={props.tooltip}>
          <QuestionMarkCircleOutlined height={'16px'} width={'16px'}/>
        </Tooltip>}
      </div>
      <div style={{ width: '40%', float: 'left' }}>
        <RateInput enabled={checked} value={rate} onChange={(v)=>setRate(v)}/>
      </div>
    </div>
  )
}



export function DataRateSettingForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const rateLimitEnabled = Form.useWatch('rateLimitEnabled', form)
  const [showWarning, setShowWarning] = useState(false)

  return(<>
    <StepsForm.Title>{$t({ defaultMessage: 'Data Rate Settings' })}</StepsForm.Title>
    <StepsForm.FieldLabel width='200px'>
      {$t({ defaultMessage: 'Enable Rate Limiting' })}
      <Form.Item
        name='rateLimitEnabled'
        valuePropName='checked'
        children={<Switch/>}
      />
    </StepsForm.FieldLabel>
    {rateLimitEnabled &&
            <>
              {showWarning && <Label style={{ color: 'var(--acx-semantics-red-60)' }}>
                {$t({ defaultMessage: 'One of the total rate limit setting should be chosen' })}
              </Label>}

              <Form.Item name='uploadRate'>
                <RateSetting
                  label={$t({ defaultMessage: 'Total Upload Limit' })}
                  tooltip={$t({ defaultMessage: `The total upload traffic limit 
                    of all the devices per unit on wireless and wired connections` })}
                  onChange={(v)=>{
                    form.setFieldValue('uploadRate', v)
                    setShowWarning(false)
                  }}
                  rate={form.getFieldValue('uploadRate')}></RateSetting>
              </Form.Item>
              <Form.Item name='downloadRate'>
                <RateSetting
                  label={$t({ defaultMessage: 'Total Download Limit' })}
                  tooltip={$t({ defaultMessage: `The total download traffic limit 
                    of all the devices per unit on wireless and wired connections` })}
                  onChange={(v)=>{
                    form.setFieldValue('downloadRate', v)
                    setShowWarning(false)
                  }}
                  rate={form.getFieldValue('downloadRate')}></RateSetting>
              </Form.Item>
              <Form.Item
                name={'rateLimitWarningMessage'}
                noStyle
                rules={[
                  { validator: () => {
                    if (!rateLimitEnabled || form.getFieldValue('uploadRate')
              || form.getFieldValue('downloadRate')) {
                      setShowWarning(false)
                      return Promise.resolve()
                    } else {
                      setShowWarning(true)
                      return Promise.reject()
                    }
                  } }
                ]}
              />
            </>
    }
  </>)
}