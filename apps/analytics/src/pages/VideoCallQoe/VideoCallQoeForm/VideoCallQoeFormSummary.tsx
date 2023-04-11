import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import {
  Subtitle
} from '@acx-ui/components'

import * as FormItems from './FormItems'

export function VideoCallQoeFormSummary ({ link }: { link: string }) {
  const { $t } = useIntl()
  return <>
    <Subtitle level={4}>
      { $t({ defaultMessage: 'Summary' }) }
    </Subtitle>
    <Row gutter={20}>
      <Col span={12} xl={10} xxl={8}>
        <FormItems.TestName.FieldSummary />
        <FormItems.TestLink
          link={link} />
        <FormItems.Prerequisites/>
        <FormItems.Disclaimer/>
      </Col>
    </Row>
  </>
}
