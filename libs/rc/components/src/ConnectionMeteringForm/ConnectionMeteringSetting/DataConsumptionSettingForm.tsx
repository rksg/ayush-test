import { useEffect, useState } from 'react'

import { Form,  InputNumber,  Switch , Select, Slider } from 'antd'
import { useIntl }                                      from 'react-intl'

import { StepsForm } from '@acx-ui/components'


enum ConsumptionUnit {
  MB,
  GB
}

interface DataConsumptionSettingProps {
  unit: ConsumptionUnit
  capacity?: number
  onUnitChange: (u:ConsumptionUnit)=>void
  onCapacityChange: (v:number|undefined)=>void
}

function DataConsumptionSetting (props: DataConsumptionSettingProps) {
  const options = [{
    label: 'MB',
    value: ConsumptionUnit.MB
  }, {
    label: 'GB',
    value: ConsumptionUnit.GB
  }]

  const [unit, setUnit] = useState(props.unit)
  const [capacity, setCapacity] = useState(props.capacity)
  useEffect(()=>{props.onUnitChange(unit)}, [unit])
  useEffect(()=>{props.onCapacityChange(capacity)}, [capacity])
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
  const [enabled, setEnabled] = useState(form.getFieldValue('consumptionControlEnabled') ?? false)
  const [unit, setUnit] = useState(ConsumptionUnit.MB)
  const [dataCapacity, setDataCapacity] = useState(form.getFieldValue('dataCapacity'))
  const [repeat, setRepeat] = useState(form.getFieldValue('billingCycleRepeat') ?? false)
  const [
    cycleType,
    setCycleType
  ] = useState(form.getFieldValue('billingCycleType') ?? 'CYCLE_UNSPECIFIED')

  const [cycleDay, setCycleDay] = useState(form.getFieldValue('billingCycleDays'))

  const repeatOptions = [{
    label: $t({ defaultMessage: 'One cycle' }),
    value: false
  },{
    label: $t({ defaultMessage: 'Repeat cycles' }),
    value: true
  }]

  const cycleTypeOptions = [{
    label: $t({ defaultMessage: 'Select...' }),
    value: 'CYCLE_UNSPECIFIED'
  },{
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
    label: 'Ignore',
    value: false
  },{
    label: 'Discard',
    value: true
  }]

  useEffect(()=> {
    if (dataCapacity === undefined) {
      form.setFieldValue('dataCapacity', 0)
    } else {
      if (unit === ConsumptionUnit.MB) {
        form.setFieldValue('dataCapacity', dataCapacity)
      } else {
        form.setFieldValue('dataCapacity', dataCapacity * 1000)
      }
    }
  }, [unit, dataCapacity])

  useEffect(()=>{
    if (!repeat || cycleType !== 'CYCLE_NUM_DAYS') {
      form?.setFieldValue('billingCycleDays', null)
    } else {
      form?.setFieldValue('billingCycleDays', cycleDay)
    }
  }, [cycleDay, cycleType, repeat])

  return(
    <>
      <StepsForm.Title>{$t({ defaultMessage: 'Data Consumption Settings' })}</StepsForm.Title>
      <StepsForm.FieldLabel width='200px'>
        {$t({ defaultMessage: 'Enable Data Consumption control' })}
        <Form.Item
          name='consumptionSettingEnabled'
          valuePropName='checked'
          initialValue={enabled}
          children={<Switch onChange={(v)=>setEnabled(v)}/>}
        />
      </StepsForm.FieldLabel>
      {enabled &&
            <>
              <Form.Item
                name='dataCapacity'
                required={true}
                label={$t({ defaultMessage: 'Max Data Comsumption' })}
              >
                <DataConsumptionSetting
                  unit={unit}
                  capacity={dataCapacity}
                  onUnitChange={(u)=>setUnit(u)}
                  onCapacityChange={(v)=>{setDataCapacity(v)}}
                />
              </Form.Item>

              <Form.Item
                name={'billingCycleRepeat'}
                label={$t({ defaultMessage: 'Consumption Cycle' })}
                required={true}
              >
                <Select
                  placeholder={$t({ defaultMessage: 'Select...' })}
                  options={repeatOptions}
                  value={repeat}
                  onChange={(v)=>setRepeat(v)}
                />
              </Form.Item>

              <Form.Item>
                {repeat &&
                <Form.Item
                  style={{ float: 'left' }}
                  name={'billingCycleType'}
                  label={$t({ defaultMessage: 'Recurring Schedule' })}>
                  <Select
                    placeholder={$t({ defaultMessage: 'Select...' })}
                    value={cycleType}
                    onChange={(v)=>setCycleType(v)}
                    options={cycleTypeOptions}/>
                </Form.Item>}
                {repeat && cycleType === 'CYCLE_NUM_DAYS' &&
                <Form.Item
                  style={{ float: 'left', marginLeft: '5px' }}
                  name={'billingCycleDays'}
                  label={' '}>
                  <InputNumber
                    min={1}
                    value={cycleDay}
                    onChange={(v)=> setCycleDay(v)}
                  />
                  <span style={{ marginLeft: '5px' }}>{$t({ defaultMessage: 'Days' })}</span>
                </Form.Item>}
              </Form.Item>

              <Form.Item
                name='dataCapacityEnforced'
                required={true}
                label={$t({ defaultMessage: 'Action for overage data' })}
                children={
                  <Select placeholder={'Select...'}
                    value={form.getFieldValue('dataCapacityEnforced')}
                    options={dataCapacityEnforcedOptions}
                  />}/>
              <Form.Item/>
              <Form.Item
                name='dataCapacityThreshold'
                required={true}
                label={$t({ defaultMessage: 'Notify when data volume reaches:(%)' })}
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