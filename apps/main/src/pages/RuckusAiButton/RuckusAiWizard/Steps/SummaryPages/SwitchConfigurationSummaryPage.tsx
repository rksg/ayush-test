import { Col, Form, Row } from 'antd'
import _                  from 'lodash'
import { useIntl }        from 'react-intl'

import { Loader, Subtitle }              from '@acx-ui/components'
import { useGetVlanOnboardConfigsQuery } from '@acx-ui/rc/services'

export function SwitchConfigurationSummaryPage (
  props: {
    summaryId: string,
    summaryTitle: string
  }) {
  const { summaryTitle, summaryId } = props
  const { $t } = useIntl()

  const gptSummaryResult =
    useGetVlanOnboardConfigsQuery({ params: { id: summaryId } }, { skip: _.isEmpty(summaryId) })
  const data = gptSummaryResult.data

  return (
    <Loader states={[gptSummaryResult]}>
      <Row gutter={20}>
        <Col flex={1}>
          <Subtitle level={4}>
            {summaryTitle}
          </Subtitle>

          <Form.Item label={$t({ defaultMessage: 'VLAN Name:' })}
            children={data?.vlanName} />

          <Form.Item label={$t({ defaultMessage: 'VLAN ID:' })}
            children={data?.vlanId} />

        </Col>

      </Row>
    </Loader>
  )
}

