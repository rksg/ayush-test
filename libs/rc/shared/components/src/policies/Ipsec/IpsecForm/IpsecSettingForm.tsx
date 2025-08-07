
import { Col, Form, Input, Radio, Row, Space } from 'antd'
import { isNil }                               from 'lodash'
import { useIntl }                             from 'react-intl'

import { Loader }                           from '@acx-ui/components'
import { Features }                         from '@acx-ui/feature-toggle'
import { useLazyGetIpsecViewDataListQuery } from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  Ipsec,
  IpSecTunnelUsageTypeEnum,
  servicePolicyNameRegExp,
  useIsEdgeFeatureReady
} from '@acx-ui/rc/utils'

import { VxLanSettingForm }   from './EdgeIpSecForm'
import { SoftGreSettingForm } from './SoftGreSettingForm'

interface IpsecSettingFormProps {
  editData?: Ipsec
  isLoading?: boolean
}

export const IpsecSettingForm = (props: IpsecSettingFormProps) => {
  const { $t } = useIntl()
  const isEdgeVxLanIpsecReady = useIsEdgeFeatureReady(Features.EDGE_IPSEC_VXLAN_TOGGLE)

  const { editData, isLoading = false } = props
  const policyId = editData?.id
  const editMode = !!policyId

  const [ getIpsecViewDataList ] = useLazyGetIpsecViewDataListQuery()

  const nameValidator = async (value: string) => {
    const payload = {
      fields: ['name', 'id'],
      searchTargetFields: ['name'],
      filters: {},
      pageSize: 10_000,
      searchString: value }
    // eslint-disable-next-line max-len
    const list = (await getIpsecViewDataList({ payload }).unwrap()).data.filter(n => n.id !== policyId).map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value }, $t({ defaultMessage: 'IPsec' }))
  }

  return (
    <Loader states={[{ isLoading }]}>
      <Row>
        <Col span={12}>
          <Form.Item
            name='name'
            label={$t({ defaultMessage: 'Profile Name' })}
            rules={[
              { required: true },
              { min: 2 },
              { max: 32 },
              { validator: (_, value) => servicePolicyNameRegExp(value) },
              { validator: (_, value) => nameValidator(value) }
            ]}
            validateFirst
            hasFeedback
            validateTrigger={'onBlur'}
            children={<Input/>}
          />

          { isEdgeVxLanIpsecReady &&
          <Form.Item
            name='tunnelUsageType'
            label={$t({ defaultMessage: 'Tunnel Usage Type' })}
          >
            <Radio.Group disabled={editMode}>
              <Space direction='vertical'>
                <Radio value={IpSecTunnelUsageTypeEnum.VXLAN_GPE}>
                  {$t({ defaultMessage: 'For RUCKUS Devices(VxLAN GPE)' })}
                </Radio>
                <Radio value={IpSecTunnelUsageTypeEnum.SOFT_GRE}>
                  {$t({ defaultMessage: 'For 3rd Party Devices(SoftGRE)' })}
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>}
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          {
            isEdgeVxLanIpsecReady
              ? <Form.Item dependencies={['tunnelUsageType']}>
                {({ getFieldValue }) => {
                  const tunnelUsageType = getFieldValue('tunnelUsageType')
                  if (isNil(tunnelUsageType)) return null

                  return tunnelUsageType === IpSecTunnelUsageTypeEnum.VXLAN_GPE
                    ? <VxLanSettingForm editData={editData} />
                    : <SoftGreSettingForm editData={editData} />
                }}
              </Form.Item>
              : <SoftGreSettingForm editData={editData} />
          }
        </Col>
      </Row>
    </Loader>
  )
}