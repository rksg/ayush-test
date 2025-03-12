/* eslint-disable max-len */
import React, { FormEvent } from 'react'

import { Typography, Form, Input } from 'antd'
import { defineMessage, useIntl }  from 'react-intl'

import { useStepFormContext } from '@acx-ui/components'

import { SideNotes }    from '../../common/SideNotes'
import { IntentDetail } from '../../useIntentDetailsQuery'

export const title = defineMessage({ defaultMessage: 'Benefits' })
export const benefits = defineMessage({ defaultMessage: 'Implementing intelligent PowerSave modes for access points during off-peak hours conserves energy, reduces operational costs, extends the lifespan of hardware, and contributes to a greener environment. This approach achieves significant energy savings with minimum compromise on service quality.' })
export const Introduction: React.FC = () => {
  const { $t } = useIntl()

  return <SideNotes>
    <SideNotes.Section title={$t(title)}>
      <Typography.Paragraph children={$t(benefits)} />
    </SideNotes.Section>
    <SideNotes.Section title={$t({ defaultMessage: 'Resources' })}>
      {/* TODO: Resources */}
    </SideNotes.Section>

  </SideNotes>
}

export const tradeoff = defineMessage({ defaultMessage: 'EcoFlex enabled network will operate in reduced capacity during off peak hours. During this time, Client may experience slower connectivity and less throughput.' })
export const Priority: React.FC = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<IntentDetail>()
  const isEnabled = Form.useWatch(['preferences', 'enable'], form)
  return <SideNotes>
    <SideNotes.Section title={$t({ defaultMessage: 'Industry average power price per kWh' })}>
      <div style={{ display: 'flex' }}>
        <Form.Item
          style={{ width: 60 }}
          validateFirst
          name={['averagePowerPrice', 'currency']}
          rules={[
            { required: true, message: $t({ defaultMessage: 'Please enter currency' }) },
            { max: 3 },
            { pattern: /^[A-Za-z]+$/, message: $t({ defaultMessage: 'Only letters allowed' }) }
          ]}
          children={<Input
            onInput={// istanbul ignore next
              (e: FormEvent<HTMLInputElement> & { target: { value: string } }) =>
                e.target.value = e.target.value.toUpperCase()
            }
            disabled={!isEnabled}
          />}
          validateTrigger={'onBlur'}

        />
        <Form.Item
          style={{ marginLeft: 5 }}
          validateFirst
          name={['averagePowerPrice', 'value']}
          rules={[
            { required: true, message: $t({ defaultMessage: 'Currency value is required' }) },
            {
              pattern: /^([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/,
              message: $t({ defaultMessage: 'Only positve numeric values allowed' })
            }
          ]}
          children={<Input disabled={!isEnabled}/>}
          validateTrigger={'onBlur'}
        />
      </div>
    </SideNotes.Section>
    <SideNotes.Section title={$t({ defaultMessage: 'Potential trade-off' })}>
      <Typography.Paragraph children={$t(tradeoff)} />
    </SideNotes.Section>
  </SideNotes>
}
