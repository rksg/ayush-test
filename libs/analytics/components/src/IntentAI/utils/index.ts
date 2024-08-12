import moment            from 'moment-timezone'
import { defineMessage } from 'react-intl'

import { get } from '@acx-ui/config'

export const isDataRetained = (time?: string) => {
  const retainDate = moment().startOf('day').subtract(get('DRUID_RETAIN_PERIOD_DAYS'), 'days')
  return moment(time).isAfter(retainDate)
}

export const dataRetentionText = defineMessage({ defaultMessage: 'Beyond data retention period' })
