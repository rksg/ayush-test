import { ReactNode } from 'react'

import { ComponentStory } from '@storybook/react'

import { StepsForm } from '@acx-ui/components'

import { TradeOff, TradeOffProps } from '.'

const story = {
  title: 'TradeOff',
  component: TradeOff
}

export default story

const Template: ComponentStory<typeof TradeOff> = (props: TradeOffProps) => {
  return (
    <StepsForm>
      <StepsForm.StepForm>
        <TradeOff {...props} />
      </StepsForm.StepForm>
    </StepsForm>
  )
}

const Column1:ReactNode = (<div style={{ flexDirection: 'column' }}>
  <div>
    <label style={{ fontWeight: 600 }}>Full Optimization</label>
  </div>
  <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '6px' }}>
    <span>Ap:Radio Channel</span>
    <span>Ap:Radio Channel Width</span>
    <span>Ap:Radio Channel Power</span>
    <span>Zone:Radio Channel Range</span>
  </div>
</div>)

const Column2:ReactNode = (<div style={{ flexDirection: 'column' }}>
  <div>
    <label style={{ fontWeight: 600 }}>Partial Optimization</label>
  </div>
  <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '6px' }}>
    <span>Ap:Radio Channel</span>
    <span>Ap:Radio Channel Width</span>
    <span>Ap:Radio Channel Power</span>
    <span>Zone:Radio Channel Range</span>
  </div>
  <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '6px', marginTop: '6px' }}>
    <span>IntentAI will not change Transmit Power</span>
  </div>
</div>)

export const Default = Template.bind({})
Default.args = {
  key: 'tradeOff',
  name: 'tradeOff',
  headers: ['Intent Trade-off', 'AI Driven - Configuration change'],
  radios: [
    {
      key: 'value1',
      value: 'value1',
      children: 'Maximize client density - simultaneous connected clients (Default)',
      columns: ['Maximize client density - simultaneous connected clients (Default)', Column1]
    },
    {
      key: 'value2',
      value: 'value2',
      children: 'Maximize client throughput',
      columns: ['Maximize client throughput1', Column2]
    },
    {
      key: 'value3',
      value: 'value3',
      children: 'Lable3',
      columns: ['Row5', 'Row6'] }
  ]
}