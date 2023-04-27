import { useRef } from 'react'

import { Divider }                    from 'antd'
import { TextAreaRef }                from 'antd/lib/input/TextArea'
import { MessageDescriptor, useIntl } from 'react-intl'

import { Drawer, Descriptions, Timeline, TimelineItem } from '@acx-ui/components'
import { Activity }                                     from '@acx-ui/rc/utils'
import { noDataDisplay }                                from '@acx-ui/utils'

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

  const FailureArea = (item: TimelineItem, error: string) => (
    <>
      <UI.FailureTextArea
        ref={inputEl}
        rows={20}
        readOnly={true}
        value={JSON.stringify(error, null, 2)}
      />
      <UI.CopyButton
        type='link'
        onClick={() => copyText(item.error!)}
      >{$t({ defaultMessage: 'Copy to clipboard' })}</UI.CopyButton>
    </>
  )

  const activityErrorDetails = props.activity?.steps.map(step => {
    if (step.status !== 'FAIL' || !step.error) {
      return step
    }
    const parsedError = JSON.parse(step.error!)
    return {
      ...step,
      children: FailureArea(step, parsedError)
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
