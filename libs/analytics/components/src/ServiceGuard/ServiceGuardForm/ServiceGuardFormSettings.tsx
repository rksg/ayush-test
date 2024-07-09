import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { StepsForm, Tooltip } from '@acx-ui/components'
import { get }                from '@acx-ui/config'

import * as contents from '../contents'

import * as FormItems from './FormItems'

export function ServiceGuardFormSettings () {
  const { $t } = useIntl()

  let title: React.ReactNode = $t(contents.steps.settings)

  if (get('IS_MLISA_SA')) {
    /* eslint-disable max-len */
    title = <>
      {title}
      <Tooltip.Question title={$t({ defaultMessage: `
        Service Validation requires SmartZone v5.2.1 (Virtual Client), v6.0 (Virtual Wireless Client) and above.
        If you are on exact v5.2.1 (Virtual Client) or v6.0 (Virtual Wireless Client),
        please contact Customer Support for a patch which is required to resolve a few known issues.
      ` })} />
    </>
    /* eslint-enable */
  }

  return <>
    <StepsForm.Title children={title} />
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
