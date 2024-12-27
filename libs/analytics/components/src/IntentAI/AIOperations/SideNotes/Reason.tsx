import { Space, Typography }          from 'antd'
import { MessageDescriptor, useIntl } from 'react-intl'

import { LinkDocumentIcon, LinkVideoIcon } from '@acx-ui/icons'

import { SideNotes } from '../../common/SideNotes'

const icons = {
  video: <LinkVideoIcon />,
  document: <LinkDocumentIcon />
}

export const Reason = (props: {
  reasonText?: React.ReactNode
  resources?: Array<{
    icon: 'video' | 'document'
    link: string
    label: MessageDescriptor
  }>
}) => {
  const { $t } = useIntl()
  const linkProps = { target: '_blank', rel: 'noreferrer' }
  const resources = props.resources?.map((item, index) => (
    <a {...linkProps} href={item.link} key={`resources-${index}`} target='_blank' rel='noreferrer'>
      <Space>{icons[item.icon]}{$t(item.label)}</Space>
    </a>
  ))
  return <SideNotes>
    { props.reasonText &&
    (<SideNotes.Section title={$t({ defaultMessage: 'Benefits' })}>
      <Typography.Paragraph children={props.reasonText} />
    </SideNotes.Section>)}
    {props.resources?.length && (
      <SideNotes.Section title={$t({ defaultMessage: 'Resources' })}>
        <Typography.Paragraph children={resources} />
      </SideNotes.Section>)}
  </SideNotes>
}
