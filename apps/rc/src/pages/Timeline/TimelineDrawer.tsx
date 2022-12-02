import { Descriptions }               from 'antd'
import { MessageDescriptor, useIntl } from 'react-intl'

import { noDataSymbol } from '@acx-ui/analytics/utils'
import { Drawer }       from '@acx-ui/components'

export interface DrawerProps {
  title: MessageDescriptor
  visible: boolean
  onClose: () => void
  data: { title: MessageDescriptor, value: string }[]
}

export const TimelineDrawer = (props: DrawerProps) => {
  const { $t } = useIntl()
  return <Drawer
    title={$t(props.title)}
    visible={props.visible}
    onClose={props.onClose}
    children={<Descriptions column={1}>{
      props.data
        .map(({ title, value })=>
          <Descriptions.Item label={$t(title)}>{value||noDataSymbol}</Descriptions.Item>
        )
    }</Descriptions>}
  />
}
