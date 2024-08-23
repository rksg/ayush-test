import React from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { StepsForm, useLayoutContext } from '@acx-ui/components'

import * as UI from './styledComponents'

function SideNotes (props: React.PropsWithChildren) {
  const { pageHeaderY } = useLayoutContext()
  const { $t } = useIntl()
  return <UI.SideNotes $pageHeaderY={pageHeaderY}>
    <Typography.Title level={4} children={$t({ defaultMessage: 'Side Notes' })} />
    <StepsForm.TextContent children={props.children} />
  </UI.SideNotes>
}

function SideNoteSection (props: React.PropsWithChildren<{ title: React.ReactNode }>) {
  return <>
    <StepsForm.Subtitle children={props.title} />
    <Typography.Paragraph children={props.children} />
  </>
}

SideNotes.Section = SideNoteSection

export { SideNotes }
