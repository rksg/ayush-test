import { useIntl } from 'react-intl'

import { RadioCard }                                          from '@acx-ui/components'
import { ActionType, ActionTypeDescription, ActionTypeTitle } from '@acx-ui/rc/utils'


export interface ActionCardProps {
  actionType: ActionType,
  handleClick: (type: ActionType) => void,
  disabled?: boolean
}

export default function ActionCard (props: ActionCardProps) {
  const { $t } = useIntl()
  const { actionType, handleClick, disabled = false } = props

  return <RadioCard
    // TODO: Using this to disable the <Card> component
    type={disabled ? 'disabled' : 'default'}
    value={actionType.toString()}
    title={$t(ActionTypeTitle[actionType])}
    description={$t(ActionTypeDescription[actionType])}
    onClick={() => handleClick(actionType)}
  />
}
