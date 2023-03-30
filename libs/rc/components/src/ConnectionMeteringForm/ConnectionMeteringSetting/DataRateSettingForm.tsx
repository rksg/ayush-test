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
      onChange={(v)=>props.onChange(v)}/>{' Mbps'}</span>)
  }
  return (<span> {$t({ defaultMessage: 'Unlimited' })}</span>)
}


interface RateSettingProps {
  label: string
  checked: boolean
  rate?: number
  onChange: (value:number|undefined)=>void
}
function RateSetting (props:RateSettingProps) {
  //const ref = useRef(false)
  const [checked, setChecked] = useState(props.checked)
  const [rate, setRate] = useState(props.rate)
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

  const [
    rateLimitEnabled,
    setRateLimitEnable
  ] = useState(form.getFieldValue('rateLimitEnabled') ?? false)
  const [uploadRateLimit, setUploadRateLimit] = useState(form.getFieldValue('uploadRate'))
  const [downloadRateLimit, setDownloadRateLimit] = useState(form.getFieldValue('downloadRate'))

  return(<>
    <StepsForm.Title>{$t({ defaultMessage: 'Data Rate Settings' })}</StepsForm.Title>
    <StepsForm.FieldLabel width='200px'>
      {$t({ defaultMessage: 'Enable Rate Limiting' })}
      <Form.Item
        name='rateLimitEnabled'
        valuePropName='checked'
        initialValue={rateLimitEnabled}
        children={<Switch onChange={()=>setRateLimitEnable(!rateLimitEnabled)} />}
      />
    </StepsForm.FieldLabel>
    {rateLimitEnabled &&
            <>
              <Form.Item name='uploadRate'>
                <RateSetting
                  label={$t({ defaultMessage: 'Total Upload limit' })}
                  checked={(uploadRateLimit ?? 0 ) > 0}
                  onChange={(v)=>setUploadRateLimit(v)}
                  rate={uploadRateLimit}></RateSetting>
              </Form.Item>
              <Form.Item name='downloadRate'>
                <RateSetting
                  label={$t({ defaultMessage: 'Total Download limit' })}
                  checked={(downloadRateLimit ?? 0 ) > 0}
                  onChange={(v)=>setDownloadRateLimit(v)}
                  rate={downloadRateLimit}></RateSetting>
              </Form.Item>
            </>
    }
  </>)
}