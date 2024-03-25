import { useCallback, useMemo, useRef } from 'react'

import { Divider }                from 'antd'
import _                          from 'lodash'
import moment, { Moment }         from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { DateTimePicker, Tooltip, showToast } from '@acx-ui/components'
import { get }                                from '@acx-ui/config'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }          from '@acx-ui/formatter'
import {
  CalendarOutlined,
  CancelCircleOutlined,
  CancelCircleSolid,
  CheckMarkCircleOutline
} from '@acx-ui/icons'

import {
  Recommendation,
  RecommendationListItem,
  useCancelRecommendationMutation,
  useScheduleRecommendationMutation
} from '../services'

import * as UI from './styledComponents'

// eslint-disable-next-line max-len
const applyFooterMsg = defineMessage({ defaultMessage: 'This recommendation will be applied at the chosen time whenever there is a need to change the channel plan. Schedule a time during off-hours when the number of WiFi clients is at the minimum.' })

const actionTooltip = {
  Apply: {
    text: defineMessage({ defaultMessage: 'Apply' }),
    icon: <CheckMarkCircleOutline />
  },
  Revert: {
    text: defineMessage({ defaultMessage: 'Revert' }),
    icon: <UI.RevertIcon />
  },
  ApplyScheduled: {
    text: defineMessage({ defaultMessage: 'Edit schedule' }),
    icon: <CalendarOutlined />
  },
  RevertScheduled: {
    text: defineMessage({ defaultMessage: 'Edit schedule' }),
    icon: <CalendarOutlined />
  }
}

function getFutureTime (value: Moment) {
  const bufferedTime = value.clone().add(15, 'minutes')
  const remainder = 15 - (bufferedTime.minute() % 15)
  return bufferedTime.clone().add(remainder, 'minutes')
}

type RecommendationActionType = Pick<
  // eslint-disable-next-line max-len
  RecommendationListItem, 'id' | 'code' | 'statusEnum' | 'metadata' | 'isMuted' | 'statusTrail' | 'preferences'>

type ActionButtonProps = RecommendationActionType & {
  disabled: boolean
  type: keyof typeof actionTooltip
  initialDate: 'scheduledAt' | 'futureDate'
}

function ApplyCalendar ({
  disabled,
  type,
  id,
  code,
  metadata,
  initialDate
}: ActionButtonProps) {
  const { $t } = useIntl()
  const [scheduleRecommendation] = useScheduleRecommendationMutation()
  const isRecommendationRevertEnabled =
    useIsSplitOn(Features.RECOMMENDATION_REVERT) || Boolean(get('IS_MLISA_SA'))
  const onApply = (date: Moment) => {
    const futureTime = getFutureTime(moment().seconds(0).milliseconds(0))
    if (futureTime <= date){
      scheduleRecommendation({
        id, type, scheduledAt: date.toISOString(), isRecommendationRevertEnabled
      })
    } else {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'Scheduled time cannot be before {futureTime}' }, {
          futureTime: formatter(DateFormatEnum.DateTimeFormat)(futureTime)
        })
      })
    }
  }
  const initialDateOptions = {
    scheduledAt: useRef(moment(metadata.scheduledAt)),
    futureDate: useRef(getFutureTime(moment().seconds(0).milliseconds(0)))
  }
  const futureDate = initialDateOptions.futureDate
  const footerMsg = code.startsWith('c-crrm') && type === 'Apply'
    ? <><Divider /><UI.ApplyMsgWrapper>{$t(applyFooterMsg)}</UI.ApplyMsgWrapper></>
    : undefined

  const disabledDate = useCallback((value: Moment) =>
    value.isBefore(futureDate.current, 'date')
  || value.isAfter(futureDate.current.clone().add(1, 'months')), [futureDate])

  const disabledHours = useCallback((value: Moment) => {
    const hours = []
    const previousHour = (futureDate.current.hours() - 1) % 24
    for (let i = previousHour; i >= 0; i--) {
      hours.push(i)
    }
    return futureDate.current.isSame(value, 'dates')
      ? hours
      : []
  }, [futureDate])

  const disabledMinutes = useCallback((value: Moment) => {
    const minutes = []
    const pastMinute = (futureDate.current.minutes() - 15) % 60
    for (let i = pastMinute; i >= 0; i = i - 15) {
      minutes.push(i)
    }
    return futureDate.current.isSame(value, 'dates') && futureDate.current.isSame(value, 'hours')
      ? minutes
      : []
  }, [futureDate])


  const disabledDateTime = useMemo(() => {
    return {
      disabledDate,
      disabledHours,
      disabledMinutes
    }
  }, [disabledDate, disabledHours, disabledMinutes])

  return <DateTimePicker
    key={`apply-${id}`}
    title={$t(actionTooltip[type].text)}
    icon={<UI.IconWrapper $disabled={disabled}>{actionTooltip[type].icon}</UI.IconWrapper>}
    disabled={disabled}
    initialDate={initialDateOptions[initialDate]}
    onApply={onApply}
    extraFooter={footerMsg}
    disabledDateTime={disabledDateTime}
  />
}

