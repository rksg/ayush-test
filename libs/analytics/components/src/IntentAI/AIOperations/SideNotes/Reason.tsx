import { ReactNode } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { SideNotes } from '../../common/SideNotes'

export const Reason = (props: {
  reasonText?: ReactNode
  resources?: ReactNode
}) => {
  const { $t } = useIntl()
  return (
    <SideNotes>
      {props.reasonText && (
        <SideNotes.Section title={$t({ defaultMessage: 'Benefits' })}>
          <Typography.Paragraph children={props.reasonText} />
        </SideNotes.Section>
      )}
      {props.resources && (
        <SideNotes.Section title={$t({ defaultMessage: 'Resources' })}>
          <Typography.Paragraph children={props.resources} />
        </SideNotes.Section>
      )}
    </SideNotes>
  )
}
