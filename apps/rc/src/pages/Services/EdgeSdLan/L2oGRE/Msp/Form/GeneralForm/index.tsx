import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { Select, StepsForm, useStepFormContext } from '@acx-ui/components'
import { SdLanTopologyVertical }                 from '@acx-ui/edge/components'
import { servicePolicyNameRegExp }               from '@acx-ui/rc/utils'

import { ClusterFirmwareInfo }             from '../../../Form/GeneralForm'
import * as UI                             from '../../../styledComponents'
import { StyledAntdDescriptions, Wrapper } from '../../../styledComponents'


export const GeneralForm = () => {
  const { $t } = useIntl()
  const { form, editMode } = useStepFormContext<EdgeMvSdLanFormModel>()
  const tunnelProfileId = Form.useWatch('tunnelProfileId', form)

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
              name='tunnelProfileId'
              label={$t({ defaultMessage: 'Tunnel Profile (AP to Cluster)' })}
              rules={[
                {
                  required: true,
                  message: $t({ defaultMessage: 'Please select a Tunnel Profile' })
                },
                { validator: (_, value) => checkCorePortConfigured(value) }
              ]}
            >
              <Select
                options={tunnelProfileOptions}
                placeholder={$t({ defaultMessage: 'Select ...' })}
                onChange={onTunnelProfileChange}
                disabled={editMode}
              />
            </Form.Item>
          </Col>
        </Row>
        {
          tunnelProfileId &&
          <Row>
            <Col span={18}>
              <StyledAntdDescriptions colon={false} layout='vertical' >
                <StyledAntdDescriptions.Item
                  label={$t({ defaultMessage: 'Destination RUCKUS Edge cluster' })}
                >
                  {currentTunnelProfile?.destinationEdgeClusterName}
                </StyledAntdDescriptions.Item>
              </StyledAntdDescriptions>
            </Col>
            <Col span={24}>
              <ClusterFirmwareInfo
                clusterId={currentTunnelProfile?.destinationEdgeClusterId ?? ''}
              />
            </Col>
          </Row>
        }
      </Col>
      <UI.VerticalSplitLine span={1} />
      <Col span={10}>
        <SdLanTopologyVertical />
      </Col>
    </Wrapper>
  )
}