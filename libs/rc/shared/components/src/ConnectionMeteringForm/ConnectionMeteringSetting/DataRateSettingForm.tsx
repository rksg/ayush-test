import { useEffect, useState } from 'react'

import { Form,  Switch,  Checkbox, InputNumber } from 'antd'
import { useIntl }                               from 'react-intl'

import { StepsForm } from '@acx-ui/components'



interface RateInputProps{
  enabled: boolean
  value?: number
  onChange: (value:number)=>void
}

function RateInput (props:RateInputProps) {
  const { $t } = useIntl()
  if (props.enabled) {
    return (<span><InputNumber value={props.value}
      min={1}
      onChange={(v)=>props.onChange(v)}/>{$t({ defaultMessage: ' Mbps' })}</span>)
  }
  return (<span> {$t({ defaultMessage: 'Unlimited' })}</span>)
}


interface RateSettingProps {
  label: string
  rate?: number
  onChange: (value:number|undefined)=>void
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
    <div>
      <div style={{ width: '55%', float: 'left' }}>
        <Checkbox checked={checked}
          onChange={(e)=>setChecked(e.target.checked)}>{props.label}
        </Checkbox>
      </div>
      <div style={{ width: '45%', float: 'left' }}>
        <RateInput enabled={checked} value={rate} onChange={(v)=>setRate(v)}/>
      </div>
    </div>
  )
}



export function DataRateSettingForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const rateLimitEnabled = Form.useWatch('rateLimitEnabled', form)

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
              <Form.Item name='uploadRate'>
                <RateSetting
                  label={$t({ defaultMessage: 'Total Upload limit' })}
                  onChange={(v)=>form.setFieldValue('uploadRate', v)}
                  rate={form.getFieldValue('uploadRate')}></RateSetting>
              </Form.Item>
              <Form.Item name='downloadRate'>
                <RateSetting
                  label={$t({ defaultMessage: 'Total Download limit' })}
                  onChange={(v)=>form.setFieldValue('downloadRate', v)}
                  rate={form.getFieldValue('downloadRate')}></RateSetting>
              </Form.Item>
            </>
    }
  </>)
}