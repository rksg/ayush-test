import { Col, Row }                  from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { StepsForm, Tooltip, useStepFormContext } from '@acx-ui/components'

import * as contents                                         from '../contents'
import { ServiceGuardFormDto, ClientType as ClientTypeEnum } from '../types'

import * as FormItems from './FormItems'

const tooltip = <FormattedMessage
  {...contents.apsSelectionTooltip}
  values={contents.formatValues}
/>

export function ServiceGuardFormAPsSelection () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<ServiceGuardFormDto>()
  return <>
    <StepsForm.Title>
      {$t(contents.steps.apsSelection)}
      {form.getFieldValue(FormItems.ClientType.fieldName) === ClientTypeEnum.VirtualClient &&
        <Tooltip.Question title={tooltip} placement='right' />}
    </StepsForm.Title>
    <Row gutter={20}>
      <Col span={18}>
        <FormItems.APsSelection />
      </Col>
    </Row>
  </>
}

