/* eslint-disable max-len */
import React from 'react'

import { Typography }             from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { SideNotes } from '../../common/SideNotes'

export const title = defineMessage({ defaultMessage: 'Why is the recommendation?' })
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
  return <SideNotes>
    <SideNotes.Section title={$t({ defaultMessage: 'Industry average power prices per kWh' })}>
      {/* TODO: prices */}
    </SideNotes.Section>
    <SideNotes.Section title={$t({ defaultMessage: 'Potential trade-off' })}>
      <Typography.Paragraph children={$t(tradeoff)} />
    </SideNotes.Section>
  </SideNotes>
}
