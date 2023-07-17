import { useRef } from 'react'

import { Row, Col }               from 'antd'
import moment, { Moment }         from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { AnalyticsFilter }         from '@acx-ui/analytics/utils'
import { DateTimePicker, Tooltip } from '@acx-ui/components'
import {
  CalendarOutlined,
  CancelCircleOutlined,
  CancelCircleSolid,
  CheckMarkCircleOutline,
  ChevronLeftCircleOutlined
} from '@acx-ui/icons'

import {
  Recommendation,
  useCancelRecommendationMutation,
  useScheduleRecommendationMutation
} from '../services'

import { ActionWrapper } from './styledComponents'


// eslint-disable-next-line max-len
const applyFooterMsg = defineMessage({ defaultMessage: 'This recommendation will be applied at the chosen time whenever there is a need to change the channel plan. Schedule a time during off-hours when the number of WiFi clients is at the minimum. ' })

const actionTooltip = {
  Apply: {
    text: defineMessage({ defaultMessage: 'Apply' }),
    icon: <CheckMarkCircleOutline />
  },
  Revert: {
    text: defineMessage({ defaultMessage: 'Revert' }),
    icon: <ChevronLeftCircleOutlined />
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
  const bufferedTime = value.add(15, 'minutes')
  const remainder = 15 - (bufferedTime.minute() % 15)
  return moment(bufferedTime).add(remainder, 'minutes')
}

type ActionButtonProps = Recommendation & {
  disabled: boolean;
  type: keyof typeof actionTooltip;
  filters: AnalyticsFilter;
}

function ApplyCalender ({ disabled, type, id, code, filters }: ActionButtonProps) {
  const { $t } = useIntl()
  const [scheduleRecommendation] = useScheduleRecommendationMutation()
  const onApply = (date: Moment) => {
    scheduleRecommendation({ id, scheduledAt: date.toISOString(), filters }).unwrap()
  }
  const futureDate = useRef(getFutureTime(moment()))
  const footerMsg = code.startsWith('c-crrm') && type === 'Apply'
    ? $t(applyFooterMsg)
    : undefined

  return <DateTimePicker
    key={`apply-${id}`}
    title={$t(actionTooltip[type].text)}
    icon={<ActionWrapper $disabled={disabled}>{actionTooltip[type].icon}</ActionWrapper>}
    disabled={disabled}
    initialDate={futureDate}
    onApply={onApply}
    applyFooterMsg={footerMsg}
  />
}

function CancelCalendar ({ disabled, id }: Omit<ActionButtonProps, 'type' | 'filters'>) {
  const { $t } = useIntl()
  const [cancelRecommendation] = useCancelRecommendationMutation()
  const onCancel = () => {
    cancelRecommendation({ id }).unwrap()
  }
  return <ActionWrapper key={`cancel-${id}`} $disabled={disabled}>
    { disabled
      ? <CancelCircleSolid />
      : <Tooltip
        placement='top'
        arrowPointAtCenter
        title={$t({ defaultMessage: 'Cancel' })}
      >
        <CancelCircleOutlined onClick={() => onCancel()} />
      </Tooltip>}
  </ActionWrapper>
}

const actions = {
  schedule: (props: ActionButtonProps) => <ApplyCalender {...props} />,
  cancel: (props: Omit<ActionButtonProps, 'type' | 'filters'>) => <CancelCalendar {...props} />
}

const getAvailableActions = (recommendation: Recommendation, filters: AnalyticsFilter) => {
  const { isMuted, statusEnum } = recommendation
  const props = { ...recommendation, filters }
  if (isMuted) {
    return [
      { icon: actions.schedule({ ...props, disabled: true, type: 'Apply' }) },
      { icon: actions.schedule({ ...props, disabled: true, type: 'Revert' }) }
    ]
  }
  switch (statusEnum) {
    case 'new':
      return [
        { icon: actions.schedule({ ...props, disabled: false, type: 'Apply' }) },
        { icon: actions.schedule({ ...props, disabled: true, type: 'Revert' }) }
      ]
    case 'applyscheduled':
      return [
        { icon: actions.schedule({ ...props, disabled: false, type: 'ApplyScheduled' }) },
        { icon: actions.cancel({ ...props, disabled: false }) },
        { icon: actions.schedule({ ...props, disabled: true, type: 'Revert' }) }
      ]
    case 'applied':
    case 'applywarning':
    case 'revertfailed':
      return [
        { icon: actions.schedule({ ...props, disabled: true, type: 'Apply' }) },
        { icon: actions.schedule({ ...props, disabled: false, type: 'Revert' }) }
      ]
    case 'revertscheduled':
      return [
        { icon: actions.schedule({ ...props, disabled: true, type: 'Apply' }) },
        { icon: actions.cancel({ ...props, disabled: false }) },
        { icon: actions.schedule({ ...props, disabled: false, type: 'RevertScheduled' }) }
      ]
    case 'applyfailed':
    case 'beforeapplyinterrupted':
    case 'afterapplyinterrupted':
    case 'reverted':
    case 'applyscheduleinprogress':
    case 'revertscheduleinprogress':
      return [
        { icon: actions.schedule({ ...props, disabled: true, type: 'Apply' }) },
        { icon: actions.schedule({ ...props, disabled: true, type: 'Revert' }) }
      ]
    default: return []
  }
}

export const RecommendationActions = (props: {
  recommendation: Recommendation,
  filters: AnalyticsFilter }) => {
  const { recommendation, filters } = props
  const actionButtons = getAvailableActions(recommendation, filters)
  return <Row gutter={[0, 0]}>
    {actionButtons.map((config, ind) => <Col
      key={ind}
      span={6}
      push={ind === 1 && actionButtons.length === 3 ? 1 : undefined}
    >
      {config.icon}
    </Col>)}
  </Row>
}