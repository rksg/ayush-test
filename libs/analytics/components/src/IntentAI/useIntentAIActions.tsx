import { useCallback, useMemo, useRef, MutableRefObject, ReactNode } from 'react'

import { Modal as AntModal }                          from 'antd'
import moment, { Moment }                             from 'moment-timezone'
import { FormattedMessage, RawIntlProvider, useIntl } from 'react-intl'

import { getUserName as getRAIUserName }     from '@acx-ui/analytics/utils'
import { DateTimePicker, showToast }         from '@acx-ui/components'
import { get }                               from '@acx-ui/config'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }         from '@acx-ui/formatter'
import {
  useLazyVenueRadioActiveNetworksQuery,
  useLazyVenueWifiRadioActiveNetworksQuery
} from '@acx-ui/rc/services'
import { RadioTypeEnum }                         from '@acx-ui/rc/utils'
import { getUserName as getR1UserName }          from '@acx-ui/user'
import { Filters, getIntl, useEncodedParameter } from '@acx-ui/utils'

import { IntentListItem, stateToGroupedStates } from './config'
import {
  TransitionMutationResponse,
  useLazyIntentWlansQuery,
  useTransitionIntentMutation
} from './services'
import { DisplayStates } from './states'
import * as UI           from './styledComponents'
import {
  Actions,
  TransitionIntentItem,
  TransitionIntentMetadata,
  getDefaultTime,
  getTransitionStatus
} from './utils'

