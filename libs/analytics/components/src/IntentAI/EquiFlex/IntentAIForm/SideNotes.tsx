/* eslint-disable max-len */
import React from 'react'

import { Typography }             from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { SideNotes }  from '../../common/SideNotes'
import { AiFeatures } from '../../config'
import ResourcesLinks from '../../ResourcesLinks'

export const title = defineMessage({ defaultMessage: 'Benefits' })
export const benefits = defineMessage({ defaultMessage: 'EquiFlex\'s ML based probe responses in Wi-Fi network, dynamically manage how access points respond to connection requests, reducing unnecessary management traffic. This enhances efficiency, decreases congestion, and improves overall network performance. By minimizing redundant responses, the network operates more smoothly, providing faster, more secure connections and better resource allocation, leading to an improved user experience.' })
export const Introduction: React.FC = () => {
  const { $t } = useIntl()

  return (
    <SideNotes>
      <SideNotes.Section title={$t(title)}>
        <Typography.Paragraph children={$t(benefits)} />
      </SideNotes.Section>
      <SideNotes.Section title={$t({ defaultMessage: 'Resources' })}>
        <Typography.Paragraph
          children={<ResourcesLinks feature={AiFeatures.EquiFlex} />}
        />
      </SideNotes.Section>
    </SideNotes>
  )
}

export const tradeoff = defineMessage({ defaultMessage: 'Potential trade-offs of intelligent and optimized probe responses include increased complexity in network management, potential delays in connecting lesser-priority devices, and possible issues with compatibility across different devices and manufacturers.' })
export const Priority: React.FC = () => {
  const { $t } = useIntl()
  return <SideNotes>
    <SideNotes.Section title={$t({ defaultMessage: 'Potential trade-off' })}>
      <Typography.Paragraph children={$t(tradeoff)} />
    </SideNotes.Section>
  </SideNotes>
}
