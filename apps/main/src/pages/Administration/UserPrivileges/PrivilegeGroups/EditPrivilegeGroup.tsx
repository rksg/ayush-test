
import { useEffect, useState } from 'react'

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
  StepsForm,
  Tabs
} from '@acx-ui/components'
import { MspEc }                                                         from '@acx-ui/msp/utils'
import { useGetOnePrivilegeGroupQuery, useUpdatePrivilegeGroupMutation } from '@acx-ui/rc/services'
import { PrivilegeGroup, Venue }                                         from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'

import CustomRoleSelector from '../CustomRoles/CustomRoleSelector'
import * as UI            from '../styledComponents'

import { choiceCustomerEnum, choiceScopeEnum } from './AddPrivilegeGroup'
import { SelectCustomerDrawer }                from './SelectCustomerDrawer'
import { SelectVenuesDrawer }                  from './SelectVenuesDrawer'

const AdministrationTabs = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { activeTab } = params
  const basePath = useTenantLink('/administration')
  const navigate = useNavigate()

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <Tabs
      defaultActiveKey='groupSettings'
      activeKey={activeTab}
      onChange={onTabChange}
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Group Settings' })} key='groupSettings' />
      {/* <Tabs.TabPane tab={$t({ defaultMessage: 'Members' })} key='members' /> */}
    </Tabs>
  )
}

// const tabPanes = {
//   groupSettings: GroupSettings,
//   members: Members
// }
interface PrivilegeGroupData {
  name?: string,
  description?: string,
  roleName?: string,
  delegation?: boolean
}

