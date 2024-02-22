
import React, { useState } from 'react'

import {
  Checkbox,
  Col,
  Form,
  Input,
  Radio,
  RadioChangeEvent,
  Row,
  Space
} from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import { useAddPrivilegeGroupMutation }                                      from '@acx-ui/rc/services'
import { PrivilegePolicy, PrivilegePolicyEntity, PrivilegePolicyObjectType } from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

import CustomRoleSelector from '../CustomRoles/CustomRoleSelector'

import { SelectCustomerDrawer } from './SelectCustomerDrawer'
import { SelectVenuesDrawer }   from './SelectVenuesDrawer'

interface PrivilegeGroupData {
  name?: string,
  description?: string,
  roleName?: string,
  delegation?: boolean
  policies?: PrivilegePolicy[],
  policyEntityDTOS?: PrivilegePolicyEntity[]
}

export function AddPrivilegeGroup () {
  const intl = useIntl()
  const [selectVenueDrawer, setSelectVenueDrawer] = useState(false)
  const [selectCustomerDrawer, setSelectCustomerDrawer] = useState(false)
  const [selectedScope, setSelectedScope ] = useState('AllVenues')
  const [selectedCustomer, setSelectedCustomer ] = useState('AllCustomers')

  const navigate = useNavigate()
  const location = useLocation().state as boolean

  const linkToPrivilegeGroups = useTenantLink('/administration/userPrivileges/privilegeGroups', 't')
  const [form] = Form.useForm()
  const [addPrivilegeGroup] = useAddPrivilegeGroupMutation()
  const isOnboardedMsp = location ?? false

  const onClickSelectVenue = () => {
    setSelectVenueDrawer(true)
  }

  const onClickSelectCustomer = () => {
    setSelectCustomerDrawer(true)
  }

  const onScopeChange = (e: RadioChangeEvent) => {
    setSelectedScope(e.target.value)
    if (e.target.value === 'AllVenues')
      setSelectVenueDrawer(false)
  }

  const onCustomerChange = (e: RadioChangeEvent) => {
    setSelectedCustomer(e.target.value)
    if (e.target.value === 'AllCustomers')
      setSelectCustomerDrawer(false)
  }

  const handleAddPrivilegeGroup = async () => {
    const formValues = form.getFieldsValue(true)

    try {
      await form.validateFields()
      const privilegeGroupData: PrivilegeGroupData = {
        name: formValues.name,
        description: formValues.description,
        roleName: formValues.role,
        delegation: false
      }
      privilegeGroupData.policies = [
        {
          entityInstanceId: '94a7c646c63c477782c63f6c1a0f25dd',
          objectType: PrivilegePolicyObjectType.OBJ_TYPE_VENUE
        }
      ]
      await addPrivilegeGroup({ payload: privilegeGroupData }).unwrap()

      navigate(linkToPrivilegeGroups)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const ScopeForm = () => {
    return <Form.Item
      name='scope'
      label={intl.$t({ defaultMessage: 'Scope' })}
      initialValue={'AllVenues'}>
      <Radio.Group
        style={{ margin: 12 }}
        onChange={onScopeChange}
      >
        <Space direction={'vertical'} size={12}>
          <Radio
            key={'AllVenues'}
            value={'AllVenues'}>
            {intl.$t({ defaultMessage: 'All Venues' })}
          </Radio>
          <Radio
            key={'SpecificVenues'}
            value={'SpecificVenues'}>
            {intl.$t({ defaultMessage: 'Specific Venue(s)' })}
          </Radio>
          {selectedScope === 'SpecificVenues' && <Button
            style={{ marginLeft: '22px' }}
            type='link'
            onClick={onClickSelectVenue}
          >Select venues</Button>}
        </Space>
      </Radio.Group>
    </Form.Item>
  }

  const MspScopeForm = () => {
    return <><Form.Item
      name='ownscope'
      label={intl.$t({ defaultMessage: 'Scope' })}
      rules={[
        { min: 2 },
        { max: 64 }
      ]}
      children={
        <Checkbox checked={true} children={intl.$t({ defaultMessage: 'Own Account' })} />
      }
    />
    <Form.Item
      name='scope'
      initialValue={'AllVenues'}>
      <Radio.Group
        style={{ marginLeft: 22 }}
        onChange={onScopeChange}
      >
        <Space direction={'vertical'} size={12}>
          <Radio
            key={'AllVenues'}
            value={'AllVenues'}>
            {intl.$t({ defaultMessage: 'All Venues' })}
          </Radio>
          <Radio
            key={'SpecificVenues'}
            value={'SpecificVenues'}>
            {intl.$t({ defaultMessage: 'Specific Venue(s)' })}
          </Radio>
          {selectedScope === 'SpecificVenues' && <Button
            style={{ marginLeft: '22px' }}
            type='link'
            onClick={onClickSelectVenue}
          >Select venues</Button>}
        </Space>
      </Radio.Group>
    </Form.Item>

    <Form.Item
      name='mspscope'
      rules={[
        { min: 2 },
        { max: 64 }
      ]}
      children={
        <Checkbox checked={true} children={intl.$t({ defaultMessage: 'MSP Customers' })} />
      }
    />
    <Form.Item
      name='customers'
      initialValue={'AllCustomers'}>
      <Radio.Group
        style={{ marginLeft: 22 }}
        onChange={onCustomerChange}
      >
        <Space direction={'vertical'} size={12}>
          <Radio
            key={'AllCustomers'}
            value={'AllCustomers'}>
            {intl.$t({ defaultMessage: 'All Customers' })}
          </Radio>
          <Radio
            key={'SpecificCustomers'}
            value={'SpecificCustomers'}>
            {intl.$t({ defaultMessage: 'Specific Customer(s)' })}
          </Radio>
          {selectedCustomer === 'SpecificCustomers' && <Button
            style={{ marginLeft: '22px' }}
            type='link'
            onClick={onClickSelectCustomer}
          >Select customers</Button>}
        </Space>
      </Radio.Group>
    </Form.Item></>

  }

  const PrivilegeGroupForm = () => {
    return <StepsForm
      form={form}
      onFinish={handleAddPrivilegeGroup}
      onCancel={() => navigate(linkToPrivilegeGroups)}
    >
      <StepsForm.StepForm>
        <Row gutter={12}>
          <Col span={4}>
            <Form.Item
              name='name'
              label={intl.$t({ defaultMessage: 'Name' })}
              rules={[
                { required: true },
                { min: 2 },
                { max: 64 }
              ]}
              children={<Input />}
            />
            <Form.Item
              name='description'
              label={intl.$t({ defaultMessage: 'Description' })}
              rules={[
                { min: 2 },
                { max: 64 }
              ]}
              children={<Input />}
            />
            <CustomRoleSelector />
            {isOnboardedMsp ? <MspScopeForm /> : <ScopeForm />}
          </Col>
        </Row>
        <SelectVenuesDrawer
          visible={selectVenueDrawer}
          setVisible={setSelectVenueDrawer}
        />
        <SelectCustomerDrawer
          visible={selectCustomerDrawer}
          setVisible={setSelectCustomerDrawer}
        />

      </StepsForm.StepForm>
    </StepsForm>
  }

  return (<>
    <PageHeader
      title={intl.$t({ defaultMessage: 'New Privilege Group' })}
      breadcrumb={[
        { text: intl.$t({ defaultMessage: 'Administration' }) },
        { text: intl.$t({ defaultMessage: 'Users & Privileges' }) },
        { text: intl.$t({ defaultMessage: 'Privilege Groups' }),
          link: '/administration/userPrivileges/privilegeGroups' }
      ]}
    />
    <PrivilegeGroupForm />
  </>)
}
