import React from 'react'

import { Form, Input, Col, Row, Select, Switch, Space } from 'antd'
import { useIntl }                                      from 'react-intl'

import { Button, SelectionControl }                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                                from '@acx-ui/feature-toggle'
import { ExpirationDateSelector }                                                from '@acx-ui/rc/components'
import { useAdaptivePolicySetListQuery, useLazyMacRegListsQuery }                from '@acx-ui/rc/services'
import { checkObjectNotExists, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                                 from '@acx-ui/react-router-dom'

export function MacRegistrationListSettingForm () {
  const { $t } = useIntl()
  const [ macRegList ] = useLazyMacRegListsQuery()
  const { policyId } = useParams()
  const policySetId = Form.useWatch('policySetId')

  const policyEnabled = useIsSplitOn(Features.POLICY_MANAGEMENT)

  const { data: policySetsData } = useAdaptivePolicySetListQuery(
    { payload: { page: 1, pageSize: '2147483647' } }, { skip: !policyEnabled })

  const nameValidator = async (value: string) => {
    const list = (await macRegList({
      params: { policyId },
      page: '1',
      pageSize: '10000'
    }).unwrap()).data.filter(n => n.id !== policyId)
      .map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value } , $t({ defaultMessage: 'Mac Registration List' }))
  }

  return (
    <Row>
      <Col span={10}>
        <Form.Item name='name'
          label={$t({ defaultMessage: 'Name' })}
          rules={[
            { required: true },
            { validator: (_, value) => nameValidator(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input/>}
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
          <Form.Item label={$t({ defaultMessage: 'Access Policy Set' })}>
            <Space direction='horizontal'>
              <Form.Item name='policySetId'
                noStyle
                valuePropName='value'
                rules={[
                  { message: $t({ defaultMessage: 'Please select Access Policy Set' }) }
                ]}
                children={
                  <Select style={{ minWidth: 250 }}
                    allowClear
                    placeholder={$t({ defaultMessage: 'Select...' })}
                    options={policySetsData?.data.map(set => ({ value: set.id, label: set.name }))}
                  />
                }
              />
              <Form.Item noStyle>
                {/* eslint-disable-next-line max-len */}
                <TenantLink to={getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.CREATE })}>
                  <Button type='link'>
                    {$t({ defaultMessage: 'Add Access Policy Set' })}
                  </Button>
                </TenantLink>
              </Form.Item>
            </Space>
          </Form.Item>
        </Col>
      }
    </Row>
  )
}