function CancelCalendar ({ disabled, id }: Omit<ActionButtonProps, 'type' | 'initialDate'>) {
  const { $t } = useIntl()
  const [cancelRecommendation] = useCancelRecommendationMutation()
  return <UI.IconWrapper key={`cancel-${id}`} $disabled={disabled}>
    { disabled
      ? <CancelCircleSolid />
      : <Tooltip
        placement='top'
        arrowPointAtCenter
        title={$t({ defaultMessage: 'Cancel' })}
      >
        <CancelCircleOutlined
          onClick={async () => { await cancelRecommendation({ id }).unwrap() }} />
      </Tooltip>}
  </UI.IconWrapper>
}

const actions = {
  schedule: (props: ActionButtonProps) => <ApplyCalendar {...props} />,
  cancel: (props: Omit<ActionButtonProps, 'type' | 'initialDate'>) => <CancelCalendar {...props} />
}

export const isCrrmOptimizationMatched = (
  code: Recommendation['code'],
  metadata: Recommendation['metadata'],
  preferences: Recommendation['preferences']
) => !code.startsWith('c-crrm') || _.get(metadata, 'audit') ||
  _.get(metadata, 'algorithmData.isCrrmFullOptimization', true)
    === _.get(preferences, 'crrmFullOptimization', true)

const getAvailableActions = (
  recommendation: RecommendationActionType, isRecommendationRevertEnabled: boolean
) => {
  const { isMuted, statusEnum, code, metadata, preferences } = recommendation
  const props = { ...recommendation }
  if (isMuted) {
    return [
      {
        icon: actions.schedule({
          ...props, disabled: true, type: 'Apply', initialDate: 'futureDate'
        })
      },
      {
        icon: actions.schedule({
          ...props, disabled: true, type: 'Revert', initialDate: 'futureDate'
        })
      }
    ]
  }

  switch (statusEnum) {
    case 'new':
      return [
        {
          icon: actions.schedule({
            ...props,
            disabled: !isCrrmOptimizationMatched(code, metadata, preferences),
            type: 'Apply',
            initialDate: 'futureDate'
          })
        },
        {
          icon: actions.schedule({
            ...props, disabled: true, type: 'Revert', initialDate: 'futureDate'
          })
        }
      ]
    case 'applyscheduled':
      const appliedOnce = recommendation?.statusTrail?.filter(
        ({ status }) => status === 'applied').length !== 0
      return [
        {
          icon: actions.schedule({
            ...props, disabled: false, type: 'ApplyScheduled', initialDate: 'scheduledAt'
          })
        },
        !appliedOnce && { icon: actions.cancel({ ...props, disabled: false }) },
        {
          icon: actions.schedule({
            ...props,
            disabled: !(isRecommendationRevertEnabled &&
              appliedOnce &&
              recommendation.code.startsWith('c-crrm')
            ),
            type: 'Revert',
            initialDate: 'futureDate'
          })
        }
      ].filter(Boolean) as { icon: JSX.Element }[]
    case 'applied':
    case 'applywarning':
    case 'revertfailed':
      return [
        {
          icon: actions.schedule({
            ...props, disabled: true, type: 'Apply', initialDate: 'futureDate'
          })
        },
        {
          icon: actions.schedule({
            ...props, disabled: false, type: 'Revert', initialDate: 'futureDate'
          })
        }
      ]
    case 'revertscheduled':
      return [
        {
          icon: actions.schedule({
            ...props, disabled: true, type: 'Apply', initialDate: 'futureDate'
          })
        },
        { icon: actions.cancel({ ...props, disabled: false }) },
        {
          icon: actions.schedule({
            ...props, disabled: false, type: 'RevertScheduled', initialDate: 'scheduledAt'
          })
        }
      ]
    case 'applyfailed':
      return [
        {
          icon: actions.schedule({
            ...props, disabled: true, type: 'Apply', initialDate: 'futureDate'
          })
        },
        {
          icon: actions.schedule({
            ...props,
            disabled: !(isRecommendationRevertEnabled && recommendation.code.startsWith('c-crrm')),
            type: 'Revert',
            initialDate: 'futureDate'
          })
        }
      ]
    case 'beforeapplyinterrupted':
    case 'afterapplyinterrupted':
    case 'reverted':
    case 'applyscheduleinprogress':
    case 'revertscheduleinprogress':
      return [
        {
          icon: actions.schedule({
            ...props, disabled: true, type: 'Apply', initialDate: 'futureDate'
          })
        },
        {
          icon: actions.schedule({
            ...props, disabled: true, type: 'Revert', initialDate: 'futureDate'
          })
        }
      ]
    default: return []
  }
}

export const RecommendationActions = (props: { recommendation: RecommendationActionType }) => {
  const { recommendation } = props
  const isRecommendationRevertEnabled =
    useIsSplitOn(Features.RECOMMENDATION_REVERT) || Boolean(get('IS_MLISA_SA'))
  const actionButtons = getAvailableActions(recommendation, isRecommendationRevertEnabled)
  return <UI.Actions>
    {actionButtons.map((config, i) => <span key={i}>{config.icon}</span>)}
  </UI.Actions>
}
