import React, { useEffect, useState } from 'react'

import { Col, Form, FormInstance, Input, Row, Select, Space } from 'antd'
import TextArea                                               from 'antd/lib/input/TextArea'
import { useIntl }                                            from 'react-intl'

import { Button, Modal, ModalType, Subtitle }                                           from '@acx-ui/components'
import { useDpskNewConfigFlowParams }                                                   from '@acx-ui/rc/components'
import { useGetDpskListQuery, useLazySearchPersonaGroupListQuery, useMacRegListsQuery } from '@acx-ui/rc/services'
import { checkObjectNotExists, DpskSaveData, PersonaGroup }                             from '@acx-ui/rc/utils'

import MacRegistrationListForm
  from '../../../Policies/MacRegistrationList/MacRegistrationListForm/MacRegistrationListForm'
import DpskForm from '../../../Services/Dpsk/DpskForm/DpskForm'

export function PersonaGroupForm (props: {
  form: FormInstance,
  defaultValue?: PersonaGroup
}) {
  const { $t } = useIntl()
  const { form, defaultValue } = props
  const [macModalVisible, setMacModalVisible] = useState(false)
  const [dpskModalVisible, setDpskModalVisible] = useState(false)
  const dpskNewConfigFlowParams = useDpskNewConfigFlowParams()
  const onMacModalClose = () => setMacModalVisible(false)
  const onDpskModalClose = () => setDpskModalVisible(false)

  const dpskPoolList = useGetDpskListQuery({ params: dpskNewConfigFlowParams })

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
                  { max: 255 },
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
          <Col span={24}>
            <Subtitle level={4}>{$t({ defaultMessage: 'Services' })}</Subtitle>
          </Col>
          <Col span={21}>
            <Form.Item label={'DPSK Service'} required>
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
                        .filter(pool => !pool.identityId || pool.id === defaultValue?.dpskPoolId)
                        .map(pool => ({ value: pool.id, label: pool.name }))
                    }
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
