import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import * as contents from '../contents'

import * as FormItems from './FormItems'

export function ServiceGuardFormSettings () {
  const { $t } = useIntl()

  return <>
    <StepsForm.Title children={$t(contents.steps.settings)} />
    <Row gutter={20}>
      <Col span={12} xl={10} xxl={8}>
        <FormItems.TestName />
        <FormItems.ClientType />
        <FormItems.TestType />
        <FormItems.Schedule />
        <FormItems.WlanName />
        <FormItems.AuthenticationMethod />
        <FormItems.Username />
        <FormItems.Password />
        <FormItems.RadioBand />
        <FormItems.DnsServer />
        <FormItems.PingAddress />
        <FormItems.TracerouteAddress />
        <FormItems.SpeedTest />
      </Col>
    </Row>
  </>
}
