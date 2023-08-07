// import { useState } from 'react'

import { useEffect } from 'react'

import {
  Form,
  Input
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Modal }                from '@acx-ui/components'
import {
  useGetMspEcAdminQuery,
  useUpdateMspEcAdminMutation
} from '@acx-ui/msp/services'
import {
  useUpdateAdminMutation
} from '@acx-ui/rc/services'
import {
  Administrator
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import RoleSelector from '../AddAdministratorDialog/RoleSelector'


interface EditAdministratorDialogProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  editData: Administrator;
  editNameOnly: boolean;
  isMspEc: boolean;
  currentUserDetailLevel?: string;
}

const EditAdministratorDialog = (props: EditAdministratorDialogProps) => {
  const {
    visible,
    setVisible,
    editData,
    editNameOnly,
    isMspEc,
    currentUserDetailLevel
  } = props
  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()

  const [updateAdmin, { isLoading: isUpdateAdminUpdating }] = useUpdateAdminMutation()
  const [updateMspEcAdmin] = useUpdateMspEcAdminMutation()

  const { data: mspEcAdmin, isError } = useGetMspEcAdminQuery({
    params: {
      mspEcTenantId: params.tenantId,
      mspEcAdminId: editData.id
    }
  }, { skip: !isMspEc })

  const updateMspEcAdminUsername = async (data: Administrator) => {
    try {
      const payload = {
        ...mspEcAdmin,
        first_name: data.name,
        last_name: data.lastName
      }

      await updateMspEcAdmin({
        params: {
          mspEcTenantId: params.tenantId,
          mspEcAdminId: data.id
        },
        payload
      }).unwrap()

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleSubmit = async () => {
    const formValues = form.getFieldsValue(true)

    try {
      const payload = {
        ...editData,
        role: formValues.role,
        detailLevel: currentUserDetailLevel
      } as Administrator

      await updateAdmin({ params, payload }).unwrap()

      if (isNameEditable) {
        updateMspEcAdminUsername(formValues)
      }

      handleCancel()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleCancel = () => {
    setVisible(false)
    form.resetFields()
  }

  useEffect(() => {
    if (editData && visible)
      form.setFieldsValue(editData)
  }, [form, editData, visible])

  const isLoading = isUpdateAdminUpdating

  // only msp ec can edit name
  const isNameEditable = (isMspEc && isError === false && !_.isEmpty(mspEcAdmin)) ? true : false

  return (
    <Modal
      visible={visible}
      title={$t({ defaultMessage: 'Edit Administrator' })}
      okText={$t({ defaultMessage: 'OK' })}
      maskClosable={false}
      keyboard={false}
      width={500}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okButtonProps={{ disabled: isLoading }}
      cancelButtonProps={{ disabled: isLoading }}
    >
      <Form
        form={form}
        layout='horizontal'
        onFinish={handleSubmit}
      >
        {isNameEditable ? (
          <>
            <Form.Item
              name='name'
              label={$t({ defaultMessage: 'First Name' })}
              rules={[
                { required: true },
                { min: 1 },
                { max: 64 }
              ]}
            >
              <Input/>
            </Form.Item>
            <Form.Item
              name='lastName'
              label={$t({ defaultMessage: 'Last Name' })}
              rules={[
                { required: true },
                { min: 1 },
                { max: 64 }
              ]}
            >
              <Input/>
            </Form.Item>
          </>
        ) : (
          <Form.Item
            label={$t({ defaultMessage: 'Name' })}
          >
            {`${editData.name} ${editData.lastName}`}
          </Form.Item>
        )}

        <Form.Item
          label={$t({ defaultMessage: 'Email Address' })}
        >
          {editData.email}
        </Form.Item>

        <Form.Item
          label={$t({ defaultMessage: 'Authentication Type' })}
        >
          {editData.authenticationId
            ? $t({ defaultMessage: 'SSO with 3rd Party' })
            : $t({ defaultMessage: 'RUCKUS Identity Management' })
          }
        </Form.Item>

        <RoleSelector disabled={editNameOnly === true} />
      </Form>
    </Modal>
  )
}

export default EditAdministratorDialog