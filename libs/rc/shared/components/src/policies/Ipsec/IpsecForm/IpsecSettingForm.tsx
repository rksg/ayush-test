
import { useMemo } from 'react'

import { Col, Form, Input, Radio, Row, Space } from 'antd'
import { isNil }                               from 'lodash'
import { useIntl }                             from 'react-intl'

import { Loader, Tooltip }                                                from '@acx-ui/components'
import { Features }                                                       from '@acx-ui/feature-toggle'
import { useGetIpsecViewDataListQuery, useLazyGetIpsecViewDataListQuery } from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  getTunnelUsageTypeOptions,
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

  const { ipsecViewData } = useGetIpsecViewDataListQuery({
    payload: {
      // eslint-disable-next-line max-len
      fields: ['name', 'id', 'activations', 'apActivations', 'venueActivations', 'tunnelActivations'],
      filters: { id: [policyId] },
      pageSize: 1
    }
  }, {
    skip: !policyId || !isEdgeVxLanIpsecReady,
    selectFromResult: ({ data }) => ({ ipsecViewData: data?.data[0] })
  })

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

  const isTunnelUsageTypeDisabled = useMemo(() => {
    if (!isEdgeVxLanIpsecReady) return true
    const hasActivations = Boolean(ipsecViewData?.tunnelActivations?.length
      || ipsecViewData?.activations?.length
      || ipsecViewData?.apActivations?.length || ipsecViewData?.venueActivations?.length)

    return editMode && hasActivations
  }, [editMode, ipsecViewData])

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
            <Radio.Group disabled={isTunnelUsageTypeDisabled}>
              <Tooltip title={isTunnelUsageTypeDisabled
                // eslint-disable-next-line max-len
                ? $t({ defaultMessage: 'This is in use by a tunnel profile, AP, or <venueSingular></venueSingular>. Please remove its activation before making changes.' })
                : undefined}
              >
                <Space direction='vertical'>
                  {
                    getTunnelUsageTypeOptions().map(o =>
                      <Radio key={o.value} value={o.value}>{o.label}</Radio>)
                  }
                </Space>
              </Tooltip>
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