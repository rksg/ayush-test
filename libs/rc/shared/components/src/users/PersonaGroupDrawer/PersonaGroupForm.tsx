import { useEffect, useState } from 'react'

import { Col, Form, FormInstance, Input, Row, Select, Space } from 'antd'
import TextArea                                               from 'antd/lib/input/TextArea'
import { useIntl }                                            from 'react-intl'

import { Button, Modal, ModalType, Subtitle } from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import {
  useAdaptivePolicySetListQuery,
  useGetEnhancedDpskListQuery,
  useLazyQueryIdentityGroupTemplatesQuery,
  useLazySearchPersonaGroupListQuery,
  useSearchMacRegListsQuery
} from '@acx-ui/rc/services'
import {
  DpskSaveData,
  PersonaGroup,
  ServiceOperation,
  ServiceType,
  checkObjectNotExists,
  hasServicePermission,
  trailingNorLeadingSpaces,
  getPolicyAllowedOperation, PolicyType, PolicyOperation,
  useConfigTemplate,
  useConfigTemplateLazyQueryFnSwitcher
} from '@acx-ui/rc/utils'
import { RolesEnum }                      from '@acx-ui/types'
import { hasAllowedOperations, hasRoles } from '@acx-ui/user'

import { AdaptivePolicySetForm }   from '../../AdaptivePolicySetForm'
import { MacRegistrationListForm } from '../../policies/MacRegistrationListForm'
import { DpskForm }                from '../../services/DpskForm/DpskForm'


