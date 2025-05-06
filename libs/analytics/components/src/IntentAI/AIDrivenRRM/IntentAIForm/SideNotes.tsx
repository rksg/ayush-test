import React from 'react'

import { Space, Typography }         from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { LinkDocumentIcon } from '@acx-ui/icons'

import { richTextFormatValues } from '../../common/richTextFormatValues'
import { SideNotes }            from '../../common/SideNotes'
import { AiFeatures }           from '../../config'
import { useIntentContext }     from '../../IntentContext'
import ResourcesLinks           from '../../ResourcesLinks'
import { useDownloadData }      from '../RRMGraph/DownloadRRMComparison'

export const Introduction: React.FC = () => {
  const { $t } = useIntl()
  const benefits = $t({ defaultMessage: `Low interference fosters improved throughput, lower
    latency, better signal quality, stable connections, enhanced user experience, longer battery
    life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading
    to higher data rates, higher SNR, consistent performance, and balanced network load.` })
  return <SideNotes>
    <SideNotes.Section title={$t({ defaultMessage: 'Benefits' })}>
      <Typography.Paragraph children={benefits} />
    </SideNotes.Section>
    <SideNotes.Section title={$t({ defaultMessage: 'Resources' })}>
      <Typography.Paragraph children={<ResourcesLinks feature={AiFeatures.RRM} />} />
    </SideNotes.Section>
  </SideNotes>
}

export const Priority: React.FC = () => {
  const { $t } = useIntl()
  return <SideNotes>
    <SideNotes.Section title={$t({ defaultMessage: 'Potential trade-off' })}>
      <FormattedMessage
        values={richTextFormatValues}
        defaultMessage={`<p>
          In the quest for minimizing interference between access points (APs), AI algorithms may
          opt to narrow channel widths. While this can enhance spectral efficiency and alleviate
          congestion, it also heightens vulnerability to noise, potentially reducing throughput.
          Narrow channels limit data capacity, which could lower overall throughput.
        </p>`}
      />
    </SideNotes.Section>
  </SideNotes>
}

export const Summary: React.FC = () => {
  const { $t } = useIntl()
  const { intent, state } = useIntentContext()
  const { url, filename } = useDownloadData(intent)

  const resources = [
    {
      icon: <LinkDocumentIcon />,
      label: $t({ defaultMessage: 'Download channel plan' }),
      link: url,
      download: filename
    }
  ].map((item, index) => (
    <a
      href={item.link}
      key={`resources-${index}`}
      target='_blank'
      rel='noreferrer'
      download={item.download}
    >
      <Space>{item.icon}{item.label}</Space>
    </a>
  ))

  return <SideNotes>
    {state !== 'no-data' && (
      <SideNotes.Section title={$t({ defaultMessage: 'Resources' })}>
        <Typography.Paragraph children={resources} />
      </SideNotes.Section>
    )}
  </SideNotes>
}
