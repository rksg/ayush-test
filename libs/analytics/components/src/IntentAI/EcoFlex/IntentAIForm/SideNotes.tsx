/* eslint-disable max-len */
import React from 'react'

import { Typography }             from 'antd'
import { defineMessage, useIntl } from 'react-intl'


import { SideNotes } from '../../common/SideNotes'

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

export const recommendationTitle = defineMessage({ defaultMessage: 'Why this recommendation?' })
export const recommendationNote = defineMessage({ defaultMessage: 'This recommendation aims to reduce power consumption in RUCKUS WIFI systems during off-peak hours, conserving energy and reducing costs while maintaining essential connectivity for clients.' })

export const tradeoffTitle = defineMessage({ defaultMessage: 'Potential trade-off' })
export const tradeoff = defineMessage({ defaultMessage: 'Energy Saving enabled network will operate in reduced capacity during off peak hours. During this time, Client may experience slower connectivity and less throughput.' })
export const Priority: React.FC = () => {
  const { $t } = useIntl()
  return <SideNotes>
    <SideNotes.Section title={$t(tradeoffTitle)}>
      <Typography.Paragraph children={$t(tradeoff)} />
    </SideNotes.Section>
  </SideNotes>
}
