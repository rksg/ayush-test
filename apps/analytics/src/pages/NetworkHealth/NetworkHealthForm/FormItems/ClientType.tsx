import { Form, Radio }                              from 'antd'
import { FormattedMessage, defineMessage, useIntl } from 'react-intl'

import { StepsFormNew, Tooltip, useStepFormContext } from '@acx-ui/components'

import * as contents                    from '../../contents'
import { ClientType as ClientTypeEnum } from '../../types'

const name = 'clientType' as const
const label = defineMessage({ defaultMessage: 'Client Type' })

const tooltip = <FormattedMessage
  {...contents.clientTypeTooltip}
  values={contents.formatValues}
/>

export function ClientType () {
  const { $t } = useIntl()
  const { editMode } = useStepFormContext()
  const types = [
    ClientTypeEnum.VirtualClient,
    ClientTypeEnum.VirtualWirelessClient
  ]

  const children = editMode ? <StepsFormNew.FieldSummary
    convert={(value) => $t(contents.clientTypes[value as ClientTypeEnum])}
  /> : <Radio.Group>
    {types.map(type => <Radio
      key={type}
      value={type}
      children={$t(contents.clientTypes[type])}
    />)}
  </Radio.Group>

  return <Form.Item
    label={<>
      {$t(label)}
      <Tooltip.Question title={tooltip} />
    </>}
    children={
      <Form.Item
        noStyle
        name={name}
        label={$t(label)}
        children={children}
      />
    }
  />
}

ClientType.fieldName = name
ClientType.label = label

ClientType.FieldSummary = function DnsServerFieldSummary () {
  const { $t } = useIntl()

  return <Form.Item
    name={name}
    label={$t(label)}
    children={<StepsFormNew.FieldSummary<ClientTypeEnum>
      convert={(type) => $t(contents.clientTypes[type!])}
    />}
  />
}
