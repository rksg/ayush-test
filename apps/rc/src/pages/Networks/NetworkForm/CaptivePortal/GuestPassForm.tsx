import {
  Col,
  Row
} from 'antd'
import { useIntl } from 'react-intl'

import { StepsForm }                             from '@acx-ui/components'
import { GuestNetworkTypeEnum, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'

import { DhcpCheckbox }     from './DhcpCheckbox'
import { RedirectUrlInput } from './RedirectUrlInput'


export function GuestPassForm () {
  const intl = useIntl()
  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>{intl.$t({ defaultMessage: 'Host Settings' })}</StepsForm.Title>
        <RedirectUrlInput></RedirectUrlInput>
        <DhcpCheckbox />
      </Col>
      <Col span={14}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL}
          networkPortalType={GuestNetworkTypeEnum.GuestPass}/>
      </Col>
    </Row>
  )
}
