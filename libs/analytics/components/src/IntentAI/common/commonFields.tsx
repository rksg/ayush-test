import { TooltipPlacement } from 'antd/es/tooltip'
import moment               from 'moment-timezone'
import { useIntl }          from 'react-intl'

import { formattedPath }             from '@acx-ui/analytics/utils'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { codes }             from '../config'
import { getStatusTooltip }  from '../services'
import { Statuses }          from '../states'
import { type IntentDetail } from '../useIntentDetailsQuery'

import { getIntentStatus } from './getIntentStatus'


export const useCommonFields = (intent: IntentDetail) => {
  const { $t } = useIntl()
  const { code, path, sliceValue, metadata, updatedAt, displayStatus } = intent

  return [
    {
      label: $t({ defaultMessage: 'Intent' }),
      children: $t(codes[code].intent)
    },
    {
      label: $t({ defaultMessage: 'Category' }),
      children: $t(codes[code].category)
    },
    {
      label: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      children: sliceValue,
      tooltip: formattedPath(path, sliceValue),
      tooltipPlacement: 'right' as TooltipPlacement
    },
    {
      label: $t({ defaultMessage: 'Status' }),
      children: getIntentStatus(displayStatus),
      tooltip: getStatusTooltip(displayStatus, sliceValue, { ...metadata, updatedAt }),
      tooltipPlacement: 'right' as TooltipPlacement
    },
    {
      label: $t({ defaultMessage: 'Date' }),
      children: formatter(DateFormatEnum.DateTimeFormat)(moment(updatedAt))
    },
    ...[
      Statuses.scheduled,
      Statuses.applyScheduled,
      Statuses.revertScheduled
    ].includes(intent.status)
      ? [{
        label: $t({ defaultMessage: 'Scheduled Date' }),
        children: formatter(DateFormatEnum.DateTimeFormat)(moment(metadata.scheduledAt))
      }]
      : [],
    ...(metadata.changedByName && metadata.preferencesUpdatedAt
      ? [{
        label: $t({ defaultMessage: 'Last Updated By' }),
        children: `${
          metadata.changedByName
        } on ${formatter(DateFormatEnum.DateTimeFormat)(
          moment(metadata.preferencesUpdatedAt)
        )}`
      }]
      : [])
  ]
}
