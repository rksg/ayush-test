import { useCallback, useMemo, useRef, MutableRefObject, ReactNode } from 'react'

import { Modal as AntModal }                          from 'antd'
import moment, { Moment }                             from 'moment-timezone'
import { FormattedMessage, RawIntlProvider, useIntl } from 'react-intl'

import { DateTimePicker, showToast }     from '@acx-ui/components'
import { get }                           from '@acx-ui/config'
import { DateFormatEnum, formatter }     from '@acx-ui/formatter'
import {
  useLazyVenueRadioActiveNetworksQuery
} from '@acx-ui/rc/services'
import { RadioTypeEnum }        from '@acx-ui/rc/utils'
import { getIntl, NetworkPath } from '@acx-ui/utils'

import { useLazyRecommendationWlansQuery } from '../Recommendations/services'

import {
  IntentListItem,
  useOptimizeAllIntentMutation,
  OptimizeAllItemMutationPayload,
  OptimizeAllMutationResponse
} from './services'
import * as UI from './styledComponents'
interface OptimizeAllDateTimePickerProps {
  id: string
  title: string
  disabled?: boolean
  initialDate: MutableRefObject<Moment>
  onApply: (value: Moment) => void
}

type OptimizeValues = {
  feature: string
  zone: string
  b: (text: string) => ReactNode
  br: ReactNode
  date: string
  changeTime: ReactNode
}

const OPTIMIZE_TYPES = {
  1_1: (values:OptimizeValues) => <FormattedMessage
    defaultMessage={`Clicking Yes, will automate 
    <b>{feature}</b> feature for Zone <b>{zone}</b>.
    It will apply the config at {date}.{changeTime}{br}{br}
    And don’t worry! You can always revert the change anytime.`}
    values={values}/>,
  1_2: (values:OptimizeValues) => <FormattedMessage
    defaultMessage={`Clicking Yes, will automate 
    <b>{feature}</b> feature for <b>{zone}</b> selected Zones.
    It will apply the config at {date}.{changeTime}{br}{br}
    And don’t worry! You can always revert the change anytime.`}
    values={values}/>,
  2_1: (values:OptimizeValues) => <FormattedMessage
    defaultMessage={`Clicking Yes, will automate 
    <b>{feature}</b> features for Zone <b>{zone}</b>.
    It will apply the config at {date}.{changeTime}{br}{br}
    And don’t worry! You can always revert the change anytime.`}
    values={values}/>,
  2_2: (values:OptimizeValues) => <FormattedMessage
    defaultMessage={`Clicking Yes, will automate 
    <b>{feature}</b> features across <b>{zone}</b> selected Zones.
    It will apply the config at {date}.{changeTime}{br}{br}
    And don’t worry! You can always revert the change anytime.`}
    values={values}/>
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

const getDefaultTime = () => {
  const datetime3AM = moment().set({ hour: 3, minute: 0, second: 0, millisecond: 0 })
  return moment().isSameOrBefore(datetime3AM) ?
    moment(datetime3AM) : moment(datetime3AM).add(1, 'd')
}

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
  const type = `${featureCount === 1 ? 1 : 2}${zoneCount === 1 ? 1 : 2}` as unknown as
  keyof typeof OPTIMIZE_TYPES
  const getOptimizeMessage = OPTIMIZE_TYPES[type]
  return { feature, zone, getOptimizeMessage }
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
  const [optimizeAllIntent] = useOptimizeAllIntentMutation()
  const [recommendationWlans] = useLazyRecommendationWlansQuery()
  const [venueRadioActiveNetworks] = useLazyVenueRadioActiveNetworksQuery()
  const initialDate = useRef(getDefaultTime())
  const isMlisa = Boolean(get('IS_MLISA_SA'))
  const fetchWlans = async (id:string, code:string, path:NetworkPath) => {
    if (isMlisa) {
      const wlans = await recommendationWlans({ id } ).unwrap()
      return wlans.map(wlan => ({ ...wlan, id: wlan.name }))
    }
    const venueId = path?.filter(({ type }) => type === 'zone')?.[0].name
    const wlans = await venueRadioActiveNetworks(getR1WlanPayload(venueId, code)).unwrap()
    return wlans.map(wlan => ({ name: wlan.id, ssid: wlan.ssid })) // wlan name is id in config ds
  }

  const doAllOptimize = async (rows:IntentListItem[], scheduledAt:string) => {
    const optimizeList = await Promise.all(rows.map(async (row) => {
      const { code, preferences } = row
      const item: OptimizeAllItemMutationPayload = {
        id: row.id,
        metadata: { scheduledAt }
      }

      if (code.startsWith('c-probeflex-')) { // AirflexAI c-probeflex-*
        item.metadata.wlans = await fetchWlans(row.id, row.code, row.path)

      } else if (code.startsWith('c-crrm-')) { // AI-Driven
        item.metadata.preferences = { ...(preferences ?? {}), crrmFullOptimization: true }
      }
      return item
    }))

    const response = await optimizeAllIntent({ optimizeList })
    if ('data' in response) {
      const result = response.data as OptimizeAllMutationResponse
      const errorMsgs:string[] = []
      Object.entries(result).forEach(([, { success, errorMsg }]) => {
        if (!success) {
          errorMsgs.push(errorMsg)
        }
      })

      // TBD error message
      if (errorMsgs.length > 0) {
        showToast({
          type: 'error',
          content: errorMsgs.map((errorMsg, index) =>
            (<span key={`optimizeAllIntentErrorToast_${index}`}>{errorMsg}<br></br></span>))
        })
      }
    }
  }

  const showOneClickOptimize = (rows:IntentListItem[], onOk?: ()=>void) => {
    const { feature, zone, getOptimizeMessage } = aggregateFeaturesZones(rows)
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

    const getValues = (date:string) => ({
      feature, zone,
      b: (text: string) => <strong>{text}</strong>,
      br: <br />,
      date,
      changeTime:
      (
        <OptimizeAllDateTimePicker
          id={'apply-intent-ai-change-time'}
          title={$t({ defaultMessage: 'Change time' })}
          disabled={false}
          initialDate={initialDate}
          onApply={changeOptimizeDateTime}
        />
      )
    })

    const getContent = (date:string) => {
      return (<RawIntlProvider value={getIntl()} >
        {getOptimizeMessage(getValues(date))}
      </RawIntlProvider>)
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
    showOneClickOptimize,
    fetchWlans
  }
}

function OptimizeAllDateTimePicker ({
  id,
  title,
  initialDate,
  onApply,
  disabled
}: OptimizeAllDateTimePickerProps) {
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