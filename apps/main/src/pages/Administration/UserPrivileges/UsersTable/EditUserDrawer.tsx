import { useEffect } from 'react'

import {
  Form,
  Input
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Drawer }                 from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
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

import PrivilegeGroupSelector from '../PrivilegeGroups/PrivilegeGroupSelector'

interface EditUserDrawerProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  editData: Administrator;
  editNameOnly: boolean;
  isMspEc: boolean;
  currentUserDetailLevel?: string;
}

const EditUserDrawer = (props: EditUserDrawerProps) => {
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

  const [updateAdmin] = useUpdateAdminMutation()
  const [updateMspEcAdmin] = useUpdateMspEcAdminMutation()

  const { data: mspEcAdmin, isError } = useGetMspEcAdminQuery({
    params: {
      mspEcTenantId: params.tenantId,
      mspEcAdminId: editData.id
    }
  }, { skip: !isMspEc })

  const isCAMFFEnabled = useIsSplitOn(Features.PTENANT_TO_COMMON_ACCOUNT_MANAGEMENT_TOGGLE)

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

  const onClose = () => {
    setVisible(false)
    form.resetFields()
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

  // only msp ec can edit name
  const isNameEditable = (isMspEc && isError === false && !_.isEmpty(mspEcAdmin)) ? true : false

  return (
    <Drawer
      title={$t({ defaultMessage: 'Edit User' })}
      visible={visible}
      keyboard={false}
      onClose={onClose}
      width={500}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'Apply' })
          }}
          onCancel={handleCancel}
          onSave={async () => form.submit()}
        />
      }
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
      >
        <Form.Item
          label={$t({ defaultMessage: 'Authentication Type' })}
        >
          {editData.authenticationId
            ? $t({ defaultMessage: 'SSO with 3rd Party' })
            : isCAMFFEnabled ? $t({ defaultMessage: 'Ruckus Account Management' })
              : $t({ defaultMessage: 'RUCKUS Identity Management' })
          }
        </Form.Item>

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
          label={$t({ defaultMessage: 'Email' })}
        >
          {editData.email}
        </Form.Item>
        <PrivilegeGroupSelector disabled={editNameOnly}/>
      </Form>
    </Drawer>
  )
}

export default EditUserDrawer