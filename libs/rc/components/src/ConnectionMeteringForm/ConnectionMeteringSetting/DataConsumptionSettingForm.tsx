import { useEffect, useState } from 'react'

import { Form,  InputNumber,  Switch , Select, Slider } from 'antd'
import { useIntl }                                      from 'react-intl'

import { StepsForm, Tooltip } from '@acx-ui/components'



enum ConsumptionUnit {
  MB,
  GB
}

interface DataConsumptionSettingProps {
  capacity?: number
  onChange: (v:number|undefined)=>void
}

function DataConsumptionSetting (props: DataConsumptionSettingProps) {
  const options = [{
    label: 'MB',
    value: ConsumptionUnit.MB
  }, {
    label: 'GB',
    value: ConsumptionUnit.GB
  }]

  const [unit, setUnit] = useState(ConsumptionUnit.MB)
  const [capacity, setCapacity] = useState(props.capacity ? props.capacity : undefined)

  useEffect(()=>{
    if (capacity === undefined) {
      props.onChange(undefined)
    } else {
      if (unit === ConsumptionUnit.MB) {
        props.onChange(capacity)
      } else {
        props.onChange(capacity * 1000)
      }
    }
  }, [unit, capacity])

  return(<div>
    <div style={{ float: 'left' }}>
      <InputNumber min={1} value={capacity} onChange={(v:number)=>setCapacity(v)}/>
    </div>
    <div style={{ float: 'left', marginLeft: '5px' }}>
      <Select defaultValue={ConsumptionUnit.MB}
        options={options}
        value={unit}
        onChange={(u:ConsumptionUnit)=> setUnit(u)}/>
    </div>
  </div>)
}



export function DataConsumptionSettingForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const enabled = Form.useWatch('consumptionControlEnabled', form)
  const repeat = Form.useWatch('billingCycleRepeat',form)
  const cycleType = Form.useWatch('billingCycleType', form)

  const repeatOptions = [{
    label: $t({ defaultMessage: 'One cycle' }),
    value: false
  },{
    label: $t({ defaultMessage: 'Repeat cycles' }),
    value: true
  }]

  const cycleTypeOptions = [
    {
      label: $t({ defaultMessage: 'Weekly' }),
      value: 'CYCLE_WEEKLY'
    }, {
      label: $t({ defaultMessage: 'Monthly' }),
      value: 'CYCLE_MONTHLY'
    },{
      label: $t({ defaultMessage: 'Custom' }),
      value: 'CYCLE_NUM_DAYS'
    }]

  const dataCapacityEnforcedOptions = [{
    label: $t({ defaultMessage: 'Ignore' }),
    value: false
  },{
    label: $t({ defaultMessage: 'Discard' }),
    value: true
  }]

  return(
    <>
      <StepsForm.Title>{$t({ defaultMessage: 'Data Consumption Settings' })}</StepsForm.Title>
      <StepsForm.FieldLabel width='200px'>
        {$t({ defaultMessage: 'Enable Data Consumption control' })}
        <Form.Item
          name='consumptionControlEnabled'
          valuePropName='checked'
          children={<Switch/>}
        />
      </StepsForm.FieldLabel>
      {enabled &&
            <>
              <Form.Item
                name='dataCapacity'
                required={true}
                label={
                  <>
                    {$t({ defaultMessage: 'Max Data Comsumption' })}
                    <Tooltip.Question
                      title={$t({ defaultMessage: `Count the aggregated outbound and inbound
                       data usage for the wireless or wired network from all devices
                       that belong to this unit` })}/>
                  </>
                }
                validateTrigger={['onBlur']}
                rules={
                  [
                    { required: true }
                  ]
                }
              >
                <DataConsumptionSetting
                  capacity={form.getFieldValue('dataCapacity')}
                  onChange={(v)=> form.setFieldValue('dataCapacity', v)}
                />
              </Form.Item>

              <Form.Item
                name={'billingCycleRepeat'}
                label={$t({ defaultMessage: 'Consumption Cycle' })}
                required={true}
                rules={
                  [
                    { required: true }
                  ]
                }
              >
                <Select
                  placeholder={$t({ defaultMessage: 'Select...' })}
                  options={repeatOptions}
                />
              </Form.Item>

              <div>
                {repeat &&
                <Form.Item
                  style={{ float: 'left' }}
                  name={'billingCycleType'}
                  label={$t({ defaultMessage: 'Recurring Schedule' })}
                  required={true}
                  rules={
                    [
                      { required: true }
                    ]
                  }
                >
                  <Select
                    placeholder={$t({ defaultMessage: 'Select...' })}
                    options={cycleTypeOptions}/>
                </Form.Item>}
                {repeat && cycleType === 'CYCLE_NUM_DAYS' &&
                <Form.Item
                  style={{ float: 'left', marginLeft: '5px' }}
                  name={'billingCycleDays'}
                  required={true}
                  label={' '}
                  rules={
                    [
                      { required: true }
                    ]
                  }
                >
                  <InputNumber
                    min={1}
                    onChange={(v)=> form.setFieldValue('billingCycleDays', v)}
                    value={form.getFieldValue('billingCycleDays')}
                  />
                  <span style={{ marginLeft: '5px' }}>{$t({ defaultMessage: 'Days' })}</span>
                </Form.Item>
                }
              </div>

              <Form.Item
                name='dataCapacityEnforced'
                required={true}
                label={
                  <>
                    {$t({ defaultMessage: 'Action for overage data' })}
                    <Tooltip.Question
                      title={$t({ defaultMessage: `"ignore" is to continue the service as
                       if nothing happened; "discard" to stop all WAN bound traffic until
                       next billing cycle starts` })}/>
                  </>

                }
                initialValue={form.getFieldValue('dataCapacityEnforced')}
                rules={
                  [
                    { required: true }
                  ]
                }
                children={
                  <Select placeholder={'Select...'}
                    options={dataCapacityEnforcedOptions}
                  />}/>
              <Form.Item
                name='dataCapacityThreshold'
                required={true}
                label={
                  <>
                    {$t({ defaultMessage: 'Notify when data volume reaches(%):' })}
                    <Tooltip.Question
                      title={$t({ defaultMessage: `When data volume reaches the threshold,
                       an event will be generated and notify the customer` })}/>
                  </>
                }
                initialValue={form.getFieldValue('dataCapacityThreshold') ?? 80}
              >
                <Slider
                  tooltipVisible={false}
                  min={0}
                  max={100}
                  marks={{
                    0: { label: '0' },
                    100: { label: '100' }
                  }}
                />
              </Form.Item>
            </>
      }
    </>)
}