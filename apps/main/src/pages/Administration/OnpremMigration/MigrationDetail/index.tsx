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
import { TenantLink } from '@acx-ui/react-router-dom'

// import * as UI from '../styledComponents'

interface GuestDetailsDrawerProps {
  currentTask: TaskContextType,
  triggerClose: () => void
}


export const GuestsDetail= (props: GuestDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { currentTask } = props

  return (
    <Descriptions>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Backup File' })}
        children={currentTask.fileName ?? '--'} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Start Time' })}
        // eslint-disable-next-line max-len
        children={currentTask.createTime ? formatter(DateFormatEnum.DateTimeFormat)(currentTask.createTime) : '--'} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'End Time' })}
        // eslint-disable-next-line max-len
        children={currentTask.completedTime ? formatter(DateFormatEnum.DateTimeFormat)(currentTask.completedTime) : '--'} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'State' })}
        children={currentTask.state ?? '--'} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Error Message' })}
        children={currentTask.errorMessage ?? '--'} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Venue' })}
        children={currentTask.venueName ?? '--'} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Description' })}
        children={currentTask.description ?? '--'} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Migrartion Summary' })}
        children={
          <TenantLink to={`/administration/onpremMigration/${currentTask.taskId}/summary`}>
            { $t({ defaultMessage: 'summary' }) }
          </TenantLink>
        }
      />
    </Descriptions>
  )
}
