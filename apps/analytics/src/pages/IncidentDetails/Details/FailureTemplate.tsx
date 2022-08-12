import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import {
  calculateSeverity,
  Incident,
  useShortDescription
} from '@acx-ui/analytics/utils'
import { PageHeader, SeverityPill } from '@acx-ui/components'

import * as UI from './styledComponents'

export const IncidentDetailsTemplate = (props: Incident) => {
  const { $t } = useIntl()

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Incident Details' })}
        titleExtra={<SeverityPill severity={calculateSeverity(props.severity)!} />}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Incidents' }), link: '/analytics/incidents' }
        ]}
        subTitle={<p>{useShortDescription(props)}</p>}
      />
      <Row gutter={[20, 20]}>
        <Col span={4}>
          <UI.FixedAutoSizer>
            {({ width }) => (
              <div style={{ width }}>incident attributes</div>
            )}
          </UI.FixedAutoSizer>
        </Col>
        <Col span={20}>
          <div>insights</div>
        </Col>
        <Col offset={4} span={20}>
          <div>network impact</div>
        </Col>
        <Col offset={4} span={20}>
          <div>charts</div>
        </Col>
      </Row>
    </>
  )
}

export default IncidentDetailsTemplate
