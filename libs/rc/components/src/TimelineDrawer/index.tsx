import { useRef } from 'react'

import { Divider }                    from 'antd'
import { TextAreaRef }                from 'antd/lib/input/TextArea'
import { MessageDescriptor, useIntl } from 'react-intl'

import { Drawer, Descriptions, Timeline } from '@acx-ui/components'
import { Activity }                       from '@acx-ui/rc/utils'
import { noDataDisplay }                  from '@acx-ui/utils'

import * as UI from './styledComponents'

export interface DrawerProps {
  title: MessageDescriptor
  visible: boolean
  onClose: () => void
  data: { title: MessageDescriptor, value: string | JSX.Element }[]
  onBackClick?: () => void
  width?: number
  activity?: Activity
}

export const TimelineDrawer = (props: DrawerProps) => {
  const { $t } = useIntl()
  const inputEl = useRef<TextAreaRef>(null)

  const copyText = (error: string) => {
    navigator.clipboard.writeText(JSON.stringify(JSON.parse(error), null, 2))
    inputEl.current?.resizableTextArea?.textArea.select()
  }

  const activityErrorDetails = props.activity?.steps.map(i => {
    if (i.status !== 'FAIL' || !i.error) {
      return i
    }
    const parsedError = JSON.parse(i.error!)

    return {
      ...i,
      children: <>
        <UI.FailureTextArea
          ref={inputEl}
          rows={20}
          readOnly={true}
          value={JSON.stringify(parsedError, null, 2)}
        />
        <UI.CopyButton
          type='link'
          onClick={() => copyText(i.error!)}
        >{$t({ defaultMessage: 'Copy to clipboard' })}</UI.CopyButton>
      </>
    }
  })

  return <Drawer
    title={$t(props.title)}
    visible={props.visible}
    onClose={props.onClose}
    onBackClick={props.onBackClick}
    width={props.width}
    children={<>
      <Descriptions>{
        props.data.map(({ title, value }, i) => <Descriptions.Item
          key={i}
          label={$t(title)}
          children={value || noDataDisplay}
        />)
      }</Descriptions>
      {props.activity?.steps && props.activity?.steps.length > 0 && <>
        <Divider/>
        <Timeline items={activityErrorDetails ?? []} status={props.activity?.status}/>
      </>}
    </>}
  />
}