interface IntentAIDateTimePickerProps {
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
    <b>{feature}</b> feature for <VenueSingular></VenueSingular> <b>{zone}</b>.
    It will apply the config at {date}.{changeTime}{br}{br}
    And don’t worry! You can always revert the change anytime.`}
    values={values}/>,
  1_2: (values:OptimizeValues) => <FormattedMessage
    defaultMessage={`Clicking Yes, will automate
    <b>{feature}</b> feature for <b>{zone}</b> selected <VenuePlural></VenuePlural>.
    It will apply the config at {date}.{changeTime}{br}{br}
    And don’t worry! You can always revert the change anytime.`}
    values={values}/>,
  2_1: (values:OptimizeValues) => <FormattedMessage
    defaultMessage={`Clicking Yes, will automate
    <b>{feature}</b> features for <VenueSingular></VenueSingular> <b>{zone}</b>.
    It will apply the config at {date}.{changeTime}{br}{br}
    And don’t worry! You can always revert the change anytime.`}
    values={values}/>,
  2_2: (values:OptimizeValues) => <FormattedMessage
    defaultMessage={`Clicking Yes, will automate
    <b>{feature}</b> features across <b>{zone}</b> selected <VenuePlural></VenuePlural>.
    It will apply the config at {date}.{changeTime}{br}{br}
    And don’t worry! You can always revert the change anytime.`}
    values={values}/>
}

const codeToRadio: Record<string, RadioTypeEnum> = {
  'c-probeflex-24g': RadioTypeEnum._2_4_GHz,
  'c-probeflex-5g': RadioTypeEnum._5_GHz,
  'c-probeflex-6g': RadioTypeEnum._6_GHz
}

export const getFutureTime = (value: Moment) => {
  const bufferedTime = value.clone().add(15, 'minutes')
  const remainder = 15 - (bufferedTime.minute() % 15)
  return bufferedTime.clone().add(remainder, 'minutes')
}

const validateDate = (date:Moment) => {
  const futureTime = getFutureTime(moment().seconds(0).milliseconds(0))
  return futureTime <= date
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

export const getUserName = () => get('IS_MLISA_SA') ? getRAIUserName() : getR1UserName()

export function useIntentAIActions () {
  const { $t } = useIntl()
  const [recommendationWlans] = useLazyIntentWlansQuery()
  const [venueRadioActiveNetworks] = useLazyVenueRadioActiveNetworksQuery()
  const [venueWifiRadioActiveNetworks] = useLazyVenueWifiRadioActiveNetworksQuery()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const [transitionIntent] = useTransitionIntentMutation()
  const initialDate = useRef(getDefaultTime())
  const isMlisa = Boolean(get('IS_MLISA_SA'))
  const intentTableFilters = useEncodedParameter<Filters>('intentTableFilters')

  const showSuccessToast = (action: Actions, data: TransitionIntentItem[]) => {

    showToast({
      type: 'success',
      content:
        <FormattedMessage
          defaultMessage={`The selected
            {totalCount, plural,
            one {intent}
            other {intents}} has been updated`}
          values={{
            totalCount: data.length
          }}
        />,
      link: {
        text: 'View',
        onClick: () => {
          const statusLabelList = data.map((item) => {
            const { status, statusReason } = getTransitionStatus(action, item)
            const key = [status, statusReason].filter(Boolean).join('-')
            return stateToGroupedStates[key as unknown as DisplayStates]?.key || key
          })
          const currentFilter = intentTableFilters.read() || {}
          const newFilter = {
            ...currentFilter,
            statusLabel: [...new Set(statusLabelList)]
          }
          intentTableFilters.write(newFilter as Filters)
        }
      }
    })
  }

  const handleResponse = (rows:IntentListItem[], result: TransitionMutationResponse,
    action: Actions, data: TransitionIntentItem[]
  ) => {
    const errorMsgs:JSX.Element[] = []
    Object.entries(result).forEach(([, { success, errorMsg }], index) => {
      const row = rows[index]
      if (!success) {
        errorMsgs.push(
          <div key={`optimizeAllIntentErrorToast_${index}`} style={{ padding: '10px 0' }}>
            {row.aiFeature}, {row.sliceValue}:<br />{errorMsg}
          </div>
        )
      }
    })
    if (errorMsgs.length > 0) {
      showToast({ type: 'error', content: errorMsgs })
    }
    if (errorMsgs.length < rows.length) {
      showSuccessToast(action, data)
    }
  }

  const getR1WlanPayload = (venueId: string, code: string) => ({
    params: { venueId },
    radio: codeToRadio[code],
    payload: {
      ...(isWifiRbacEnabled
        ? {
          filters: {
            'venueApGroups.venueId': [venueId]
          }
        }
        : { venueId }
      ),
      fields: isWifiRbacEnabled ? ['id', 'name', 'venueApGroups', 'ssid'] : ['id', 'name', 'ssid'],
      page: 1,
      sortField: 'name',
      sortOrder: 'ASC',
      pageSize: 10_000
    }
  })

  const fetchWlans = async (row: IntentListItem) => {
    if (isMlisa) {
      const wlans = await recommendationWlans(row).unwrap()
      return wlans
    }
    const venueId = row.idPath.filter(({ type }) => type === 'zone')?.[0].name
    const networkQuery = isWifiRbacEnabled ? venueWifiRadioActiveNetworks : venueRadioActiveNetworks
    const wlans = await networkQuery(getR1WlanPayload(venueId, row.code)).unwrap()
    return wlans.map(wlan => ({ name: wlan.id, ssid: wlan.ssid })) // wlan name is id in config ds
  }

  const doAllOptimize = async (rows:IntentListItem[], scheduledAt:string) => {
    const optimizeList = await Promise.all(rows.map(async (row) => {
      const { code, preferences, displayStatus, status } = row
      const metadata = { scheduledAt } as TransitionIntentMetadata
      if (code.startsWith('c-probeflex-')) { // EquiFlex c-probeflex-*
        metadata.wlans = await fetchWlans(row)

      } else if (code.startsWith('c-crrm-')) { // AI-Driven
        metadata.preferences = { ...(preferences ?? {}), crrmFullOptimization: true }
      }
      metadata.changedByName = getUserName()
      return { id: row.id, displayStatus, status, metadata } as TransitionIntentItem
    }))

    const response = await transitionIntent(
      {
        action: Actions.One_Click_Optimize,
        data: optimizeList
      })
    handleResponse(rows, (response as { data: TransitionMutationResponse }).data,
      Actions.One_Click_Optimize, optimizeList)
  }

  const showOneClickOptimize = (rows:IntentListItem[], onOk: ()=>void) => {
    const { feature, zone, getOptimizeMessage } = aggregateFeaturesZones(rows)
    const modal = AntModal.confirm({})
    initialDate.current = getDefaultTime()
    const changeOptimizeDateTime = (date:Moment) => {
      initialDate.current = date
      modal.update({
        content: getContent(formatter(DateFormatEnum.DateTimeFormat)(date))
      })
    }

    const getValues = (date:string) => ({
      feature, zone,
      b: (text: string) => <strong>{text}</strong>,
      br: <br />,
      date,
      changeTime:
      (
        <IntentAIDateTimePicker
          id={'intent-ai-change-time'}
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
      content: getContent($t({ defaultMessage: '3AM local time' })),
      okText: $t({ defaultMessage: 'Yes, Optimize!' }),
      cancelText: $t({ defaultMessage: 'Cancel' }),
      icon: <> </>,
      onOk: async () => {
        if (validateDate(initialDate.current)) {
          const scheduledAt = initialDate.current.toISOString()
          await doAllOptimize(rows, scheduledAt)
          initialDate.current = getDefaultTime()
          onOk()
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

  const revert = async (date: Moment, rows:IntentListItem[], onOk: ()=>void) => {
    if (validateDate(date)) {
      const scheduledAt = date.toISOString()
      const data = rows.map(item =>(
        {
          id: item.id,
          displayStatus: item.displayStatus,
          status: item.status,
          metadata: { scheduledAt, changedByName: getUserName() }
        } as TransitionIntentItem))
      const response = await transitionIntent({
        action: Actions.Revert,
        data: data
      })
      handleResponse(rows, (response as { data: TransitionMutationResponse }).data,
        Actions.Revert,data)
      onOk()

    } else {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'Revert Scheduled time cannot be before {futureTime}' }, {
          futureTime: formatter(DateFormatEnum.DateTimeFormat)(date)
        })
      })
    }
  }

  const handleTransitionIntent = async (
    action: Actions,
    rows:IntentListItem[],
    onOk: ()=>void) => {
    const data = rows.map(item =>
      ({ id: item.id,
        displayStatus: item.displayStatus,
        status: item.status,
        statusTrail: item.statusTrail,
        metadata: { ...item.metadata, changedByName: getUserName() }
      } as TransitionIntentItem))
    const response = await transitionIntent({
      action,
      data: data
    })
    handleResponse(rows, (response as { data: TransitionMutationResponse }).data,
      action, data)
    onOk()
  }

  return {
    showOneClickOptimize,
    fetchWlans,
    handleTransitionIntent,
    revert
  }
}

export function IntentAIDateTimePicker ({
  id,
  title,
  initialDate,
  onApply,
  disabled
}: IntentAIDateTimePickerProps) {
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
    placement='bottomLeft'
  />
}
