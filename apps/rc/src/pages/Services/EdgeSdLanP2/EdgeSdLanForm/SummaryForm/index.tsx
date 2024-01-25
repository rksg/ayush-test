import React from 'react'

import { Col, Row, Space } from 'antd'
import { useIntl }         from 'react-intl'

import { Descriptions, StepsForm, useStepFormContext, Subtitle } from '@acx-ui/components'
import { intlFormats }                                           from '@acx-ui/formatter'
import { SpaceWrapper }                                          from '@acx-ui/rc/components'

import { EdgeSdLanFormModelP2 } from '..'

import { StyledAntdDescriptions } from './styledComponents'


export const SummaryForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EdgeSdLanFormModelP2>()
  const formValues = form.getFieldsValue(true)

  const { isGuestTunnelEnabled } = formValues
  const activatedNetworks = formValues.activatedNetworks ?? []
  const networkCount = activatedNetworks.length
  const activatedGuestNetworks = formValues.activatedGuestNetworks ?? []
  const guestNetworkCount = activatedGuestNetworks.length

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
              label={$t({ defaultMessage: 'Venue' })}
            >
              {formValues.venueName}
            </StyledAntdDescriptions.Item>
            <StyledAntdDescriptions.Item
              label={$t({ defaultMessage: 'Cluster' })}
            >
              {formValues.edgeName}
            </StyledAntdDescriptions.Item>
          </StyledAntdDescriptions>

          <StyledAntdDescriptions layout='vertical'>
            <StyledAntdDescriptions.Item
              label={$t({ defaultMessage: 'Tunnel guest traffic' })}
            >
              {$t(intlFormats.onOffFormat, { value: isGuestTunnelEnabled })}
            </StyledAntdDescriptions.Item>
            {isGuestTunnelEnabled &&
              <StyledAntdDescriptions.Item
                label={$t({ defaultMessage: 'DMZ Cluster' })}
              >
                {formValues.guestEdgeName}
              </StyledAntdDescriptions.Item>
            }
          </StyledAntdDescriptions>
        </Space>
      </Col>

      <Col span={24}>
        <Subtitle level={4}>
          { $t({ defaultMessage: 'Tunnel & Network' }) }
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
        <Space direction='horizontal' align='start'>
          <div>
            <Subtitle level={4}>
              { $t({ defaultMessage: 'Networks ({networkCount})' }, { networkCount }) }
            </Subtitle>
            <Descriptions>
              <Descriptions.NoLabel>
                <SpaceWrapper direction='vertical' size='small'>
                  {activatedNetworks
                    .map((item: { name: string }) => <React.Fragment key={item.name}>
                      {item.name}
                    </React.Fragment>)}
                </SpaceWrapper>
              </Descriptions.NoLabel>
            </Descriptions>
          </div>
          { isGuestTunnelEnabled &&
            <div>
              <Subtitle level={4}>
                { $t({ defaultMessage: 'Networks tunneling to DMZ ({guestNetworkCount})' },
                  { guestNetworkCount }) }
              </Subtitle>
              <Descriptions>
                <Descriptions.NoLabel>
                  <SpaceWrapper direction='vertical' size='small'>
                    {activatedGuestNetworks
                      .map((item: { name: string }) => <React.Fragment key={item.name}>
                        {item.name}
                      </React.Fragment>)}
                  </SpaceWrapper>
                </Descriptions.NoLabel>
              </Descriptions>
            </div>
          }
        </Space>
      </Col>
    </Row>
  )
}