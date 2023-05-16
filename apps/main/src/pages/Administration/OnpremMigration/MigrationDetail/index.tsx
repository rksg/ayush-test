import { Divider } from 'antd'
import { useIntl } from 'react-intl'

import {
  Descriptions
} from '@acx-ui/components'
import {
  formatter,
  DateFormatEnum
} from '@acx-ui/formatter'
import {
  TaskContextType
} from '@acx-ui/rc/utils'

// import * as UI from '../styledComponents'

interface GuestDetailsDrawerProps {
  currentTask: TaskContextType,
  triggerClose: () => void
}


export const GuestsDetail= (props: GuestDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { currentTask } = props

  return (<>
    <Descriptions>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Bak File' })}
        children={currentTask.fileName ?? '--'} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Start Time' })}
        // eslint-disable-next-line max-len
        children={currentTask.createTime ? formatter(DateFormatEnum.DateTimeFormat)(currentTask.createTime) : '--'} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'End Time' })}
        children={'--'} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'State' })}
        children={currentTask.state ?? '--'} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Venue' })}
        children={'--'} />
    </Descriptions>

    <Divider />

    <Descriptions>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Unsupported model' })}
        children={'--'} />
    </Descriptions>

    <Divider />

    <Descriptions>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Duplicated in tenant' })}
        children={'--'} />
    </Descriptions>

  </>)
}
