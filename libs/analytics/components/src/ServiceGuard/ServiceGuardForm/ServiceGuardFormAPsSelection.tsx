import { Col, Row }                  from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { StepsForm, Tooltip, useStepFormContext } from '@acx-ui/components'

import * as contents                                         from '../contents'
import { ServiceGuardFormDto, ClientType as ClientTypeEnum } from '../types'

import * as FormItems         from './FormItems'
import { deviceRequirements } from './FormItems/APsSelection/deviceRequirements'

export function ServiceGuardFormAPsSelection () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<ServiceGuardFormDto>()
  const clientType = form.getFieldValue(FormItems.ClientType.fieldName) as ClientTypeEnum

  let tooltip: JSX.Element | undefined
  if (contents.apsSelectionTooltip[clientType]) {
    tooltip = <FormattedMessage
      {...contents.apsSelectionTooltip[clientType]}
      values={{
        ...contents.formatValues,
        ...deviceRequirements[clientType]
      }}
    />
  }

  return <>
    <StepsForm.Title>
      {$t(contents.steps.apsSelection)}
      {tooltip && <Tooltip.Question title={tooltip} placement='right' />}
    </StepsForm.Title>
    <Row gutter={20}>
      <Col span={18}>
        <FormItems.APsSelection />
      </Col>
    </Row>
  </>
}

