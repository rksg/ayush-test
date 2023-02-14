import React from 'react'

import { Statistic }                                            from 'antd'
import _                                                        from 'lodash'
import { IntlShape, MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { noDataSymbol }                from '@acx-ui/analytics/utils'
import { GridCol, TrendPill, Tooltip } from '@acx-ui/components'
import { formatter }                   from '@acx-ui/utils'

import { ConfigStatusEnum, getExecutionSectionData } from '.'

enum StatusBadgeEnum {
  Positive = 'positive',
  Negative = 'negative'
}

interface StatusColumn {
  title: MessageDescriptor,
  format: (value: number, state: ConfigStatusEnum, $t: IntlShape['$t']) => string
  diff: (current: number, previous: number) => number|null
  badgeColor: (value: number) => StatusBadgeEnum
}

export const statusColumns: Record<string, StatusColumn> = {
  passedApsPercent: {
    title: defineMessage({ defaultMessage: 'Test Result' }),
    format: (value: number, state: ConfigStatusEnum) => state === ConfigStatusEnum.NoData
      ? noDataSymbol
      : formatter('percentFormat')(Math.abs(value || 0)),
    diff: (current, previous) => current - previous,
    badgeColor: value => (value > 0) ? StatusBadgeEnum.Positive : StatusBadgeEnum.Negative
  },
  avgPingTime: {
    title: defineMessage({ defaultMessage: 'Average Ping Time' }),
    format: (value: number, state: ConfigStatusEnum, $t: IntlShape['$t']) =>
      state === ConfigStatusEnum.Configured
        ? (value ? formatter('durationFormat')(Math.abs(value)) : noDataSymbol)
        : state === ConfigStatusEnum.NA ? $t({ defaultMessage: 'N/A' }) : noDataSymbol,
    diff: (current, previous) => (current !== 0 && previous !== 0) ? current - previous : null,
    badgeColor: value => (value > 0) ? StatusBadgeEnum.Negative : StatusBadgeEnum.Positive
  },
  avgUpload: {
    title: defineMessage({ defaultMessage: 'Average Upload' }),
    format: (value: number, state: ConfigStatusEnum, $t: IntlShape['$t']) =>
      state === ConfigStatusEnum.Configured
        ? (value ? formatter('networkSpeedFormat')(Math.abs(value)) : noDataSymbol)
        : state === ConfigStatusEnum.NA ? $t({ defaultMessage: 'N/A' }) : noDataSymbol,
    diff: (current, previous) => (current !== 0 && previous !== 0) ? current - previous : null,
    badgeColor: value => (value > 0) ? StatusBadgeEnum.Positive : StatusBadgeEnum.Negative
  },
  avgDownload: {
    title: defineMessage({ defaultMessage: 'Average Download' }),
    format: (value: number, state: ConfigStatusEnum, $t: IntlShape['$t']) =>
      state === ConfigStatusEnum.Configured
        ? (value ? formatter('networkSpeedFormat')(Math.abs(value)) : noDataSymbol)
        : state === ConfigStatusEnum.NA ? $t({ defaultMessage: 'N/A' }) : noDataSymbol,
    diff: (current, previous) => (current !== 0 && previous !== 0) ? current - previous : null,
    badgeColor: value => (value > 0) ? StatusBadgeEnum.Positive : StatusBadgeEnum.Negative
  }
}

export const Status = ( { details }: ReturnType<typeof getExecutionSectionData>) => {
  const { $t } = useIntl()
  return <> {
    Object.keys(statusColumns).map(key => {
      const item = statusColumns[key]
      const [ previous, current ] = _.get(details, key)
      const configured = _.get(details, ['configured', key])
      const diff = item.diff(current, previous) as number
      return <GridCol key={key} col={{ span: 6 }}>
        <Statistic
          title={$t(item.title)}
          value={item.format(current, configured as ConfigStatusEnum, $t)}
          suffix={diff
            ? <Tooltip title={$t({ defaultMessage: 'Compared to previous test' })}>
              <TrendPill
                value={
                  `${(diff > 0) ? '+' : '-'}${item.format(diff, ConfigStatusEnum.Configured, $t)}`}
                trend={item.badgeColor(diff)} />
            </Tooltip>
            : null}
        />
      </GridCol>
    })
  } </>
}
