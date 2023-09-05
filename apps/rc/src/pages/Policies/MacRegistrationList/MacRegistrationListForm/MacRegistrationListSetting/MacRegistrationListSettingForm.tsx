import React, { useState } from 'react'

import { Form, Input, Col, Row, Select, Switch, Space } from 'antd'
import { useIntl }                                      from 'react-intl'

import { Modal, ModalType, SelectionControl } from '@acx-ui/components'
import { Features, useIsTierAllowed }         from '@acx-ui/feature-toggle'
import { ExpirationDateSelector }             from '@acx-ui/rc/components'
import {
  useAdaptivePolicySetListQuery,
  useLazySearchMacRegListsQuery
} from '@acx-ui/rc/services'
import { checkObjectNotExists, trailingNorLeadingSpaces } from '@acx-ui/rc/utils'
import { useParams }                                      from '@acx-ui/react-router-dom'

import AdaptivePolicySetForm
  from '../../../AdaptivePolicy/AdaptivePolicySet/AdaptivePolicySetFom/AdaptivePolicySetForm'

export function MacRegistrationListSettingForm () {
  const { $t } = useIntl()
  const [ macRegList ] = useLazySearchMacRegListsQuery()
  const { policyId } = useParams()
  const policySetId = Form.useWatch('policySetId')
  const [policyModalVisible, setPolicyModalVisible] = useState(false)
  const policyEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const form = Form.useFormInstance()

  const { data: policySetsData } = useAdaptivePolicySetListQuery(
    { payload: { page: 1, pageSize: '2147483647' } }, { skip: !policyEnabled })

  const nameValidator = async (value: string) => {
    const list = (await macRegList({
      params: { policyId },
      payload: {
        page: 1, pageSize: 10,
        dataOption: 'all',
        searchCriteriaList: [
          {
            filterKey: 'name',
            operation: 'eq',
            value: value
          }
        ]
      }
    }).unwrap()).data.filter(n => n.id !== policyId)
      .map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value } , $t({ defaultMessage: 'Mac Registration List' }))
  }

  return (
    <>
      <Row>
        <Col span={10}>
          <Form.Item name='name'
            label={$t({ defaultMessage: 'Name' })}
            rules={[
              { required: true },
              { max: 255 },
              { validator: (_, value) => nameValidator(value) },
              { validator: (_, value) => trailingNorLeadingSpaces(value) }
            ]}
            validateFirst
            hasFeedback
            children={<Input/>}
            validateTrigger={'onBlur'}
          />
          <ExpirationDateSelector
            inputName={'expiration'}
            label={$t({ defaultMessage: 'List Expiration' })}
          />
          <Form.Item name='autoCleanup'
            valuePropName='checked'
            initialValue={true}
            label={$t({ defaultMessage: 'Automatically clean expired entries' })}>
            <Switch/>
          </Form.Item>
        </Col>
        {policyEnabled &&
        <Col span={24}>
          <Form.Item label={$t({ defaultMessage: 'Adaptive Policy Set' })}>
            <Space direction='horizontal'>
              <Form.Item name='policySetId'
                noStyle
                valuePropName='value'
                rules={[
                  { message: $t({ defaultMessage: 'Please select Adaptive Policy Set' }) }
                ]}
                children={
                  <Select style={{ minWidth: 250 }}
                    allowClear
                    placeholder={$t({ defaultMessage: 'Select...' })}
                    options={policySetsData?.data.map(set => ({ value: set.id, label: set.name }))}
                  />
                }
              />
            </Space>
          </Form.Item>
          {policySetId &&
            <Form.Item name='defaultAccess'
              label={$t({ defaultMessage: 'Default Access' })}
              initialValue='ACCEPT'>
              <SelectionControl
                options={[{ value: 'ACCEPT', label: $t({ defaultMessage: 'ACCEPT' }) },
                  { value: 'REJECT', label: $t({ defaultMessage: 'REJECT' }) }]}
              />
            </Form.Item>
          }
        </Col>
        }
      </Row>
      {policyEnabled &&
        <Modal
          title={$t({ defaultMessage: 'Add Adaptive Policy Set' })}
          visible={policyModalVisible}
          type={ModalType.ModalStepsForm}
          children={<AdaptivePolicySetForm
            modalMode
            modalCallBack={(addedPolicySetId?: string) => {
              if (addedPolicySetId) {
                form.setFieldValue('policySetId', addedPolicySetId)
              }
              setPolicyModalVisible(false)
            }}
          />}
          onCancel={() => setPolicyModalVisible(false)}
          width={1200}
          destroyOnClose={true}
        />
      }
    </>
  )
}
