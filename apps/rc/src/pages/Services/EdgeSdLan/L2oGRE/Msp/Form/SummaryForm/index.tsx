import React from 'react'

import { Col, Row, Space } from 'antd'
import { find }            from 'lodash'
import { useIntl }         from 'react-intl'

import {
  Descriptions,
  SpaceWrapper,
  StepsForm,
  Subtitle,
  useStepFormContext
} from '@acx-ui/components'
import { EdgeMvSdLanFormNetwork } from '@acx-ui/rc/utils'

import { useEdgeSdLanContext }    from '../../../Form/EdgeSdLanContextProvider'
import { StyledAntdDescriptions } from '../../../styledComponents'
import { useEdgeMspSdLanContext } from '../EdgeMspSdLanContextProvider'
import { ApplyTo }                from '../GeneralForm'

export const SummaryForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext()
  const { allVenues } = useEdgeSdLanContext()
  const { allVenueTemplates } = useEdgeMspSdLanContext()
  const formValues = form.getFieldsValue(true)
  const applyTo = formValues.applyTo

  const activatedNetworks = (formValues.activatedNetworks ?? {}) as EdgeMvSdLanFormNetwork
  const networkVenueIds = Object.keys(activatedNetworks)
  const venueCount = networkVenueIds?.length ?? 0
  // eslint-disable-next-line max-len
  const activatedNetworkTemplates = (formValues.activatedNetworkTemplates ?? {}) as EdgeMvSdLanFormNetwork
  const networkTemplateVenueIds = Object.keys(activatedNetworkTemplates)
  const networkTemplateVenueCount = networkTemplateVenueIds?.length ?? 0

  return (
    <Row gutter={[10, 30]}>
      <Col span={24}>
        <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>
        <Subtitle level={3}>
          { $t({ defaultMessage: 'General' }) }
        </Subtitle>
        {
          applyTo.length === 1 &&
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
                {
                  applyTo.includes(ApplyTo.MY_ACCOUNT) ?
                    formValues.tunnelProfileName :
                    formValues.tunnelTemplateName
                }
              </StyledAntdDescriptions.Item>
              <StyledAntdDescriptions.Item
                label={$t({ defaultMessage: 'Destination RUCKUS Edge cluster' })}
              >
                {formValues.edgeClusterName}
              </StyledAntdDescriptions.Item>
            </StyledAntdDescriptions>
          </Space>
        }
        {
          applyTo.length >1 &&
          <StyledAntdDescriptions layout='vertical' >
            <StyledAntdDescriptions.Item
              label={$t({ defaultMessage: 'Service Name' })}
            >
              {formValues.name}
            </StyledAntdDescriptions.Item>
          </StyledAntdDescriptions>
        }
      </Col>
      {
        applyTo.length === 1 &&
        <Col span={24}>
          {
            applyTo.includes(ApplyTo.MY_ACCOUNT) &&
            <>
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
                            // eslint-disable-next-line max-len
                            venueName: find(allVenues, { id: venueId })?.name ?? '',
                            networkCount: networks.length
                          })
                        }
                      </React.Fragment>)}
                  </SpaceWrapper>
                </Descriptions.NoLabel>
              </Descriptions>
            </>
          }
          {
            applyTo.includes(ApplyTo.MY_CUSTOMERS) &&
            <>
              <Subtitle level={3}>
                {
                  // eslint-disable-next-line max-len
                  $t({ defaultMessage: '<VenueSingular></VenueSingular> Templates & Network Templates ({networkTemplatesVenueCount})' }, { networkTemplatesVenueCount: networkTemplateVenueCount })
                }
              </Subtitle>
              <Descriptions>
                <Descriptions.NoLabel>
                  <SpaceWrapper direction='vertical' size='small'>
                    {Object.entries(activatedNetworkTemplates)
                      .map(([venueId, networks]) => <React.Fragment key={venueId}>
                        {
                          // eslint-disable-next-line max-len
                          $t({ defaultMessage: '{venueName} ({ networkCount, plural, =0 {} one {{networkCount} network} other {{networkCount} networks}})' }, {
                            // eslint-disable-next-line max-len
                            venueName: find(allVenueTemplates, { id: venueId })?.name ?? '',
                            networkCount: networks.length
                          })
                        }
                      </React.Fragment>)}
                  </SpaceWrapper>
                </Descriptions.NoLabel>
              </Descriptions>
            </>
          }
        </Col>
      }
      {
        applyTo.length >1 &&
        <>
          {
            applyTo.includes(ApplyTo.MY_ACCOUNT) &&
            <>
              <Col span={24}>
                <Subtitle level={3}>
                  {
                    // eslint-disable-next-line max-len
                    $t({ defaultMessage: 'Own Account' })
                  }
                </Subtitle>
                <Space direction='vertical' size={18}>
                  <StyledAntdDescriptions layout='vertical' >
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
                            $t({ defaultMessage: '{venueName} ({ networkCount, plural, =0 {} one {{networkCount} network} other {{networkCount} networks}})' }, {
                            // eslint-disable-next-line max-len
                              venueName: find(allVenues, { id: venueId })?.name ?? '',
                              networkCount: networks.length
                            })
                          }
                        </React.Fragment>)}
                    </SpaceWrapper>
                  </Descriptions.NoLabel>
                </Descriptions>
              </Col>
            </>
          }
          {
            applyTo.includes(ApplyTo.MY_CUSTOMERS) &&
            <>
              <Col span={24}>
                <Subtitle level={3}>
                  {
                    // eslint-disable-next-line max-len
                    $t({ defaultMessage: 'Customers' })
                  }
                </Subtitle>
                <Space direction='vertical' size={18}>
                  <StyledAntdDescriptions layout='vertical' >
                    <StyledAntdDescriptions.Item
                      label={$t({ defaultMessage: 'Tunnel Profile (AP to Cluster)' })}
                    >
                      {formValues.tunnelTemplateName}
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
                    $t({ defaultMessage: '<VenueSingular></VenueSingular> Templates & Network Templates ({networkTemplatesVenueCount})' }, { networkTemplatesVenueCount: networkTemplateVenueCount })
                  }
                </Subtitle>
                <Descriptions>
                  <Descriptions.NoLabel>
                    <SpaceWrapper direction='vertical' size='small'>
                      {Object.entries(activatedNetworkTemplates)
                        .map(([venueId, networks]) => <React.Fragment key={venueId}>
                          {
                          // eslint-disable-next-line max-len
                            $t({ defaultMessage: '{venueName} ({ networkCount, plural, =0 {} one {{networkCount} network} other {{networkCount} networks}})' }, {
                            // eslint-disable-next-line max-len
                              venueName: find(allVenueTemplates, { id: venueId })?.name ?? '',
                              networkCount: networks.length
                            })
                          }
                        </React.Fragment>)}
                    </SpaceWrapper>
                  </Descriptions.NoLabel>
                </Descriptions>
              </Col>
            </>
          }
        </>
      }
    </Row>
  )
}