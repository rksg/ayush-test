import { useCallback, useMemo, useRef, useState, useEffect } from 'react'

import { Divider }                from 'antd'
import _                          from 'lodash'
import moment, { Moment }         from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { DateTimePicker, Tooltip, showToast, Loader, Select } from '@acx-ui/components'
import { get }                                                from '@acx-ui/config'
import { Features, useIsSplitOn }                             from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                          from '@acx-ui/formatter'
import {
  CalendarOutlined,
  CancelCircleOutlined,
  CancelCircleSolid,
  CheckMarkCircleOutline
} from '@acx-ui/icons'
import { useVenueNetworkListV2Query } from '@acx-ui/rc/services'

import {
  Recommendation,
  RecommendationListItem,
  useRecommendationWlansQuery,
  useCancelRecommendationMutation,
  useScheduleRecommendationMutation
} from '../services'

import * as UI from './styledComponents'

import type {
  SchedulePayload,
  RecommendationWlan
} from '../services'


// eslint-disable-next-line max-len
const applyFooterMsg = defineMessage({ defaultMessage: 'This recommendation will be applied at the chosen time whenever there is a need to change the channel plan. Schedule a time during off-hours when the number of WiFi clients is at the minimum.' })

export const actionTooltip = {
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

export type RecommendationActionType = Pick<
  // eslint-disable-next-line max-len
  RecommendationListItem, 'id' | 'code' | 'statusEnum' | 'metadata' | 'isMuted' | 'statusTrail' | 'preferences' | 'sliceValue'>

type ActionButtonProps = RecommendationActionType & {
  disabled: boolean
  type: keyof typeof actionTooltip
  initialDate: 'scheduledAt' | 'futureDate',
  showTextOnly? : boolean
}

type wlanSelection = RecommendationWlan & { id: string, excluded?: boolean }

function useWlansSelection (
  id: string,
  venueId: string,
  savedWlans: RecommendationWlan[] | undefined,
  isMlisa: boolean,
  needsWlans: boolean
) {
  const [wlans, setWlans] = useState<Array<wlanSelection & { excluded?: boolean }>>([])
  const selected = wlans.filter(wlan => !wlan.excluded)
  const wlansQuery = useRecommendationWlansQuery({ id }, { skip: !needsWlans || !isMlisa })
  const r1Networks = useVenueNetworkListV2Query({
    params: { venueId },
    payload: {
      deep: true,
      fields: ['id', 'name', 'ssid', 'venues'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 10_000
    }
  }, { skip: !needsWlans || isMlisa })
  useEffect(() => {
    let available: wlanSelection[] | undefined
    if (isMlisa && wlansQuery.data) {
      available = wlansQuery.data.map(wlan => ({ ...wlan, id: wlan.name })) // RA does not have ID
    } else if (!isMlisa && r1Networks.data) {
      available = r1Networks.data.data.filter(({ venues }) =>
        venues.names.includes(venueId)
      )
    }
    if (available) {
      if (savedWlans) {
        const saved = savedWlans.map(({ name }) => name)
        setWlans(available.map(wlan => ({
          ...wlan,
          excluded: !saved.includes(isMlisa ? wlan.name : wlan.id)
        })))
      } else {
        setWlans(available)
      }
    }
  }, [isMlisa, r1Networks, savedWlans, venueId, wlansQuery])
  return {
    states: [r1Networks, wlansQuery],
    available: wlans,
    selected: selected.length ? selected : wlans,
    select: (ids: string[]) =>
      setWlans(wlans.map(wlan => ({ ...wlan, excluded: !ids.includes(wlan.id) })))
  }
}

function ApplyCalendar ({
  disabled,
  type,
  id,
  code,
  metadata,
  initialDate,
  sliceValue,
  showTextOnly
}: ActionButtonProps) {
  const { $t } = useIntl()
  const needsWlans = code.startsWith('c-probeflex-')
  const [scheduleRecommendation] = useScheduleRecommendationMutation()
  const isMlisa = Boolean(get('IS_MLISA_SA'))
  const isRecommendationRevertEnabled = useIsSplitOn(Features.RECOMMENDATION_REVERT) || isMlisa
  const wlans = useWlansSelection(id, sliceValue, metadata.wlans, isMlisa, needsWlans)
  const onApply = (date: Moment) => {
    const futureTime = getFutureTime(moment().seconds(0).milliseconds(0))
    if (futureTime <= date){
      const schedule: SchedulePayload = {
        id,
        type,
        scheduledAt: date.toISOString(),
        isRecommendationRevertEnabled
      }
      if (needsWlans) {
        schedule.wlans = wlans.selected.map(wlan => ({ name: wlan.id, ssid: wlan.ssid })) // wlan name is id in config ds
      }
      scheduleRecommendation(schedule)
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
  let footer: React.ReactNode
  if (code.startsWith('c-crrm') && type === 'Apply') {
    footer = <><Divider /><UI.ApplyMsgWrapper>{$t(applyFooterMsg)}</UI.ApplyMsgWrapper></>
  } else if (needsWlans && ['Apply', 'ApplyScheduled'].includes(type)) {
    footer = <>
      <Divider />
      <Loader states={wlans.states} style={{ height: '52px' }}>
        <Select
          mode='multiple'
          maxTagCount='responsive'
          showArrow
          showSearch={false}
          style={{ width: '260px', margin: '10px auto' }}
          onChange={wlans.select}
          placeholder={$t({ defaultMessage: 'Select networks' })}
          value={wlans.selected.map(wlan => wlan.id)}
          maxTagPlaceholder={() =>
            <div title={wlans.selected.map(wlan => wlan.name).join(', ')}>
              {$t({
                defaultMessage: `{count} {count, plural,
                  one {{singular}}
                  other {{plural}}
                } selected`
              }, {
                count: wlans.selected.length,
                singular: $t(defineMessage({ defaultMessage: 'network' })),
                plural: $t(defineMessage({ defaultMessage: 'networks' }))
              })}
            </div>
          }
          children={wlans.available
            .map(({ id, name }: { id: string, name: string }) =>
              <Select.Option key={id} value={id} children={name} />
            )
          }
        />
      </Loader>
    </>
  }

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
    title={showTextOnly ? undefined : $t(actionTooltip[type].text)}
    icon={showTextOnly
      ? <UI.ActionsText>{$t(actionTooltip[type].text)}</UI.ActionsText>
      : <UI.IconWrapper $disabled={disabled}>{actionTooltip[type].icon}</UI.IconWrapper>}
    disabled={disabled}
    initialDate={initialDateOptions[initialDate]}
    onApply={onApply}
    extraFooter={footer}
    disabledDateTime={disabledDateTime}
  />
}

function CancelCalendar ({
  disabled,id,showTextOnly
}: Omit<ActionButtonProps, 'type' | 'initialDate'>) {
  const { $t } = useIntl()
  const [cancelRecommendation] = useCancelRecommendationMutation()
  return <UI.IconWrapper key={`cancel-${id}`} $disabled={disabled}>
    { disabled
      ? <CancelCircleSolid />
      : showTextOnly
        ? <UI.ActionsText onClick={async () => { await cancelRecommendation({ id }).unwrap() }} >
          {$t({ defaultMessage: 'Cancel' })}
        </UI.ActionsText>
        :<Tooltip
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

export const getAvailableActions = (
  recommendation: RecommendationActionType,
  isRecommendationRevertEnabled: boolean,
  showTextOnly?: boolean) => {
  const { isMuted, statusEnum, code, metadata, preferences } = recommendation
  const props = { ...recommendation, showTextOnly }
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
        },
        !appliedOnce && { icon: actions.cancel({ ...props, disabled: false }) }
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
        {
          icon: actions.schedule({
            ...props, disabled: false, type: 'RevertScheduled', initialDate: 'scheduledAt'
          })
        },
        { icon: actions.cancel({ ...props, disabled: false }) }
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

export const RecommendationActions = ({
  recommendation,
  showTextOnly = false
}: {
  recommendation: RecommendationActionType,
  showTextOnly?: boolean
}) => {
  const isRecommendationRevertEnabled =
    useIsSplitOn(Features.RECOMMENDATION_REVERT) || Boolean(get('IS_MLISA_SA'))
  const actionButtons = getAvailableActions(
    recommendation,
    isRecommendationRevertEnabled,
    showTextOnly
  )
  return <UI.Actions>
    {actionButtons.map((config, i) => <span key={i}>{config.icon}</span>)}
  </UI.Actions>
}
