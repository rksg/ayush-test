
import { Checkbox, Col, Form, Input, Row, Space } from 'antd'
import { useIntl }                                from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'
import { SdLanTopologyVertical }         from '@acx-ui/edge/components'
import { servicePolicyNameRegExp }       from '@acx-ui/rc/utils'

import { useEdgeSdLanContext }                                                    from '../../../Form/EdgeSdLanContextProvider'
import { ClusterFirmwareInfo }                                                    from '../../../shared/ClusterFirmwareInfo'
import { tunnelProfileFieldName, TunnelProfileFormItem, tunnelTemplateFieldName } from '../../../shared/TunnelProfileFormItem'
import { StyledAntdDescriptions, VerticalSplitLine, Wrapper }                     from '../../../styledComponents'
import { useEdgeMspSdLanContext }                                                 from '../EdgeMspSdLanContextProvider'

enum ApplyTo {
  MY_ACCOUNT = 'myAccount',
  MY_CUSTOMERS = 'myCustomers'
}

export const GeneralForm = () => {
  const { $t } = useIntl()
  const { form, editMode } = useStepFormContext()
  const { availableTunnelProfiles, associatedEdgeClusters } = useEdgeSdLanContext()
  const {
    availableTunnelTemplates,
    associatedEdgeClusters: templateAssociatedEdgeClusters
  } = useEdgeMspSdLanContext()
  const applyTo = Form.useWatch('applyTo', form)
  const tunnelProfileId = Form.useWatch('tunnelProfileId', form)
  const tunnelTemplateId = Form.useWatch('tunnelTemplateId', form)

  const currentTunnelProfile = availableTunnelProfiles.find((tunnelProfile) =>
    tunnelProfile.id === tunnelProfileId)
  const currentTunnelTemplate = availableTunnelProfiles.find((tunnelProfile) =>
    tunnelProfile.id === tunnelTemplateId)

  const onTunnelProfileChange = (tunnelProfileId: string) => {
    const targetTunnelProfile = availableTunnelProfiles.find((tunnelProfile) =>
      tunnelProfile.id === tunnelProfileId)
    form.setFieldsValue({
      edgeClusterName: targetTunnelProfile?.destinationEdgeClusterName,
      tunnelProfileName: targetTunnelProfile?.name
    })
  }

  return (
    <Wrapper>
      <Col span={12}>
        <Row>
          <Col span={18}>
            <StepsForm.Title>
              {$t({ defaultMessage: 'General' })}
            </StepsForm.Title>
            <Form.Item
              name='name'
              label={$t({ defaultMessage: 'Service Name' })}
              rules={[
                { required: true },
                { min: 2, max: 32 },
                { validator: (_, value) => servicePolicyNameRegExp(value) }
              ]}
              validateFirst
              children={<Input />}
            />
          </Col>
        </Row>
        <Row>
          <Col span={18}>
            <Form.Item
              name='applyTo'
              label={$t({ defaultMessage: 'Apply Service To' })}
              rules={[
                {
                  required: true,
                  message: $t({ defaultMessage: 'Please select at least one option' })
                }
              ]}
              validateFirst
              children={
                <Checkbox.Group style={{ width: '100%' }}
                  disabled={editMode}
                >
                  <Row gutter={[16, 20]}>
                    <Col span={24}>
                      <Space direction='vertical' style={{ width: '100%' }}>
                        <Checkbox value={ApplyTo.MY_ACCOUNT}>
                          {$t({ defaultMessage: 'My Account' })}
                        </Checkbox>
                        {
                          applyTo?.includes(ApplyTo.MY_ACCOUNT) && <>
                            <Row>
                              <Col offset={1} span={23}>
                                <TunnelProfileFormItem
                                  name={tunnelProfileFieldName}
                                  label={$t({ defaultMessage: 'Tunnel Profile (AP to Cluster)' })}
                                  onChange={onTunnelProfileChange}
                                  disabled={editMode}
                                  tunnelProfiles={availableTunnelProfiles}
                                  associatedEdgeClusters={associatedEdgeClusters}
                                />
                              </Col>
                            </Row>
                            {
                              tunnelProfileId &&
                              <Row>
                                <Col offset={1} span={23}>
                                  <StyledAntdDescriptions colon={false} layout='vertical' >
                                    <StyledAntdDescriptions.Item
                                      // eslint-disable-next-line max-len
                                      label={$t({ defaultMessage: 'Destination RUCKUS Edge cluster' })}
                                    >
                                      {currentTunnelProfile?.destinationEdgeClusterName}
                                    </StyledAntdDescriptions.Item>
                                  </StyledAntdDescriptions>
                                </Col>
                                <Col offset={1} span={23}>
                                  <ClusterFirmwareInfo
                                    clusterId={currentTunnelProfile?.destinationEdgeClusterId ?? ''}
                                  />
                                </Col>
                              </Row>
                            }
                          </>
                        }
                      </Space>
                    </Col>
                    <Col span={24}>
                      <Space direction='vertical' style={{ width: '100%' }}>
                        <Checkbox value={ApplyTo.MY_CUSTOMERS}>
                          {$t({ defaultMessage: 'My Customers' })}
                        </Checkbox>
                        {
                          applyTo?.includes(ApplyTo.MY_CUSTOMERS) && <>
                            <Row>
                              <Col offset={1} span={23}>
                                <TunnelProfileFormItem
                                  name={tunnelTemplateFieldName}
                                  // eslint-disable-next-line max-len
                                  label={$t({ defaultMessage: 'Tunnel Profile Template (AP to Cluster)' })}
                                  // onChange={onTunnelTemplateChange}
                                  disabled={editMode}
                                  tunnelProfiles={availableTunnelTemplates}
                                  associatedEdgeClusters={templateAssociatedEdgeClusters}
                                />
                              </Col>
                            </Row>
                            {
                              tunnelTemplateId &&
                              <Row>
                                <Col offset={1} span={23}>
                                  <StyledAntdDescriptions colon={false} layout='vertical' >
                                    <StyledAntdDescriptions.Item
                                      // eslint-disable-next-line max-len
                                      label={$t({ defaultMessage: 'Destination RUCKUS Edge cluster' })}
                                    >
                                      {currentTunnelTemplate?.destinationEdgeClusterName}
                                    </StyledAntdDescriptions.Item>
                                  </StyledAntdDescriptions>
                                </Col>
                                <Col offset={1} span={23}>
                                  <ClusterFirmwareInfo
                                    // eslint-disable-next-line max-len
                                    clusterId={currentTunnelTemplate?.destinationEdgeClusterId ?? ''}
                                  />
                                </Col>
                              </Row>
                            }
                          </>
                        }
                      </Space>
                    </Col>
                  </Row>
                </Checkbox.Group>
              }
            />
          </Col>
        </Row>
      </Col>
      <VerticalSplitLine span={1} />
      <Col span={10}>
        <SdLanTopologyVertical />
      </Col>
    </Wrapper>
  )
}