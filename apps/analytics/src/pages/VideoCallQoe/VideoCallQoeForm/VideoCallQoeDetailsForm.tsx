import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import {
  Subtitle
} from '@acx-ui/components'

import * as FormItems from './FormItems'

export function VideoCallQoeDetailsForm ({ link }: { link: string }) {
  const { $t } = useIntl()
  return <>
    <Subtitle level={4}>
      { $t({ defaultMessage: 'Test Details' }) }
    </Subtitle>
    <Row gutter={20}>
      <Col xl={13} xxl={11}>
        <FormItems.TestName.FieldSummary />
        <FormItems.TestLink link={link} />
        <FormItems.Prerequisites/>
        <FormItems.Disclaimer/>
      </Col>
    </Row>
  </>
}
