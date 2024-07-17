import React from 'react'

import { Col, Row, Space } from 'antd'
import { useIntl }         from 'react-intl'

import { Descriptions, StepsForm, useStepFormContext, Subtitle } from '@acx-ui/components'
import { SpaceWrapper }                                          from '@acx-ui/rc/components'

import { EdgeSdLanFormModel } from '..'

import { StyledAntdDescriptions } from './styledComponents'


export const SummaryForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EdgeSdLanFormModel>()
  const formValues = form.getFieldsValue(true)

  const activatedNetworks = formValues.activatedNetworks ?? []
  const networkCount = activatedNetworks.length

  return (
    <Row gutter={[10, 30]}>
      <Col span={24}>
        <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>

        <Subtitle level={4}>
          { $t({ defaultMessage: 'Settings' }) }
        </Subtitle>

        <Space direction='vertical' size={18}>
          <StyledAntdDescriptions layout='vertical' >
            <StyledAntdDescriptions.Item
              label={$t({ defaultMessage: 'Service Name' })}
            >
              {formValues.name}
            </StyledAntdDescriptions.Item>
            <StyledAntdDescriptions.Item
              label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
            >
              {formValues.venueName}
            </StyledAntdDescriptions.Item>
            <StyledAntdDescriptions.Item
              label={$t({ defaultMessage: 'SmartEdge' })}
            >
              {formValues.edgeName}
            </StyledAntdDescriptions.Item>
          </StyledAntdDescriptions>

          <StyledAntdDescriptions layout='vertical'>
            <StyledAntdDescriptions.Item
              label={$t({ defaultMessage: 'Tunnel Profile' })}
            >
              {formValues.tunnelProfileName}
            </StyledAntdDescriptions.Item>
          </StyledAntdDescriptions>
        </Space>
      </Col>

      <Col span={24}>
        <Subtitle level={4}>
          { $t({ defaultMessage: 'Networks ({networkCount})' }, { networkCount }) }
        </Subtitle>
        <Descriptions>
          <Descriptions.NoLabel>
            <SpaceWrapper direction='vertical' size='small'>
              {activatedNetworks.map((item: { name: string }) => <React.Fragment key={item.name}>
                {item.name}
              </React.Fragment>)}
            </SpaceWrapper>
          </Descriptions.NoLabel>
        </Descriptions>
      </Col>
    </Row>
  )
}
