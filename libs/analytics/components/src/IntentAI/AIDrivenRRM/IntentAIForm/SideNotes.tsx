import React from 'react'

import { Space, Typography }         from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { useStepFormContext }              from '@acx-ui/components'
import { LinkDocumentIcon, LinkVideoIcon } from '@acx-ui/icons'

import { richTextFormatValues } from '../../common/richTextFormatValues'
import { SideNotes }            from '../../common/SideNotes'
import { useIntentContext }     from '../../IntentContext'
import { IntentDetail }         from '../../useIntentDetailsQuery'
import { useDownloadData }      from '../RRMGraph/DownloadRRMComparison'

import {
  Priority as PriorityPage,
  priorities
} from './Priority'


export const Introduction: React.FC = () => {
  const { $t } = useIntl()
  const benefits = $t({ defaultMessage: `Low interference fosters improved throughput, lower
    latency, better signal quality, stable connections, enhanced user experience, longer battery
    life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading
    to higher data rates, higher SNR, consistent performance, and balanced network load.` })
  const linkProps = { target: '_blank', rel: 'noreferrer' }
  const resources = [
    {
      icon: <LinkVideoIcon />,
      label: $t({ defaultMessage: 'RUCKUS AI - AI-Driven RRM Demo' }),
      link: 'https://www.youtube.com/playlist?list=PLySwoo7u9-KJeAI4VY_2ha4r9tjnqE3Zi'
    },
    {
      icon: <LinkDocumentIcon />,
      label: $t({ defaultMessage: 'RUCKUS AI User Guide' }),
      // eslint-disable-next-line max-len
      link: 'https://docs.commscope.com/bundle/ruckusai-userguide/page/GUID-5D18D735-6D9A-4847-9C6F-8F5091F9B171.html'
    }
  ].map((item, index) => (
    <a {...linkProps} href={item.link} key={`resources-${index}`} target='_blank' rel='noreferrer'>
      <Space>{item.icon}{item.label}</Space>
    </a>
  ))
  return <SideNotes>
    <SideNotes.Section title={$t({ defaultMessage: 'Benefits' })}>
      <Typography.Paragraph children={benefits} />
    </SideNotes.Section>
    <SideNotes.Section title={$t({ defaultMessage: 'Resources' })}>
      <Typography.Paragraph children={resources} />
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
  const { form } = useStepFormContext<IntentDetail>()
  const { intent, state } = useIntentContext()
  const isFullOptimization = form.getFieldValue(PriorityPage.fieldName)
  const priority = isFullOptimization ? priorities.full : priorities.partial
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
    <SideNotes.Section
      title={priority.title}
      children={priority.content}
    />
    {state !== 'no-data' && (
      <SideNotes.Section title={$t({ defaultMessage: 'Resources' })}>
        <Typography.Paragraph children={resources} />
      </SideNotes.Section>
    )}
  </SideNotes>
}
