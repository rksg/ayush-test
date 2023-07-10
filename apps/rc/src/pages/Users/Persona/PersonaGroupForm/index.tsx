import React, { useEffect, useState } from 'react'

import { Col, Form, FormInstance, Input, Row, Select, Space } from 'antd'
import TextArea                                               from 'antd/lib/input/TextArea'
import { useIntl }                                            from 'react-intl'

import { Button, Modal, ModalType, Subtitle }                                           from '@acx-ui/components'
import { useGetDpskListQuery, useLazySearchPersonaGroupListQuery, useMacRegListsQuery } from '@acx-ui/rc/services'
import { checkObjectNotExists, DpskSaveData, PersonaGroup }                             from '@acx-ui/rc/utils'

import MacRegistrationListForm
  from '../../../Policies/MacRegistrationList/MacRegistrationListForm/MacRegistrationListForm'
import DpskForm                                  from '../../../Services/Dpsk/DpskForm/DpskForm'
import { DpskPoolLink, MacRegistrationPoolLink } from '../LinkHelper'

export function PersonaGroupForm (props: {
  form: FormInstance,
  defaultValue?: PersonaGroup
}) {
  const { $t } = useIntl()
  const { form, defaultValue } = props
  const [macModalVisible, setMacModalVisible] = useState(false)
  const [dpskModalVisible, setDpskModalVisible] = useState(false)
  const onMacModalClose = () => setMacModalVisible(false)
  const onDpskModalClose = () => setDpskModalVisible(false)

  const dpskPoolList = useGetDpskListQuery({ })

  const { data: macRegistrationPoolList } = useMacRegListsQuery({
    payload: { sortField: 'name', sortOrder: 'ASC', page: 1, pageSize: 10000 }
  })

  const [searchPersonaGroupList] = useLazySearchPersonaGroupListQuery()

  const nameValidator = async (name: string) => {
    try {
      const list = (await searchPersonaGroupList({
        params: { size: '2147483647', page: '0' },
        payload: { keyword: name }
      }, true).unwrap()).data.filter(g => g.id !== defaultValue?.id).map(g => ({ name: g.name }))
      return checkObjectNotExists(list, { name } , $t({ defaultMessage: 'Persona Group' }))
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
              label={$t({ defaultMessage: 'Persona Group Name' })}
              hasFeedback
              validateFirst
              validateTrigger={['onBlur']}
              rules={
                [
                  { required: true },
                  { validator: (_, value) => nameValidator(value) }
                ]
              }
              children={<Input />}
            />
            <Form.Item
              name='description'
              label={$t({ defaultMessage: 'Description' })}
              children={<TextArea rows={3} maxLength={64} />}
            />
          </Col>
        </Row>
        <Row align={'middle'} gutter={8}>
          <Col span={24}>
            <Subtitle level={4}>{$t({ defaultMessage: 'Services' })}</Subtitle>
          </Col>
          <Col span={21}>
            <Form.Item label={'DPSK Service'} required>
              <Form.Item
                name='dpskPoolId'
                children={
                  !defaultValue?.dpskPoolId
                    ? <Select
                      disabled={!!defaultValue?.dpskPoolId}
                      placeholder={$t({ defaultMessage: 'Select...' })}
                      options={
                        dpskPoolList?.data?.data
                          .filter(pool => !pool.identityId)
                          .map(pool => ({ value: pool.id, label: pool.name }))
                      }
                    />
                    : <DpskPoolLink
                      name={dpskPoolList?.data?.data
                        ?.find(p => p.id === defaultValue?.dpskPoolId)?.name}
                      dpskPoolId={defaultValue?.dpskPoolId}
                    />
                }
                rules={
                  [{
                    required: true,
                    message: $t({ defaultMessage: 'Please select a DPSK Service' })
                  }]
                }
              />
            </Form.Item>
          </Col>
          <Col span={2}>
            {!defaultValue?.dpskPoolId &&
              <Button
                type={'link'}
                onClick={() => setDpskModalVisible(true)}
              >
                {$t({ defaultMessage: 'Add' })}
              </Button>
            }
          </Col>
          <Col span={21}>
            <Form.Item
              name='macRegistrationPoolId'
              valuePropName='value'
              label={$t({ defaultMessage: 'MAC Registration List' })}
              children={
                !defaultValue?.macRegistrationPoolId
                  ? <Select
                    allowClear
                    disabled={!!defaultValue?.macRegistrationPoolId}
                    placeholder={$t({ defaultMessage: 'Select...' })}
                    options={
                      macRegistrationPoolList?.data
                        ?.map(pool => ({ value: pool.id, label: pool.name }))
                    }
                  />
                  : <MacRegistrationPoolLink
                    name={macRegistrationPoolList?.data
                      ?.find(mac => mac.id === defaultValue.macRegistrationPoolId)?.name}
                    macRegistrationPoolId={defaultValue?.macRegistrationPoolId}
                  />
              }
            />
          </Col>
          <Col span={2}>
            {!defaultValue?.macRegistrationPoolId &&
              <Button
                type={'link'}
                onClick={() => setMacModalVisible(true)}
              >
                {$t({ defaultMessage: 'Add' })}
              </Button>
            }
          </Col>
        </Row>
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
    </Form>
  )
}
