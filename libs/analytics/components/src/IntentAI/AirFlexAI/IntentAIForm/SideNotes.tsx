import React from 'react'

import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { useStepFormContext }              from '@acx-ui/components'
import { LinkDocumentIcon, LinkVideoIcon } from '@acx-ui/icons'

import { SideNotes } from '../../common/SideNotes'
import { Intent }    from '../../useIntentDetailsQuery'

import { Priority as PriorityPage } from './Priority'

export const Introduction: React.FC = () => {
  const { $t } = useIntl()
  const benefits = $t({ defaultMessage: 'AirFlexAI\'s ML based probe responses in Wi-Fi network, dynamically manage how access points respond to connection requests, reducing unnecessary management traffic. This enhances efficiency, decreases congestion, and improves overall network performance. By minimizing redundant responses, the network operates more smoothly, providing faster, more secure connections and better resource allocation, leading to an improved user experience.' })

  return <SideNotes>
    <SideNotes.Section title={$t({ defaultMessage: 'Benefits' })}>
      <Typography.Paragraph children={benefits} />
    </SideNotes.Section>

  </SideNotes>
}

export const Priority: React.FC = () => {
  const { $t } = useIntl()
  const tradeoff = $t({ defaultMessage: 'Potential trade-offs of intelligent and optimized probe responses include increased complexity in network management, potential delays in connecting lesser-priority devices, and possible issues with compatibility across different devices and manufacturers.' })
  return <SideNotes>
    <SideNotes.Section title={$t({ defaultMessage: 'Potential trade-off' })}>
      <Typography.Paragraph children={tradeoff} />
    </SideNotes.Section>
  </SideNotes>
}
