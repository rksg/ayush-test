import React from 'react'

import { Col, Row, Space } from 'antd'
import { find }            from 'lodash'
import { useIntl }         from 'react-intl'

import { Descriptions, SpaceWrapper, StepsForm, Subtitle, useStepFormContext } from '@acx-ui/components'
import { EdgeMvSdLanFormModel, EdgeMvSdLanFormNetwork }                        from '@acx-ui/rc/utils'

import { useEdgeSdLanContext } from '../EdgeSdLanContextProvider'

import { StyledAntdDescriptions } from './styledComponents'

export const SummaryForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EdgeMvSdLanFormModel>()
  const { allVenues } = useEdgeSdLanContext()
  const formValues = form.getFieldsValue(true)

  const activatedNetworks = (formValues.activatedNetworks ?? {}) as EdgeMvSdLanFormNetwork
  const networkVenueIds = Object.keys(activatedNetworks)
  const venueCount = networkVenueIds.length

  return (
    <Row gutter={[10, 30]}>
      <Col span={24}>
        <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>
        <Subtitle level={4}>
          { $t({ defaultMessage: 'General' }) }
        </Subtitle>
        <Space direction='vertical' size={18}>
          <StyledAntdDescriptions layout='vertical' >
            <StyledAntdDescriptions.Item
              label={$t({ defaultMessage: 'Service Name' })}
            >
              {formValues.name}
            </StyledAntdDescriptions.Item>
            <StyledAntdDescriptions.Item
              label={$t({ defaultMessage: 'Tunnel Profile (AP to Cluster)' })}
            >
              {formValues.tunnelProfileName}
            </StyledAntdDescriptions.Item>
            <StyledAntdDescriptions.Item
              label={$t({ defaultMessage: 'Destination RUCKUS Edge cluster' })}
            >
              {formValues.edgeClusterName}
            </StyledAntdDescriptions.Item>
          </StyledAntdDescriptions>
        </Space>
      </Col>
      <Col span={24}>
        <Subtitle level={4}>
          {
            // eslint-disable-next-line max-len
            $t({ defaultMessage: '<VenuePlural></VenuePlural> & Networks ({venueCount})' }, { venueCount })
          }
        </Subtitle>
        <Descriptions>
          <Descriptions.NoLabel>
            <SpaceWrapper direction='vertical' size='small'>
              {Object.entries(activatedNetworks)
                .map(([venueId, networks]) => <React.Fragment key={venueId}>
                  {
                    // eslint-disable-next-line max-len
                    $t({ defaultMessage: '{venueName} ({ networkCount, plural, =0 {} one {{networkCount} network} other {{networkCount} network}})' }, {
                      venueName: find(allVenues, { id: venueId })?.name ?? '',
                      networkCount: networks.length
                    })
                  }
                </React.Fragment>)}
            </SpaceWrapper>
          </Descriptions.NoLabel>
        </Descriptions>
      </Col>
    </Row>
  )
}
