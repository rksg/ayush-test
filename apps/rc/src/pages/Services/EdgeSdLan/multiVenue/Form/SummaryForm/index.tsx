import React from 'react'

import { Col, Row, Space } from 'antd'
import { find }            from 'lodash'
import { useIntl }         from 'react-intl'

import { Descriptions, StepsForm, useStepFormContext, Subtitle, Loader } from '@acx-ui/components'
import { intlFormats }                                                   from '@acx-ui/formatter'
import { SpaceWrapper }                                                  from '@acx-ui/rc/components'
import { useVenuesListQuery }                                            from '@acx-ui/rc/services'
import { EdgeMvSdLanFormModel, EdgeMvSdLanFormNetwork }                  from '@acx-ui/rc/utils'

import { StyledAntdDescriptions } from './styledComponents'

export const SummaryForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EdgeMvSdLanFormModel>()
  const formValues = form.getFieldsValue(true)

  const { isGuestTunnelEnabled } = formValues
  const activatedNetworks = (formValues.activatedNetworks ?? {}) as EdgeMvSdLanFormNetwork
  const networkVenueIds = Object.keys(activatedNetworks)
  const venueCount = networkVenueIds.length

  const venuesListQuery = useVenuesListQuery({ payload: {
    fields: ['name', 'id'],
    filters: { id: networkVenueIds }
  } })

  return (
    <Loader states={[venuesListQuery]}>
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
                label={$t({ defaultMessage: 'Cluster' })}
              >
                {formValues.edgeClusterName}
              </StyledAntdDescriptions.Item>
              <StyledAntdDescriptions.Item
                label={$t({ defaultMessage: 'Tunnel guest traffic' })}
              >
                {$t(intlFormats.onOffFormat, { value: isGuestTunnelEnabled })}
              </StyledAntdDescriptions.Item>
              {isGuestTunnelEnabled &&
              <StyledAntdDescriptions.Item
                label={$t({ defaultMessage: 'DMZ Cluster' })}
              >
                {formValues.guestEdgeClusterName}
              </StyledAntdDescriptions.Item>
              }
            </StyledAntdDescriptions>
          </Space>
        </Col>

        <Col span={24}>
          <Subtitle level={4}>
            { $t({ defaultMessage: 'Tunnel' }) }
          </Subtitle>

          <Space direction='vertical' size={18}>
            <StyledAntdDescriptions layout='vertical' >
              <StyledAntdDescriptions.Item
                label={$t({ defaultMessage: 'Tunnel Profile (AP- Cluster tunnel)' })}
              >
                {formValues.tunnelProfileName}
              </StyledAntdDescriptions.Item>
            </StyledAntdDescriptions>
            {isGuestTunnelEnabled &&
            <StyledAntdDescriptions layout='vertical'>
              <StyledAntdDescriptions.Item
                label={$t({ defaultMessage: 'Tunnel Profile (Cluster- DMZ Cluster tunnel)' })}
              >
                {formValues.guestTunnelProfileName}
              </StyledAntdDescriptions.Item>
            </StyledAntdDescriptions>
            }
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
                      $t({ defaultMessage: '{venueName} ({ networkCount, plural, =0 {} one {{networkCount} network} other {{networkCount} networks}})' }, {
                        venueName: find(venuesListQuery.data?.data, { id: venueId })?.name ?? '',
                        networkCount: networks.length
                      })
                    }
                  </React.Fragment>)}
              </SpaceWrapper>
            </Descriptions.NoLabel>
          </Descriptions>
        </Col>
      </Row>
    </Loader>
  )
}
