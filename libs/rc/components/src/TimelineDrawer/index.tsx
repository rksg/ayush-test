import { Form }                       from 'antd'
import { MessageDescriptor, useIntl } from 'react-intl'

import { noDataSymbol } from '@acx-ui/analytics/utils'
import { Drawer }       from '@acx-ui/components'

export interface DrawerProps {
  title: MessageDescriptor
  visible: boolean
  onClose: () => void
  data: { title: MessageDescriptor, value: string | JSX.Element }[]
  onBackClick?: () => void
  width?: number
}

export const TimelineDrawer = (props: DrawerProps) => {
  const { $t } = useIntl()
  return <Drawer
    title={$t(props.title)}
    visible={props.visible}
    onClose={props.onClose}
    children={<Form labelCol={{ span: 10 }} labelAlign='left'>{
      props.data.map(({ title, value }, i) => <Form.Item
        key={i}
        label={$t(title)}
        children={value || noDataSymbol}
      />)
    }</Form>}
    onBackClick={props.onBackClick}
    width={props.width}
  />
}
