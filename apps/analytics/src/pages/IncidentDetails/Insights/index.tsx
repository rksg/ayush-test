import React, { useState } from 'react'
import { Col, Row }                  from 'antd'
import { IncidentDetailsProps } from '../types'
import { PageHeader }           from '@acx-ui/components'
import { useIntl } from 'react-intl'
import { BulbOutlined } from '@acx-ui/icons'
import * as UI from '../syledComponents'

export const Insights = (props: IncidentDetailsProps) => {
  const { $t } = useIntl()
  console.log(props.code)
  return (
    <UI.InsightComponent>
    {/* <PageHeader
      title={$t({ defaultMessage: 'Insights' })}
      sideHeader={<BulbOutlined />}
      style={{borderRadius: '12px;'}}
    /> */}
    <UI.InsightHeader 
      title={$t({ defaultMessage: 'Insights' })}
      extra={<BulbOutlined />}
      style={{borderRadius: '12px;'}}
    />
    <Row>
      <UI.InsightDetails span={8}>
        <div>Root Cause Analysis</div>
        <ol>
          <li>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</li>
          <li>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</li>
          <li>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</li>
          <li>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</li>
          <li>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</li>
          <li>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</li>
          <li>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</li>
        </ol>
      </UI.InsightDetails>
      <UI.InsightDetails span={8}>
        <div>Recommended Action</div>
        {/* <ol>
          <li>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</li>
          <li>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</li>
          <li>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</li>
          <li>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</li>
          <li>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</li>
          <li>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</li>
          <li>testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest</li>
        </ol> */}
      </UI.InsightDetails>
    </Row>
    </UI.InsightComponent>
  )
}
