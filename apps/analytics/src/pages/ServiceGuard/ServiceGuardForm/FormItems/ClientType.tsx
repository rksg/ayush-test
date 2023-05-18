import { Form, Radio }                              from 'antd'
import { NamePath }                                 from 'antd/es/form/interface'
import { FormattedMessage, defineMessage, useIntl } from 'react-intl'

import { StepsForm, Tooltip, useStepFormContext } from '@acx-ui/components'

import * as contents                    from '../../contents'
import { ClientType as ClientTypeEnum } from '../../types'

import { AuthenticationMethod } from './AuthenticationMethod'
import { Password }             from './Password'
import { RadioBand }            from './RadioBand'
import { Username }             from './Username'

const name = 'clientType' as const
const label = defineMessage({ defaultMessage: 'Client Type' })

const tooltip = <FormattedMessage
  {...contents.clientTypeTooltip}
  values={contents.formatValues}
/>

export function ClientType () {
  const { $t } = useIntl()
  const { editMode, form } = useStepFormContext()
  const types = [
    ClientTypeEnum.VirtualClient,
    ClientTypeEnum.VirtualWirelessClient
  ]

  const children = editMode
    ? <StepsForm.FieldSummary
      convert={(value) => $t(contents.clientTypes[value as ClientTypeEnum])}
    />
    : <Radio.Group
      onChange={(e) => {
        RadioBand.reset(form, e.target.value as ClientTypeEnum)
        AuthenticationMethod.reset(form, e.target.value as ClientTypeEnum)
        const code = form.getFieldValue(AuthenticationMethod.fieldName as unknown as NamePath)
        Username.reset(form, code)
        Password.reset(form, code)
      }}
    >
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

ClientType.FieldSummary = function ClientTypeFieldSummary () {
  const { $t } = useIntl()

  return <Form.Item
    name={name}
    label={$t(label)}
    children={<StepsForm.FieldSummary<ClientTypeEnum>
      convert={(type) => $t(contents.clientTypes[type!])}
    />}
  />
}