export function EditPrivilegeGroup () {
  const intl = useIntl()
  const [selectVenueDrawer, setSelectVenueDrawer] = useState(false)
  const [selectCustomerDrawer, setSelectCustomerDrawer] = useState(false)
  const [selectedScope, setSelectedScope ] = useState(choiceScopeEnum.ALL_VENUES)
  const [selectedMspScope, setSelectedMspScope ] = useState(choiceCustomerEnum.ALL_CUSTOMERS)
  const [selectedVenus, setVenues] = useState([] as Venue[])
  const [selectedCustomers, setCustomers] = useState([] as MspEc[])
  const [displayMspScope, setDisplayMspScope] = useState(false)

  const navigate = useNavigate()
  const { action, groupId } = useParams()
  const location = useLocation().state as PrivilegeGroup
  const linkToPrivilegeGroups = useTenantLink('/administration/userPrivileges/privilegeGroups', 't')
  const [form] = Form.useForm()
  const [updatePrivilegeGroup] = useUpdatePrivilegeGroupMutation()
  const isOnboardedMsp = location ?? false

  const { data: privilegeGroup } =
      useGetOnePrivilegeGroupQuery({ params: { privilegeGroupId: groupId } },
        { skip: action !== 'edit' && action !== 'clone' })


  const onClickSelectVenue = () => {
    setSelectVenueDrawer(true)
  }

  const onClickSelectCustomer = () => {
    setSelectCustomerDrawer(true)
  }

  const setSelectedVenus = (selected: Venue[]) => {
    setVenues(selected)
  }

  const setSelectedCustomers = (selected: MspEc[]) => {
    setCustomers(selected)
  }

  const onScopeChange = (e: RadioChangeEvent) => {
    setSelectedScope(e.target.value)
    if (e.target.value === choiceScopeEnum.ALL_VENUES)
      setSelectVenueDrawer(false)
  }

  const onCustomerChange = (e: RadioChangeEvent) => {
    setSelectedMspScope(e.target.value)
    if (e.target.value === choiceCustomerEnum.ALL_CUSTOMERS)
      setSelectCustomerDrawer(false)
  }

  const handleUpdatePrivilegeGroup = async () => {
    const formValues = form.getFieldsValue(true)

    try {
      await form.validateFields()
      const privilegeGroupData: PrivilegeGroupData = {
        name: formValues.name,
        description: formValues.description,
        roleName: formValues.role,
        delegation: false
      }
      await updatePrivilegeGroup({ params: { privilegeGroupId: groupId },
        payload: privilegeGroupData }).unwrap()

      navigate(linkToPrivilegeGroups)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  useEffect(() => {
    if (privilegeGroup) {
      form.setFieldValue('name', privilegeGroup.name)
      form.setFieldValue('description', privilegeGroup?.description)
      form.setFieldValue('role', privilegeGroup?.roleName)
    }
  }, [privilegeGroup])

  const DisplaySelectedVenues = () => {
    const fisrtVenue = selectedVenus[0]
    const restVenue = selectedVenus.slice(1)
    return <>
      <UI.VenueList key={fisrtVenue.id}>
        {fisrtVenue.name}
        <Button
          type='link'
          style={{ marginLeft: '40px' }}
          onClick={onClickSelectVenue}
        >Change</Button>
      </UI.VenueList>
      {restVenue.map(venue =>
        <UI.VenueList key={venue.id}>
          {venue.name}
        </UI.VenueList>
      )}
    </>
  }

  const DisplaySelectedCustomers = () => {
    const fisrtCustomer = selectedCustomers[0]
    const restCustomer = selectedCustomers.slice(1)
    return <>
      <UI.VenueList key={fisrtCustomer.id}>
        {fisrtCustomer.name}
        <Button
          type='link'
          style={{ marginLeft: '40px' }}
          onClick={onClickSelectCustomer}
        >Change</Button>
      </UI.VenueList>
      {restCustomer.map(ec =>
        <UI.VenueList key={ec.id}>
          {ec.name}
        </UI.VenueList>
      )}
    </>
  }

  const ScopeForm = () => {
    return <Form.Item
      name='scope'
      label={intl.$t({ defaultMessage: 'Scope' })}
      initialValue={choiceScopeEnum.ALL_VENUES}>
      <Radio.Group
        value={selectedScope}
        onChange={onScopeChange}
      >
        <Space direction={'vertical'} size={12}>
          <Radio
            key={choiceScopeEnum.ALL_VENUES}
            value={choiceScopeEnum.ALL_VENUES}>
            {intl.$t({ defaultMessage: 'All Venues' })}
          </Radio>
          <Radio
            key={choiceScopeEnum.SPECIFIC_VENUE}
            value={choiceScopeEnum.SPECIFIC_VENUE}>
            {intl.$t({ defaultMessage: 'Specific Venue(s)' })}
          </Radio>
          <Button
            style={{ marginLeft: '22px' }}
            hidden={selectedScope === choiceScopeEnum.ALL_VENUES || selectedVenus.length > 0}
            type='link'
            onClick={onClickSelectVenue}
          >Select venues</Button>
        </Space>
      </Radio.Group>
      {selectedVenus.length > 0 && selectedScope === choiceScopeEnum.SPECIFIC_VENUE &&
        <DisplaySelectedVenues />}
    </Form.Item>
  }

  const MspScopeForm = () => {
    return <><Form.Item
      name='ownscope'
      label={intl.$t({ defaultMessage: 'Scope' })}
      children={
        <Checkbox checked={true} children={intl.$t({ defaultMessage: 'Own Account' })} />
      }
    />
    <Form.Item
      initialValue={choiceScopeEnum.ALL_VENUES}>
      <Radio.Group
        style={{ marginLeft: 22 }}
        value={selectedScope}
        onChange={onScopeChange}
      >
        <Space direction={'vertical'} size={12}>
          <Radio
            key={choiceScopeEnum.ALL_VENUES}
            value={choiceScopeEnum.ALL_VENUES}>
            {intl.$t({ defaultMessage: 'All Venues' })}
          </Radio>
          <Radio
            key={choiceScopeEnum.SPECIFIC_VENUE}
            value={choiceScopeEnum.SPECIFIC_VENUE}>
            {intl.$t({ defaultMessage: 'Specific Venue(s)' })}
          </Radio>
          <Button
            style={{ marginLeft: '22px' }}
            hidden={selectedScope === choiceScopeEnum.ALL_VENUES || selectedVenus.length > 0}
            type='link'
            onClick={onClickSelectVenue}
          >Select venues</Button>
        </Space>
      </Radio.Group>
      {selectedVenus.length > 0 && selectedScope === choiceScopeEnum.SPECIFIC_VENUE &&
        <DisplaySelectedVenues />}
    </Form.Item>

    <Form.Item
      name='mspscope'
      valuePropName='checked'
      children={
        <Checkbox checked={displayMspScope}
          onChange={e => setDisplayMspScope(e.target.checked)}
          children={intl.$t({ defaultMessage: 'MSP Customers' })} />
      }
    />
    <Form.Item
      initialValue={choiceCustomerEnum.ALL_CUSTOMERS}
      hidden={!displayMspScope}>
      <Radio.Group
        style={{ marginLeft: 22 }}
        value={selectedMspScope}
        onChange={onCustomerChange}
      >
        <Space direction={'vertical'} size={12}>
          <Radio
            key={choiceCustomerEnum.ALL_CUSTOMERS}
            value={choiceCustomerEnum.ALL_CUSTOMERS}>
            {intl.$t({ defaultMessage: 'All Customers' })}
          </Radio>
          <Radio
            key={choiceCustomerEnum.SPECIFIC_CUSTOMER}
            value={choiceCustomerEnum.SPECIFIC_CUSTOMER}>
            {intl.$t({ defaultMessage: 'Specific Customer(s)' })}
          </Radio>
          <Button
            style={{ marginLeft: '22px' }}
            hidden={selectedMspScope ===
              choiceCustomerEnum.ALL_CUSTOMERS || selectedCustomers.length > 0}
            type='link'
            onClick={onClickSelectCustomer}
          >Select customers</Button>
        </Space>
      </Radio.Group>

      {selectedCustomers.length > 0 && selectedMspScope === choiceCustomerEnum.SPECIFIC_CUSTOMER &&
        <DisplaySelectedCustomers />}

    </Form.Item></>
  }

  const PrivilegeGroupForm = () => {
    return <StepsForm
      form={form}
      onFinish={handleUpdatePrivilegeGroup}
      onCancel={() => navigate(linkToPrivilegeGroups)}
      buttonLabel={{ submit: intl.$t({ defaultMessage: 'Save' }) }}
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
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={8}>
            {isOnboardedMsp ? <MspScopeForm /> : <ScopeForm />}
          </Col>
        </Row>
        <SelectVenuesDrawer
          visible={selectVenueDrawer}
          selected={selectedVenus}
          setVisible={setSelectVenueDrawer}
          setSelected={setSelectedVenus}
        />
        <SelectCustomerDrawer
          visible={selectCustomerDrawer}
          selected={selectedCustomers}
          setVisible={setSelectCustomerDrawer}
          setSelected={setSelectedCustomers}
        />

      </StepsForm.StepForm>
    </StepsForm>
  }

  //   const ActiveTabPane = tabPanes[activeTab as keyof typeof tabPanes]

  return (<>
    <PageHeader
      title={intl.$t({ defaultMessage: 'Administrators' })}
      breadcrumb={[
        { text: intl.$t({ defaultMessage: 'Administration' }) },
        { text: intl.$t({ defaultMessage: 'Users & Privileges' }) },
        { text: intl.$t({ defaultMessage: 'Privilege Groups' }),
          link: '/administration/userPrivileges/privilegeGroups' }
      ]}
      footer={<AdministrationTabs />}
    />
    <PrivilegeGroupForm />
    {/* { ActiveTabPane && <ActiveTabPane /> } */}
  </>)
}
