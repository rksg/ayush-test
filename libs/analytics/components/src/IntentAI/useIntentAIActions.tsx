/* eslint-disable max-len */
import { useCallback, useMemo, useRef, MutableRefObject } from 'react'

import { Modal as AntModal }                          from 'antd'
import _                                              from 'lodash'
import moment, { Moment }                             from 'moment-timezone'
import { FormattedMessage, RawIntlProvider, useIntl } from 'react-intl'

import { DateTimePicker, showToast }     from '@acx-ui/components'
import { get }                           from '@acx-ui/config'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }     from '@acx-ui/formatter'
import {
  useLazyVenueRadioActiveNetworksQuery
} from '@acx-ui/rc/services'
import { RadioTypeEnum } from '@acx-ui/rc/utils'
import { getIntl }       from '@acx-ui/utils'

import {
  useLazyRecommendationWlansQuery,
  useScheduleRecommendationMutation } from '../Recommendations/services'

import { IntentListItem } from './services'
import * as UI            from './styledComponents'

type RecommendationWlan = {
  name: string
  ssid: string
}
interface SchedulePayload {
  id: string
  type: string
  scheduledAt: string
  isRecommendationRevertEnabled?: boolean
  wlans?: RecommendationWlan[]
  preferences?: {
    crrmFullOptimization: boolean
  }
}
interface ApplyDateTimePickerProps {
  id: string
  title: string
  disabled?: boolean
  initialDate: MutableRefObject<Moment>
  onApply: (value: Moment) => void
}

const OPTIMIZE_TYPES = {
  1_1: {
    featureSuffix: 'feature for Zone',
    zoneSuffix: '.'
  },
  1_2: {
    featureSuffix: 'feature for',
    zoneSuffix: ' selected Zones.'
  },
  2_1: {
    featureSuffix: 'features for Zone',
    zoneSuffix: '.'
  },
  2_2: {
    featureSuffix: 'features across',
    zoneSuffix: ' selected Zones.'
  }
}

const codeToRadio: Record<string, RadioTypeEnum> = {
  'c-probeflex-24g': RadioTypeEnum._2_4_GHz,
  'c-probeflex-5g': RadioTypeEnum._5_GHz,
  'c-probeflex-6g': RadioTypeEnum._6_GHz
}

const getFutureTime = (value: Moment) => {
  const bufferedTime = value.clone().add(15, 'minutes')
  const remainder = 15 - (bufferedTime.minute() % 15)
  return bufferedTime.clone().add(remainder, 'minutes')
}
const datetime3AM = moment().set({ hour: 3, minute: 0, second: 0, millisecond: 0 })
const getDefaultTime = () => moment() < datetime3AM ? moment(datetime3AM) : moment(datetime3AM).add(1, 'd')

const aggregateFeaturesZones = (rows:IntentListItem[]) => {
  const features = new Set<string>()
  const zones = new Set<string>()
  rows.forEach(row => {
    features.add(row.aiFeature)
    zones.add(row.sliceValue)
  })

  const featureCount = features.size
  const zoneCount = zones.size
  const feature = featureCount === 1 ? Array.from(features)[0] : `${featureCount}`
  const zone = zoneCount === 1 ? Array.from(zones)[0] : `${zoneCount}`
  const type = `${featureCount === 1 ? 1 : 2}${zoneCount === 1 ? 1 : 2}` as unknown as keyof typeof OPTIMIZE_TYPES
  const { featureSuffix, zoneSuffix } = OPTIMIZE_TYPES[type]
  return { feature, zone, featureSuffix, zoneSuffix }
}

const getR1WlanPayload = (venueId:string, code:string) => ({
  params: { venueId },
  radio: codeToRadio[code],
  payload: {
    venueId,
    fields: ['id', 'name', 'ssid'],
    page: 1,
    sortField: 'name',
    sortOrder: 'ASC',
    pageSize: 10_000
  }
})

