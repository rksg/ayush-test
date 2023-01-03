import { MessageDescriptor, useIntl } from 'react-intl'

import { noDataSymbol }         from '@acx-ui/analytics/utils'
import { Drawer, Descriptions } from '@acx-ui/components'

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
    onBackClick={props.onBackClick}
    width={props.width}
    children={<Descriptions>{
      props.data.map(({ title, value }, i) => <Descriptions.Item
        key={i}
        label={$t(title)}
        children={value || noDataSymbol}
      />)
    }</Descriptions>}
  />
}