const macRegSearchDefaultPayload = {
  dataOption: 'all',
  searchCriteriaList: [
    {
      filterKey: 'name',
      operation: 'cn',
      value: ''
    }
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 10000
}

export function PersonaGroupForm (props: {
  form: FormInstance,
  defaultValue?: PersonaGroup,
  requiredDpsk?: boolean
}) {
  const { $t } = useIntl()
  const { form, defaultValue, requiredDpsk } = props
  const { isTemplate } = useConfigTemplate()

  const [macModalVisible, setMacModalVisible] = useState(false)
  const [dpskModalVisible, setDpskModalVisible] = useState(false)
  const [policyModalVisible, setPolicyModalVisible] = useState(false)

  const onMacModalClose = () => setMacModalVisible(false)
  const onDpskModalClose = () => setDpskModalVisible(false)
  const isPolicySetSupported = useIsSplitOn(Features.POLICY_IDENTITY_TOGGLE)
  const isDpskRequiredGroupEnabled = useIsSplitOn(Features.DPSK_REQUIRE_IDENTITY_GROUP)
  const isMacRequiredGroupEnabled
    = useIsSplitOn(Features.MAC_REGISTRATION_REQUIRE_IDENTITY_GROUP_TOGGLE)
  let hasServices = isPolicySetSupported
    || !(isMacRequiredGroupEnabled && isDpskRequiredGroupEnabled)

  const dpskPoolList = useGetEnhancedDpskListQuery({
    payload: { sortField: 'name', sortOrder: 'ASC', page: 1, pageSize: 10000 }
  }, { skip: isDpskRequiredGroupEnabled })

  const { data: macRegistrationPoolList } = useSearchMacRegListsQuery({
    payload: macRegSearchDefaultPayload
  }, { skip: isMacRequiredGroupEnabled })

  const [searchPersonaGroupList] = useConfigTemplateLazyQueryFnSwitcher({
    useLazyQueryFn: useLazySearchPersonaGroupListQuery,
    useLazyTemplateQueryFn: useLazyQueryIdentityGroupTemplatesQuery
  })

  const { data: policySetsData } = useAdaptivePolicySetListQuery({
    payload: { page: 1, pageSize: '2147483647' }
  }, { skip: !isPolicySetSupported })

  const nameValidator = async (name: string) => {
    try {
      const list = (await searchPersonaGroupList({
        params: { size: '2147483647', page: '0' },
        payload: { keyword: name }
      }, true).unwrap()).data.filter(g => g.id !== defaultValue?.id).map(g => ({ name: g.name }))
      return checkObjectNotExists(list, { name } , $t({ defaultMessage: 'Identity Group' }))
    } catch (e) {
      return Promise.resolve()
    }
  }

  useEffect(() => {
    if (defaultValue) {
      form.setFieldsValue(defaultValue)
    }
  }, [defaultValue])

  return (
    <Form
      form={form}
      preserve={false}
      layout={'vertical'}
      name={'personaGroupForm'}
      initialValues={defaultValue}
    >
      <Space direction={'vertical'} size={16} style={{ display: 'flex' }}>
        <Row>
          <Col span={21}>
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

        {!isTemplate && hasServices &&
          <Row align={'middle'} gutter={8}>
            <Col span={24}>
              <Subtitle level={4}>{$t({ defaultMessage: 'Services' })}</Subtitle>
            </Col>
            {!isDpskRequiredGroupEnabled && <>
              <Col span={21}>
                <Form.Item label={'DPSK Service'} required={!!requiredDpsk}>
                  <Form.Item
                    name='dpskPoolId'
                    children={
                      <Select
                        disabled={!!defaultValue?.dpskPoolId}
                        placeholder={$t({ defaultMessage: 'Select...' })}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={
                          dpskPoolList?.data?.data
                            .filter(p => !p.identityId || p.id === defaultValue?.dpskPoolId)
                            .map(pool => ({ value: pool.id, label: pool.name }))
                        }
                      />
                    }
                    rules={
                      [{
                        required: !!requiredDpsk,
                        message: $t({ defaultMessage: 'Please select a DPSK Service' })
                      }]
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                {!defaultValue?.dpskPoolId
                  && hasServicePermission({ type: ServiceType.DPSK, oper: ServiceOperation.CREATE })
                  && <Button
                    data-testid='addDpskButton'
                    type={'link'}
                    onClick={() => setDpskModalVisible(true)}
                  >
                    {$t({ defaultMessage: 'Add' })}
                  </Button>
                }
              </Col>
            </>
            }

            {!isMacRequiredGroupEnabled && <>
              <Col span={21}>
                <Form.Item
                  name='macRegistrationPoolId'
                  valuePropName='value'
                  label={$t({ defaultMessage: 'MAC Registration List' })}
                  children={
                    <Select
                      allowClear
                      disabled={!!defaultValue?.macRegistrationPoolId}
                      placeholder={$t({ defaultMessage: 'Select...' })}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={
                        macRegistrationPoolList?.data
                          ?.map(pool => ({ value: pool.id, label: pool.name }))
                      }
                    />
                  }
                />
              </Col>
              <Col span={2}>
                {!defaultValue?.macRegistrationPoolId &&
              <Button
                data-testid='addMacPoolButton'
                type={'link'}
                onClick={() => setMacModalVisible(true)}
              >
                {$t({ defaultMessage: 'Add' })}
              </Button>
                }
              </Col>
            </>
            }

            {
              isPolicySetSupported && <>
                <Col span={21}>
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
                  (hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]) &&
                    // eslint-disable-next-line max-len
                    hasAllowedOperations(getPolicyAllowedOperation(PolicyType.ADAPTIVE_POLICY_SET, PolicyOperation.CREATE) ?? [])) &&
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
        }

      </Space>

      <Modal
        title={$t({ defaultMessage: 'Add DPSK service' })}
        visible={dpskModalVisible}
        type={ModalType.ModalStepsForm}
        children={<DpskForm
          modalMode
          modalCallBack={(result?: DpskSaveData) => {
            if (result) {
              form.setFieldValue('dpskPoolId', result.id)
            }
            onDpskModalClose()
          }}
        />}
        onCancel={onDpskModalClose}
        width={1200}
        destroyOnClose={true}
      />

      <Modal
        title={$t({ defaultMessage: 'Add MAC Registration List' })}
        visible={macModalVisible}
        type={ModalType.ModalStepsForm}
        children={<MacRegistrationListForm
          modalMode
          modalCallBack={(result) => {
            form.setFieldValue('macRegistrationPoolId', result?.id)
            onMacModalClose()
          }}
        />}
        onCancel={onMacModalClose}
        width={1200}
        destroyOnClose={true}
      />

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
    </Form>
  )
}