export function useIntentAIActions () {
  const { $t } = useIntl()
  const [scheduleRecommendation] = useScheduleRecommendationMutation()
  const [recommendationWlans] = useLazyRecommendationWlansQuery()
  const [venueRadioActiveNetworks] = useLazyVenueRadioActiveNetworksQuery()
  const initialDate = useRef(getDefaultTime())
  const isMlisa = Boolean(get('IS_MLISA_SA'))
  const isRecommendationRevertEnabled = useIsSplitOn(Features.RECOMMENDATION_REVERT) || isMlisa

  const fetchWlans = async (row:IntentListItem) => {
    if (isMlisa) {
      const wlans = await recommendationWlans({ id: row.id } ).unwrap()
      return wlans.map(wlan => ({ ...wlan, id: wlan.name }))
    }
    const venueId = row.idPath?.filter(({ type }) => type === 'zone')?.[0].name
    const wlans = await venueRadioActiveNetworks(getR1WlanPayload(venueId, row.code)).unwrap()
    return wlans.map(wlan => ({ name: wlan.id, ssid: wlan.ssid })) // wlan name is id in config ds
  }

  const doAllOptimize = async (rows:IntentListItem[], scheduledAt:string) => {
    // TODO do we need the bulk optimize api
    const requests = rows.map(async (row) => {
      const { code } = row
      const schedule: SchedulePayload = {
        id: row.id,
        type: 'Apply',
        scheduledAt,
        isRecommendationRevertEnabled
      }
      if (code.startsWith('c-crrm')) {
        const updatedPreference = {
          ...(_.get(row, 'preferences') || {}),
          crrmFullOptimization: true
        }
        schedule.preferences = updatedPreference
      } else {
        // airflex c-probeflex-*
        schedule.wlans = await fetchWlans(row)
      }
      return scheduleRecommendation(schedule)
    })

    try {
      await Promise.all(requests)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const showOneClickOptimize = (rows:IntentListItem[], onOk?: ()=>void) => {
    const { feature, zone, featureSuffix, zoneSuffix } = aggregateFeaturesZones(rows)
    const modal = AntModal.confirm({})
    initialDate.current = getDefaultTime()
    const changeOptimizeDateTime = (date:Moment) => {
      initialDate.current = date
      modal.update({
        content: getContent(formatter(DateFormatEnum.DateTimeFormat)(date))
      })
    }
    const validateDate = (date:Moment) => {
      const futureTime = getFutureTime(moment().seconds(0).milliseconds(0))
      if (futureTime <= date){
        return true
      }
      return false
    }
    const getContent = (date:string) => {
      return (<RawIntlProvider value={getIntl()} ><FormattedMessage
        defaultMessage={`
        Clicking Yes, will automate <b>{feature}</b> {featureSuffix} <b>{zone}</b>{zoneSuffix}
        It will apply the config at {date}.{changeTime}{br}{br}
        And don’t worry! You can always revert the change anytime.
        `}
        values={{
          feature, zone, featureSuffix, zoneSuffix,
          b: (text: string) => <strong>{text}</strong>,
          br: <br />,
          date,
          changeTime:
          (
            <ApplyDateTimePicker
              id={'apply-intent-ai-change-time'}
              title={$t({ defaultMessage: 'Change time' })}
              disabled={false}
              initialDate={initialDate}
              onApply={changeOptimizeDateTime}
            />
          )
        }}/></RawIntlProvider>)
    }
    modal.update({
      type: 'confirm',
      title: $t({ defaultMessage: '1-Click Optimize?' }),
      content: getContent('3AM local time'),
      okText: $t({ defaultMessage: 'Yes, Optimize!' }),
      cancelText: $t({ defaultMessage: 'Cancel' }),
      icon: <> </>,
      onOk: async () => {
        if (validateDate(initialDate.current)) {
          const scheduledAt = initialDate.current.toISOString()
          await doAllOptimize(rows, scheduledAt)
          initialDate.current = getDefaultTime()
          onOk && onOk()
        } else {
          showToast({
            type: 'error',
            content: $t({ defaultMessage: 'Scheduled time cannot be before {futureTime}' }, {
              futureTime: formatter(DateFormatEnum.DateTimeFormat)(initialDate.current)
            })
          })
        }
      },
      className: 'intent-ai-optimize-modal'
    })
  }

  return {
    showOneClickOptimize
  }
}

function ApplyDateTimePicker ({
  id,
  title,
  initialDate,
  onApply,
  disabled
}: ApplyDateTimePickerProps) {
  const futureDate = useRef(getFutureTime(moment().seconds(0).milliseconds(0)))
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
    key={id}
    title={title}
    icon={<UI.ActionsText>{title}</UI.ActionsText>}
    disabled={disabled}
    initialDate={initialDate}
    onApply={onApply}
    disabledDateTime={disabledDateTime}
  />
}