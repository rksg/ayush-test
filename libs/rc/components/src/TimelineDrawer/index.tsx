import { Divider }                    from 'antd'
import { MessageDescriptor, useIntl } from 'react-intl'

import { noDataSymbol }                                 from '@acx-ui/analytics/utils'
import { Drawer, Descriptions, Timeline, TimelineItem } from '@acx-ui/components'

export interface DrawerProps {
  title: MessageDescriptor
  visible: boolean
  onClose: () => void
  data: { title: MessageDescriptor, value: string | JSX.Element }[]
  onBackClick?: () => void
  width?: number
  timeLine?: TimelineItem[]
}

export const TimelineDrawer = (props: DrawerProps) => {
  const { $t } = useIntl()
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
          children={value || noDataSymbol}
        />)
      }</Descriptions>
      {props.timeLine && props.timeLine.length > 0 && <>
        <Divider/>
        <Timeline items={props.timeLine}/>
      </>}
    </>}
  />
}
