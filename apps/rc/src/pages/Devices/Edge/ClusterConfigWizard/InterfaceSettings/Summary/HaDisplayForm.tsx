import { Form }    from 'antd'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Subtitle }                                                         from '@acx-ui/components'
import { ClusterHaFallbackScheduleTypeEnum, ClusterHaLoadDistributionEnum } from '@acx-ui/rc/utils'
import { getIntl }                                                          from '@acx-ui/utils'

import { dayOfWeek, loadDistributions } from '../../utils'

interface HaDisplayFormProps {
  fallbackEnable?: boolean
  fallbackScheduleType?: ClusterHaFallbackScheduleTypeEnum
  fallbackScheduleTime?: Date
  fallbackScheduleWeekday?: string
  fallbackScheduleIntervalHours?: string
  loadDistribution?: ClusterHaLoadDistributionEnum
}

export const HaDisplayForm = (props: HaDisplayFormProps) => {
  const {
    fallbackEnable,
    fallbackScheduleType,
    fallbackScheduleTime,
    fallbackScheduleWeekday,
    fallbackScheduleIntervalHours,
    loadDistribution
  } = props
  const { $t } = useIntl()

  return (
    <>
      <Subtitle level={4}>
        { $t({ defaultMessage: 'HA Settings' }) }
      </Subtitle>
      {
        <>
          <Form.Item
            label={$t({ defaultMessage: 'RUCKUS Edge Fallback' })}
          >
            {
              fallbackEnable ?
                $t({ defaultMessage: 'On' }) :
                $t({ defaultMessage: 'Off' })
            }
          </Form.Item>
          {
            fallbackEnable &&
            <Form.Item
              label={$t({ defaultMessage: 'Fallback Schedule' })}
            >
              {
                getFallbackScheduleStr(
                  fallbackScheduleType,
                  fallbackScheduleTime,
                  fallbackScheduleWeekday,
                  fallbackScheduleIntervalHours
                )
              }
            </Form.Item>
          }
        </>
      }
      <Form.Item
        label={$t({ defaultMessage: 'Load Distribution' })}
      >
        {loadDistribution ? $t(loadDistributions[loadDistribution]) : ''}
      </Form.Item>
    </>
  )
}

const getFallbackScheduleStr = (
  fallbackScheduleType?: ClusterHaFallbackScheduleTypeEnum,
  fallbackScheduleTime?: Date,
  fallbackScheduleWeekday?: string,
  fallbackScheduleIntervalHours?: string
) => {
  const { $t } = getIntl()
  const result = []

  switch(fallbackScheduleType) {
    case ClusterHaFallbackScheduleTypeEnum.DAILY:
      result.push($t({ defaultMessage: 'Everyday' }))
      result.push($t({ defaultMessage: 'at' }))
      result.push(moment(fallbackScheduleTime).format('HH:mm'))
      break
    case ClusterHaFallbackScheduleTypeEnum.WEEKLY:
      result.push($t({ defaultMessage: 'Every' }))
      if(fallbackScheduleWeekday) {
        result.push($t(dayOfWeek[fallbackScheduleWeekday as keyof typeof dayOfWeek]))
      }
      result.push($t({ defaultMessage: 'at' }))
      result.push(moment(fallbackScheduleTime).format('HH:mm'))
      break
    case ClusterHaFallbackScheduleTypeEnum.INTERVAL:
      result.push($t({ defaultMessage: 'Every' }))
      result.push(fallbackScheduleIntervalHours)
      result.push($t({ defaultMessage: 'hours' }))
      break
  }

  return result.filter(item => item).join(' ')
}