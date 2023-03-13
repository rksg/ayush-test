import React, { useEffect, useState } from 'react'

import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'

import { Button, GridCol, GridRow, Modal, ModalType } from '@acx-ui/components'
import { useMacRegListsQuery }                        from '@acx-ui/rc/services'

import MacRegistrationListForm
  from '../../../../Policies/MacRegistrationList/MacRegistrationListForm/MacRegistrationListForm'


const { Option } = Select

export interface MacRegistrationListComponentProps {
  inputName?: string[],
  editMode: boolean
}

const MacRegistrationListComponent = (props: MacRegistrationListComponentProps) => {
  const intl = useIntl()
  const { inputName = [], editMode } = props

  const [macModalVisible, setMacModalVisible] = useState(false)
  const [macName, setMacName] = useState('')
  const form = Form.useFormInstance()

  const { data: macRegListOption } = useMacRegListsQuery({}, {
    selectFromResult ({ data }) {
      return {
        data: data?.data?.map(
          item => {
            return <Option key={item.id}>{item.name}</Option>
          }) ?? []
      }
    } })

  useEffect(() => {
    if (macName) {
      form.setFieldValue([...inputName, 'macRegistrationListId'], macName)
    }
  }, [macName])

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
              disabled={editMode}
              placeholder={intl.$t({ defaultMessage: 'Select...' })}
              children={macRegListOption}
            />
          }
        />
      </GridCol>
      <Button
        type='link'
        disabled={editMode}
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
        modalCallBack={(name) => {
          setMacModalVisible(false)
          setMacName(name!)
        }}
      />}
      onCancel={() => setMacModalVisible(false)}
    />

  </Form.Item>
}

export default MacRegistrationListComponent
