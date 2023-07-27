import React, { useEffect, useState } from 'react'

import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'

import { Button, GridCol, GridRow, Modal, ModalType } from '@acx-ui/components'
import { useMacRegListsQuery }                        from '@acx-ui/rc/services'

import MacRegistrationListForm
  from '../../../../Policies/MacRegistrationList/MacRegistrationListForm/MacRegistrationListForm'


const { Option } = Select

export interface MacRegistrationListComponentProps {
  inputName?: string[]
}

const MacRegistrationListComponent = (props: MacRegistrationListComponentProps) => {
  const intl = useIntl()
  const { inputName = [] } = props

  const [macModalVisible, setMacModalVisible] = useState(false)
  const [macId, setMacId] = useState('')
  const form = Form.useFormInstance()

  const { data: macRegListOption } = useMacRegListsQuery({
    payload: { pageSize: 10000 }
  }, {
    selectFromResult ({ data }) {
      return {
        data: data?.data?.map(
          item => {
            return <Option key={item.id}>{item.name}</Option>
          }) ?? []
      }
    } })

  useEffect(() => {
    if (macId) {
      form.setFieldValue([...inputName, 'macRegistrationListId'], macId)
    }
  }, [macId])

  return <Form.Item
    label={intl.$t({ defaultMessage: 'Select MAC Registration List' })}
    name={[...inputName, 'macRegistrationList']}
  >
    <GridRow>
      <GridCol col={{ span: 12 }}>
        <Form.Item
          name={[...inputName, 'macRegistrationListId']}
          rules={[{
            required: true,
            message: intl.$t({
              defaultMessage: 'macRegistrationList should not be empty'
            })
          }]}
          children={
            <Select
              style={{ width: '150px' }}
              placeholder={intl.$t({ defaultMessage: 'Select...' })}
              children={macRegListOption}
            />
          }
        />
      </GridCol>
      <Button
        type='link'
        style={{ top: '5px' }}
        onClick={() => {
          setMacModalVisible(true)
        }}>
        {intl.$t({ defaultMessage: 'Add' })}
      </Button>
    </GridRow>
    <Modal
      title={intl.$t({ defaultMessage: 'Add MAC Registration List' })}
      visible={macModalVisible}
      type={ModalType.ModalStepsForm}
      children={<MacRegistrationListForm
        modalMode
        modalCallBack={(macRegPool) => {
          setMacModalVisible(false)
          setMacId(macRegPool?.id!)
        }}
      />}
      onCancel={() => setMacModalVisible(false)}
    />

  </Form.Item>
}

export default MacRegistrationListComponent
