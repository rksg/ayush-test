import { useIntl } from 'react-intl'

import { ActionType, ActionTypeCardIcon, ActionTypeDescription, ActionTypeTitle } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'


export interface ActionCardProps {
  actionType: ActionType,
  handleClick: (type: ActionType) => void,
  disabled?: boolean
}

export default function ActionCard (props: ActionCardProps) {
  const { $t } = useIntl()
  const { actionType, handleClick, disabled = false } = props
  const ActionTypeIcon = ActionTypeCardIcon[actionType]

  return <UI.Card
    hoverable={!disabled}
    $disabled={disabled}
    onClick={disabled ? undefined : () => handleClick(actionType)}
  >
    <UI.Space direction={'horizontal'} align='start' >
      <UI.Icon>
        <ActionTypeIcon />
      </UI.Icon>
      <UI.Content>
        <UI.Title>
          {$t(ActionTypeTitle[actionType])}
        </UI.Title>
        <UI.Description>
          {$t(ActionTypeDescription[actionType])}
        </UI.Description>
        <UI.Button type={'primary'} disabled={disabled}>
          {$t({ defaultMessage: 'Add' })}
        </UI.Button>
      </UI.Content>
    </UI.Space>
  </UI.Card>
}
