import React, { useState } from 'react'

import { Col, Form, Input, Row, Select, Space } from 'antd'
import TextArea                                 from 'antd/lib/input/TextArea'
import { useIntl }                              from 'react-intl'

import { Button, Modal, ModalType, Subtitle } from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import {
  useAdaptivePolicySetListQuery,
  useLazySearchPersonaGroupListQuery
} from '@acx-ui/rc/services'
import { checkObjectNotExists, trailingNorLeadingSpaces } from '@acx-ui/rc/utils'
import { RolesEnum }                                      from '@acx-ui/types'
import { hasRoles }                                       from '@acx-ui/user'

import { AdaptivePolicySetForm } from '../../AdaptivePolicySetForm'

export function IdentityGroupSettingForm ({ modalMode }: { modalMode?: boolean }) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const id = Form.useWatch<string>('id', form)
  const [policyModalVisible, setPolicyModalVisible] = useState(false)
  const isPolicySetSupported = useIsSplitOn(Features.POLICY_IDENTITY_TOGGLE)
  const [searchPersonaGroupList] = useLazySearchPersonaGroupListQuery()

  const { data: policySetsData } = useAdaptivePolicySetListQuery({
    payload: { page: 1, pageSize: '2147483647' }
  })

  const nameValidator = async (name: string) => {
    try {
      const list = (await searchPersonaGroupList({
        params: { size: '2147483647', page: '0' },
        payload: { keyword: name }
      }, true).unwrap()).data
        .filter(g => g.id !== id)
        .map(g => ({ name: g.name }))
      return checkObjectNotExists(list, { name } , $t({ defaultMessage: 'Identity Group' }))
    } catch (e) {
      return Promise.resolve()
    }
  }

  return (
    <>
      <Space direction={'vertical'} size={16} style={{ display: 'flex' }}>
        <Form.Item name='id' noStyle>
          <Input type='hidden' />
        </Form.Item>
        <Row>
          <Col span={24}>
            <Subtitle level={4}>{$t({ defaultMessage: 'Settings' })}</Subtitle>
          </Col>
          <Col span={modalMode ? 8 :6}>
            <Form.Item
              name='name'
              label={$t({ defaultMessage: 'Identity Group Name' })}
              hasFeedback
              validateFirst
              validateTrigger={['onBlur']}
              rules={
                [
                  { required: true },
                  { max: 255 },
                  { validator: (_, value) => trailingNorLeadingSpaces(value) },
                  { validator: (_, value) => nameValidator(value) }
                ]
              }
              children={<Input />}
            />
            <Form.Item
              name='description'
              label={$t({ defaultMessage: 'Description' })}
              children={<TextArea rows={3} />}
              rules={[
                { max: 255 }
              ]}
            />
          </Col>
        </Row>
        <Row align={'middle'} gutter={8}>
          {
            isPolicySetSupported && <>
              <Col span={24}>
                <Subtitle level={4}>{$t({ defaultMessage: 'Services' })}</Subtitle>
              </Col>
              <Col span={modalMode ? 8 :6}>
                <Form.Item name='policySetId'
                  label={$t({ defaultMessage: 'Adaptive Policy Set' })}
                  rules={[
                    { message: $t({ defaultMessage: 'Please select Adaptive Policy Set' }) }
                  ]}
                  children={
                    <Select
                      allowClear
                      placeholder={$t({ defaultMessage: 'Select ...' })}
                      options={
                        policySetsData?.data.map(set => ({ value: set.id, label: set.name }))}
                    />
                  }
                />
              </Col>
              {
                hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]) &&
                <Col span={2}>
                  <Button
                    type={'link'}
                    onClick={() => setPolicyModalVisible(true)}
                  >
                    {$t({ defaultMessage: 'Add' })}
                  </Button>
                </Col>
              }
            </>
          }
        </Row>
      </Space>
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
    </>
  )
}
