import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import {
  StepsForm
} from '@acx-ui/components'

import * as contents from '../contents'

import * as FormItems from './FormItems'

export function ServiceGuardFormSummary () {
  const { $t } = useIntl()

  return <>
    <StepsForm.Title children={$t(contents.steps.summary)} />
    <Row gutter={20}>
      <Col span={12} xl={10} xxl={8}>
        <FormItems.TestName.FieldSummary />
        <FormItems.ClientType.FieldSummary />
        <FormItems.TestType.FieldSummary />
        <FormItems.Schedule.FieldSummary />
        <FormItems.WlanName.FieldSummary />
        <FormItems.AuthenticationMethod.FieldSummary />
        <FormItems.Username.FieldSummary />
        <FormItems.Password.FieldSummary />
        <FormItems.RadioBand.FieldSummary />
        <FormItems.DnsServer.FieldSummary />
        <FormItems.PingAddress.FieldSummary />
        <FormItems.TracerouteAddress.FieldSummary />
        <FormItems.SpeedTest.FieldSummary />

        <FormItems.APsSelection.FieldSummary />
      </Col>
    </Row>
  </>
}

