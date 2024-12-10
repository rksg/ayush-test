import { useEffect, useState } from 'react'

import {
  Form,
  Input,
  Typography
} from 'antd'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  Subtitle
} from '@acx-ui/components'
import { SpaceWrapper }         from '@acx-ui/rc/components'
import {
  useAddCustomRoleMutation,
  useGetCustomRolesQuery,
  useUpdateCustomRoleMutation
} from '@acx-ui/rc/services'
import {
  CustomGroupType,
  CustomRole,
  specialCharactersRegExp,
  systemDefinedNameValidator
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { EdgeScopes, RolesEnum, SwitchScopes, WifiScopes } from '@acx-ui/types'

interface CustomRoleData {
  name?: string,
  description?: string,
  scopes?: string[],
  preDefinedRole?: string
}

export function AddExplictCustomRole () {
  const intl = useIntl()
  const navigate = useNavigate()
  const { action, customRoleId } = useParams()
  const location = useLocation().state as CustomRole
  const [roleNames, setRoleNames] = useState([] as RolesEnum[])

  const linkToCustomRoles = useTenantLink('/administration/userPrivileges/customRoles', 't')
  const [form] = Form.useForm()

  const { data: roleList } = useGetCustomRolesQuery({})
  useEffect(() => {
    if (roleList) {
      const nameList = roleList.filter(item =>
        item.type === CustomGroupType.CUSTOM && item.name !== location?.name).map(item => item.name)
      setRoleNames(nameList as RolesEnum[])
    }
  }, [roleList])

  const [addCustomRole] = useAddCustomRoleMutation()
  const [updateCustomRole] = useUpdateCustomRoleMutation()

  const isEditMode = action === 'edit'
  const isClone = action === 'clone'
  const clonePreDefinedRole = location?.preDefinedRole ? location?.preDefinedRole
    : ((isClone && location?.name && location?.type === CustomGroupType.SYSTEM) ? location.name
      : undefined)

  const wifiScopes = [
    WifiScopes.READ, WifiScopes.CREATE,
    WifiScopes.UPDATE, WifiScopes.DELETE
  ]
  const switchScopes = [
    SwitchScopes.READ, SwitchScopes.CREATE,
    SwitchScopes.UPDATE, SwitchScopes.DELETE
  ]
  const edgeScopes = [
    EdgeScopes.READ, EdgeScopes.CREATE,
    EdgeScopes.UPDATE, EdgeScopes.DELETE
  ]

  let scopes: Array<string> = []
  wifiScopes.map(item => scopes.push(item))
  switchScopes.map(item => scopes.push(item))
  edgeScopes.map(item => scopes.push(item))

  const handleAddRole = async () => {
    const name = form.getFieldValue('name')
    const description = form.getFieldValue('description')
    try {
      await form.validateFields()
      const checkedScopes = scopes.filter((s) => form.getFieldValue(s))
      const roleData: CustomRoleData = {
        name: name,
        description: description,
        scopes: checkedScopes,
        preDefinedRole: clonePreDefinedRole || RolesEnum.READ_ONLY
      }
      if(isEditMode) {
        await updateCustomRole({ params: { customRoleId: customRoleId },
          payload: roleData }).unwrap()
      } else {
        await addCustomRole({ payload: roleData }).unwrap()
      }

      navigate(linkToCustomRoles)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  useEffect(() => {
    if (location && (isEditMode || isClone)) {
      form.setFieldValue('name', isClone ? (location?.name + ' - copy') : location?.name)
      form.setFieldValue('description', location?.description)
    }
  }, [form, location])

  const CustomRoleForm = () => {
    return <StepsForm
      form={form}
      editMode={isEditMode}
      onFinish={handleAddRole}
      onCancel={() => navigate(linkToCustomRoles)}
    >
      <StepsForm.StepForm
        key='general'
        name='general'
        title={intl.$t({ defaultMessage: 'General' })}
      >
        <GeneralForm />
      </StepsForm.StepForm>

      <StepsForm.StepForm
        name='permissions'
        key='permissions'
        title={intl.$t({ defaultMessage: 'Permissions' })}
      >
        <PermissionsForm />
      </StepsForm.StepForm>

      {!isEditMode &&
        <StepsForm.StepForm
          name='summary'
          title={intl.$t({ defaultMessage: 'Summary' })}
        >
          <SummaryForm />
        </StepsForm.StepForm>}

    </StepsForm>
  }

  const GeneralForm = () => {
    return <>
      <Subtitle level={3}>{intl.$t({ defaultMessage: 'General' })}</Subtitle>
      <Form.Item
        name='name'
        label={intl.$t({ defaultMessage: 'Role Name' })}
        style={{ width: '300px' }}
        rules={[
          { required: true },
          { min: 2 },
          { max: 128 },
          { validator: (_, value) => {
            if(roleNames.includes(value)) {
              return Promise.reject(
                `${intl.$t({ defaultMessage: 'Name already exists' })} `
              )
            }
            return Promise.resolve()}
          },
          { validator: (_, value) => systemDefinedNameValidator(value) },
          { validator: (_, value) => specialCharactersRegExp(value) }
        ]}
        validateFirst
        hasFeedback
        children={<Input />}
      />
      <Form.Item
        name='description'
        label={intl.$t({ defaultMessage: 'Role Description' })}
        style={{ width: '300px' }}
        rules={[
          { max: 180 }
        ]}
        children={
          <Input.TextArea rows={4} />
        }
      />
    </>
  }

  const PermissionsForm = () => {
    return <>
      <Subtitle level={3}>{ intl.$t({ defaultMessage: 'Permissions' }) }</Subtitle>
      <Form.Item >
        <SpaceWrapper className='indent' justifycontent='flex-start'>
          <Typography.Paragraph className='greyText'>
            {intl.$t({ defaultMessage: `Set permission for this role at the Global level. 
            Global permissions will enable all of the Advanced` })}<br />
            {intl.$t({ defaultMessage: `permissions for enabled category. By default all 
            permissions set to Read Only.` })}
          </Typography.Paragraph>
        </SpaceWrapper>
      </Form.Item >
    </>
  }

  const SummaryForm = () => {
    return <>
      <Subtitle level={3}>{ intl.$t({ defaultMessage: 'Summary' }) }</Subtitle>
      <Form.Item >

      </Form.Item >
    </>
  }

  return (<>
    <PageHeader
      title={isEditMode
        ? intl.$t({ defaultMessage: 'Edit Role' })
        : isClone ? intl.$t({ defaultMessage: 'Clone Admin Role' })
          : intl.$t({ defaultMessage: 'Add Role' })
      }
      breadcrumb={[
        { text: intl.$t({ defaultMessage: 'Administration' }) },
        { text: intl.$t({ defaultMessage: 'Users & Privileges' }) },
        { text: intl.$t({ defaultMessage: 'Roles' }),
          link: '/administration/userPrivileges/customRoles' }
      ]}
    />
    <CustomRoleForm />
  </>)
}
