import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'
import { SdLanTopologyVertical }         from '@acx-ui/edge/components'
import {
  servicePolicyNameRegExp
} from '@acx-ui/rc/utils'

import { ClusterFirmwareInfo }                           from '../../shared/ClusterFirmwareInfo'
import { tunnelProfileFieldName, TunnelProfileFormItem } from '../../shared/TunnelProfileFormItem'
import { useEdgeSdLanContext }                           from '../EdgeSdLanContextProvider'
import { StyledAntdDescriptions }                        from '../SummaryForm/styledComponents'

import * as UI from './styledComponents'

export const GeneralForm = () => {
  const { $t } = useIntl()
  const { form, editMode } = useStepFormContext()
  const { availableTunnelProfiles, associatedEdgeClusters } = useEdgeSdLanContext()
  const tunnelProfileId = Form.useWatch('tunnelProfileId', form)

  const currentTunnelProfile = availableTunnelProfiles.find((tunnelProfile) =>
    tunnelProfile.id === tunnelProfileId)

  const onTunnelProfileChange = (tunnelProfileId: string) => {
    const targetTunnelProfile = availableTunnelProfiles.find((tunnelProfile) =>
      tunnelProfile.id === tunnelProfileId)
    form.setFieldsValue({
      edgeClusterName: targetTunnelProfile?.destinationEdgeClusterName,
      tunnelProfileName: targetTunnelProfile?.name
    })
  }

  return (
    <UI.Wrapper>
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
    </UI.Wrapper>
  )
}
