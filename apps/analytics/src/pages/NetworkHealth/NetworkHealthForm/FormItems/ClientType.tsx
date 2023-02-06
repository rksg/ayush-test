import { Form, Radio }               from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { StepsFormNew, Tooltip, useStepFormContext } from '@acx-ui/components'

import * as contents                 from '../../contents'
import { ClientType as EClientType } from '../../types'

const tooltip = <FormattedMessage
  {...contents.clientTypeTooltip}
  values={contents.formatValues}
/>

export function ClientType () {
  const { $t } = useIntl()
  const { editMode } = useStepFormContext()
  const types = [
    EClientType.VirtualClient,
    EClientType.VirtualWirelessClient
  ]

  const children = editMode ? <StepsFormNew.FieldSummary
    convert={(value) => $t(contents.clientTypes[value as EClientType])}
  /> : <Radio.Group>
    {types.map(type => <Radio
      key={type}
      value={type}
      children={$t(contents.clientTypes[type])}
    />)}
  </Radio.Group>

  return <Form.Item
    label={<>
      {$t({ defaultMessage: 'Client Type' })}
      <Tooltip.Info title={tooltip} />
    </>}
    children={
      <Form.Item
        noStyle
        name='clientType'
        label={$t({ defaultMessage: 'Client Type' })}
        children={children}
      />
    }
  />
}
