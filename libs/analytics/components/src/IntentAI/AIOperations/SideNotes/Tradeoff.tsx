import React from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { SideNotes } from '../../common/SideNotes'

export const Tradeoff = (props: { tradeoffText: JSX.Element }) => {
  const { $t } = useIntl()
  return <SideNotes>
    <SideNotes.Section title={$t({ defaultMessage: 'Potential trade-off' })}>
      <Typography.Paragraph children={props.tradeoffText} />
    </SideNotes.Section>
  </SideNotes>
}
