import React from 'react'

import { Statistic }                                            from 'antd'
import _                                                        from 'lodash'
import { IntlShape, MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { TrendTypeEnum }    from '@acx-ui/analytics/utils'
import { GridCol, Tooltip } from '@acx-ui/components'
import { formatter }        from '@acx-ui/formatter'
import { noDataDisplay }    from '@acx-ui/utils'

import { Pill } from './styledComponents'

import { ConfigStatusEnum, getExecutionSectionData } from '.'

interface StatusColumn {
  title: MessageDescriptor,
  format: (
    value: number | undefined, state: ConfigStatusEnum, $t: IntlShape['$t']
  ) => string
  diff: (
    current: number | undefined, previous: number | undefined
  ) => number|null
  badgeColor: (value: number) => TrendTypeEnum
}

export const statusColumns: Record<string, StatusColumn> = {
  passedApsPercent: {
    title: defineMessage({ defaultMessage: 'Test Result' }),
    format: (value, state) => state === ConfigStatusEnum.NoData
      ? noDataDisplay
      : formatter('percentFormat')(Math.abs(value || 0)),
    diff: (current, previous) => current! - previous!,
    badgeColor: value => (value > 0) ? TrendTypeEnum.Positive : TrendTypeEnum.Negative
  },
  avgPingTime: {
    title: defineMessage({ defaultMessage: 'Average Ping Time' }),
    format: (value, state, $t) => state === ConfigStatusEnum.Configured
      ? (value ? formatter('durationFormat')(Math.abs(value)) : noDataDisplay)
      : state === ConfigStatusEnum.NA ? $t({ defaultMessage: 'N/A' }) : noDataDisplay,
    diff: (current, previous) => (current !== 0 && previous !== 0) ? current! - previous! : null,
    badgeColor: value => (value > 0) ? TrendTypeEnum.Negative : TrendTypeEnum.Positive
  },
  avgUpload: {
    title: defineMessage({ defaultMessage: 'Average Upload' }),
    format: (value, state, $t) => state === ConfigStatusEnum.Configured
      ? (value ? formatter('networkSpeedFormat')(Math.abs(value)) : noDataDisplay)
      : state === ConfigStatusEnum.NA ? $t({ defaultMessage: 'N/A' }) : noDataDisplay,
    diff: (current, previous) => (current !== 0 && previous !== 0) ? current! - previous! : null,
    badgeColor: value => (value > 0) ? TrendTypeEnum.Positive : TrendTypeEnum.Negative
  },
  avgDownload: {
    title: defineMessage({ defaultMessage: 'Average Download' }),
    format: (value, state, $t) => state === ConfigStatusEnum.Configured
      ? (value ? formatter('networkSpeedFormat')(Math.abs(value)) : noDataDisplay)
      : state === ConfigStatusEnum.NA ? $t({ defaultMessage: 'N/A' }) : noDataDisplay,
    diff: (current, previous) => (current !== 0 && previous !== 0) ? current! - previous! : null,
    badgeColor: value => (value > 0) ? TrendTypeEnum.Positive : TrendTypeEnum.Negative
  }
}

export interface StatusBlockProps {
  field: string
  values: [number | undefined, number | undefined]
  configured: ConfigStatusEnum
}

export const StatusBlock = ({ field, values, configured }: StatusBlockProps) => {
  const { $t } = useIntl()
  const item = statusColumns[field]
  const [ previous, current ] = values
  const diff = item.diff(current, previous) as number
  return <GridCol key={field} col={{ span: 6 }}>
    <Statistic
      title={$t(item.title)}
      value={item.format(current, configured as ConfigStatusEnum, $t)}
      suffix={diff
        ? <Tooltip title={$t({ defaultMessage: 'Compared to previous test' })}>
          <Pill
            value={
              `${(diff > 0) ? '+' : '-'}${item.format(diff, ConfigStatusEnum.Configured, $t)}`}
            trend={item.badgeColor(diff)} />
        </Tooltip>
        : null}
    />
  </GridCol>
}

export const Status = ({ details } : { details: ReturnType<typeof getExecutionSectionData> }) => <>{
  Object.keys(statusColumns).map(field =>
    <StatusBlock
      key={field}
      field={field}
      values={_.get(details, field)}
      configured={_.get(details, ['configured', field])}/>
  )}</>
