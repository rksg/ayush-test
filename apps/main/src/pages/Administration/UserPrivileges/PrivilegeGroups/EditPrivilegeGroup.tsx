
import { useEffect, useState } from 'react'

import {
  Checkbox,
  Col,
  Form,
  Input,
  Radio,
  RadioChangeEvent,
  Row,
  Space,
  Typography
} from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  StepsForm,
  Tabs
} from '@acx-ui/components'
import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { useMspCustomerListQuery }  from '@acx-ui/msp/services'
import { MspEcWithVenue }           from '@acx-ui/msp/utils'
import {
  useAddPrivilegeGroupMutation,
  useGetOnePrivilegeGroupQuery,
  useGetPrivilegeGroupsQuery,
  useGetVenuesQuery,
  useUpdatePrivilegeGroupMutation
}                          from '@acx-ui/rc/services'
import {
  CustomGroupType,
  PrivilegePolicy,
  PrivilegePolicyEntity,
  PrivilegePolicyObjectType,
  TenantType,
  Venue,
  VenueObjectList,
  excludeSpaceRegExp,
  specialCharactersRegExp,
  systemDefinedNameValidator
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { RolesEnum }   from '@acx-ui/types'
import { AccountType } from '@acx-ui/utils'

import CustomRoleSelector from '../CustomRoles/CustomRoleSelector'
import * as UI            from '../styledComponents'

import { ChoiceCustomerEnum, ChoiceScopeEnum } from './AddPrivilegeGroup'
import { SelectCustomerDrawer }                from './SelectCustomerDrawer'
import { SelectCustomerOnlyDrawer }            from './SelectCustomerOnlyDrawer'
import { SelectVenuesDrawer }                  from './SelectVenuesDrawer'

import { PrivilegeGroupSateProps } from '.'

interface PrivilegeGroupData {
  name?: string,
  description?: string,
  roleName?: string,
  delegation?: boolean,
  allCustomers?: boolean,
  policies?: PrivilegePolicy[],
  policyEntityDTOS?: PrivilegePolicyEntity[]
}

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

const venuesListPayload = {
  fields: ['name', 'country', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const customerListPayload = {
  fields: ['name', 'id'],
  filters: {
    tenantType: [AccountType.MSP_EC, AccountType.MSP_REC,
      AccountType.MSP_INTEGRATOR, AccountType.MSP_INSTALLER]
  },
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export function EditPrivilegeGroup () {
  const intl = useIntl()
  const [selectVenueDrawer, setSelectVenueDrawer] = useState(false)
  const [selectCustomerDrawer, setSelectCustomerDrawer] = useState(false)
  const [selectedScope, setSelectedScope ] = useState(ChoiceScopeEnum.ALL_VENUES)
  const [selectedMspScope, setSelectedMspScope ] = useState(ChoiceCustomerEnum.ALL_CUSTOMERS)
  const [selectedVenues, setVenues] = useState([] as Venue[])
  const [selectedCustomers, setCustomers] = useState([] as MspEcWithVenue[])
  const [displayMspScope, setDisplayMspScope] = useState(false)
  const [disableNameChange, setDisableNameChange] = useState(false)
  const [groupNames, setGroupNames] = useState([] as RolesEnum[])
  const [selectedRole, setCustomRole] = useState('')
  const isViewmodleAPIsMigrateEnabled = useIsSplitOn(Features.VIEWMODEL_APIS_MIGRATE_MSP_TOGGLE)

  const navigate = useNavigate()
  const { action, groupId } = useParams()
  const location = useLocation().state as PrivilegeGroupSateProps
  const linkToPrivilegeGroups = useTenantLink('/administration/userPrivileges/privilegeGroups', 't')
  const [form] = Form.useForm()
  const [addPrivilegeGroup] = useAddPrivilegeGroupMutation()
  const [updatePrivilegeGroup] = useUpdatePrivilegeGroupMutation()
  const isOnboardedMsp = location?.isOnboardedMsp ?? false
  const isClone = action === 'clone'
  const tenantType = location?.tenantType as TenantType
  const isTechPartner =
    tenantType === TenantType.MSP_INSTALLER || tenantType === TenantType.MSP_INTEGRATOR

  const { data: privilegeGroup } =
      useGetOnePrivilegeGroupQuery({ params: { privilegeGroupId: groupId } },
        { skip: action !== 'edit' && action !== 'clone' })

  const { data: venuesList } =
      useGetVenuesQuery({ params: useParams(), payload: venuesListPayload })

  const { data: customerList } =
      useMspCustomerListQuery({ params: useParams(), payload: customerListPayload,
        enableRbac: isViewmodleAPIsMigrateEnabled }, { skip: !isOnboardedMsp })

  const { data: privilegeGroupList } = useGetPrivilegeGroupsQuery({})
  useEffect(() => {
    if (privilegeGroupList) {
      const nameList = privilegeGroupList.filter(item =>
        item.type === CustomGroupType.CUSTOM &&
        item.name !== location?.name).map(item => item.name)
      setGroupNames(nameList as RolesEnum[])
    }
  }, [privilegeGroupList])

  const onClickSelectVenue = () => {
    setSelectVenueDrawer(true)
  }

  const onClickSelectCustomer = () => {
    setSelectCustomerDrawer(true)
  }

  const setSelectedVenus = (selected: Venue[]) => {
    setVenues(selected)
  }

  const setSelectedCustomers = (selected: MspEcWithVenue[]) => {
    setCustomers(selected)
  }
  const setSelectedRole = (selected: RolesEnum) => {
    setCustomRole(selected)
  }

  const onScopeChange = (e: RadioChangeEvent) => {
    setSelectedScope(e.target.value)
    if (e.target.value === ChoiceScopeEnum.ALL_VENUES)
      setSelectVenueDrawer(false)
  }

  const onCustomerChange = (e: RadioChangeEvent) => {
    setSelectedMspScope(e.target.value)
    if (e.target.value === ChoiceCustomerEnum.ALL_CUSTOMERS)
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
        delegation: isTechPartner ? true : false
      }
      const policies = [] as PrivilegePolicy[]
      selectedVenues.forEach((venue: Venue) => {
        policies.push({
          entityInstanceId: venue.id,
          objectType: PrivilegePolicyObjectType.OBJ_TYPE_VENUE
        })
      })
      privilegeGroupData.policies =
        (selectedScope === ChoiceScopeEnum.SPECIFIC_VENUE && policies.length > 0)
          ? policies : undefined

      if (isOnboardedMsp) {
        const policyEntities = [] as PrivilegePolicyEntity[]
        selectedCustomers.forEach((ec: MspEcWithVenue) => {
          const venueIds = ec.allVenues ? []
            : ec.children?.filter(v => v.selected).map(venue => venue.id)
          let venueList = {} as VenueObjectList
          venueList['com.ruckus.cloud.venue.model.venue'] = venueIds
          policyEntities.push({
            tenantId: ec.id,
            allVenues: ec.allVenues ?? false,
            objectList: ec.allVenues ? undefined : venueList
          })
        })
        privilegeGroupData.delegation = displayMspScope
        privilegeGroupData.policyEntityDTOS =
        (displayMspScope && selectedMspScope === ChoiceCustomerEnum.SPECIFIC_CUSTOMER &&
         policyEntities.length > 0) ? policyEntities : undefined
      }

      isClone ? await addPrivilegeGroup({ payload: privilegeGroupData }).unwrap()
        : await updatePrivilegeGroup({ params: { privilegeGroupId: groupId },
          payload: privilegeGroupData }).unwrap()

      navigate(linkToPrivilegeGroups)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }
  useEffect(() => {
    if (privilegeGroup) {
      const delegation = privilegeGroup.delegation || false
      form.setFieldValue('name', isClone ? (privilegeGroup.name + '-copy') : privilegeGroup.name)
      form.setFieldValue('description', privilegeGroup?.description)
      form.setFieldValue('role', privilegeGroup?.roleName)
      setDisplayMspScope(delegation)
      form.setFieldValue('mspscope', delegation)
      const venues = (venuesList?.data.filter(venue =>
        privilegeGroup?.policies?.map(p => p.entityInstanceId).includes(venue.id)) || [])
      setVenues(venues)
      const venueRadioButton = venues.length > 0
        ? ChoiceScopeEnum.SPECIFIC_VENUE : ChoiceScopeEnum.ALL_VENUES
      setSelectedScope(venueRadioButton)
      isOnboardedMsp
        ? form.setFieldValue('mspvenues', venueRadioButton)
        : form.setFieldValue('scope', venueRadioButton)

      const ecCustomers = (customerList?.data.filter(customer =>
        privilegeGroup?.policyEntityDTOS?.map(p => p.tenantId).includes(customer.id)) || [])
      const ecCustomersWithVenue: MspEcWithVenue[] = []
      ecCustomers.forEach((ec) => {
        const custPolicyEntities = privilegeGroup?.policyEntityDTOS?.find(p => p.tenantId === ec.id)
        const venueIds = custPolicyEntities
          ? custPolicyEntities.objectList
            ? custPolicyEntities.objectList['com.ruckus.cloud.venue.model.venue'] as string[]
            : []
          : []
        ecCustomersWithVenue.push(
          {
            ...ec,
            allVenues: custPolicyEntities?.allVenues,
            children: venueIds.map(venueId => {
              return { id: venueId, selected: true, name: '' }
            })
          }
        )
      })
      setCustomers(ecCustomersWithVenue)
      setSelectedMspScope(ecCustomersWithVenue.length > 0
        ? ChoiceCustomerEnum.SPECIFIC_CUSTOMER : ChoiceCustomerEnum.ALL_CUSTOMERS)
      form.setFieldValue('mspcustomers', ecCustomersWithVenue.length > 0
        ? ChoiceCustomerEnum.SPECIFIC_CUSTOMER : ChoiceCustomerEnum.ALL_CUSTOMERS)
      const memberCount = privilegeGroup?.memberCount || 0
      setDisableNameChange(memberCount > 0 && !isClone)
      setSelectedRole(privilegeGroup.roleName as RolesEnum)
    }
  }, [privilegeGroup, venuesList?.data, customerList?.data])

  function DisplaySelectedVenues (ownScope: boolean) {
    const firstVenue = selectedVenues[0]
    const restVenue = selectedVenues.slice(1)
    return <div style={{ marginLeft: ownScope ? '-12px' : '12px',
      marginTop: '-16px', marginBottom: '10px' }}>
      <UI.VenueList key={firstVenue.id}>
        <Typography.Text
          title={firstVenue.name}
          style={{ width: '250px' }}
          ellipsis={true}
        >
          {firstVenue.name}
        </Typography.Text>
        <Button
          type='link'
          style={{ marginLeft: '20px' }}
          onClick={onClickSelectVenue}
        >{intl.$t({ defaultMessage: 'Change' })}</Button>
      </UI.VenueList>
      {restVenue.map(venue =>
        <UI.VenueList key={venue.id}>
          <Typography.Text
            title={venue.name}
            style={{ width: '250px' }}
            ellipsis={true}
          >
            {venue.name}
          </Typography.Text>
        </UI.VenueList>
      )}</div>
  }

  const DisplaySelectedCustomers = () => {
    const firstCustomer = selectedCustomers[0]
    const restCustomer = selectedCustomers.slice(1)
    const firstCustomerVenues = `${firstCustomer.name} (${
      intl.$t({ defaultMessage: '{count} <VenuePlural></VenuePlural>' },
        { count: firstCustomer.allVenues ? 'All'
          : firstCustomer.children?.filter(v => v.selected).length })})`
    return <div style={{ marginLeft: '12px', marginTop: '-16px', marginBottom: '10px' }}>
      <UI.VenueList key={firstCustomer.id}>
        <Typography.Text
          title={firstCustomerVenues}
          style={{ width: '250px' }}
          ellipsis={true}
        >
          {firstCustomerVenues}
        </Typography.Text>
        <Button
          type='link'
          style={{ marginLeft: '20px' }}
          onClick={onClickSelectCustomer}
        >{intl.$t({ defaultMessage: 'Change' })}</Button>
      </UI.VenueList>
      {restCustomer.map(ec =>
        <UI.VenueList key={ec.id}>
          <Typography.Text
            title={`${ec.name} (${ec.allVenues ?
              intl.$t({ defaultMessage: 'All <VenuePlural></VenuePlural>' }) :
              intl.$t({ defaultMessage: '{count} <VenuePlural></VenuePlural>' },
                { count: ec.children?.filter(v => v.selected).length })})`}
            style={{ width: '250px' }}
            ellipsis={true}
          >
            {ec.name} ({
              intl.$t({ defaultMessage: '{count} <VenuePlural></VenuePlural>' },
                { count: ec.allVenues ? 'All <VenuePlural></VenuePlural>'
                  : ec?.children.filter(v => v.selected).length })
            })
          </Typography.Text>
        </UI.VenueList>
      )}</div>
  }

  const ScopeForm = () => {
    return <>
      <Form.Item
        name='scope'
        label={intl.$t({ defaultMessage: 'Scope' })}
        initialValue={ChoiceScopeEnum.ALL_VENUES}
        rules={[
          { validator: () =>{
            if(selectedScope === ChoiceScopeEnum.SPECIFIC_VENUE && selectedVenues.length === 0) {
              return Promise.reject(
                `${intl.$t({ defaultMessage: 'Please select <venuePlural></venuePlural>' })} `
              )
            }
            return Promise.resolve()}
          }
        ]}>
        <Radio.Group
          value={selectedScope}
          onChange={onScopeChange}
        >
          <Space direction={'vertical'} size={12}>
            <Radio
              key={ChoiceScopeEnum.ALL_VENUES}
              value={ChoiceScopeEnum.ALL_VENUES}>
              {intl.$t({ defaultMessage: 'All <VenuePlural></VenuePlural>' })}
            </Radio>
            <Radio
              key={ChoiceScopeEnum.SPECIFIC_VENUE}
              value={ChoiceScopeEnum.SPECIFIC_VENUE}>
              {intl.$t({ defaultMessage: 'Specific <VenuePlural></VenuePlural>' })}
            </Radio>
            <Button
              style={{ marginLeft: '22px' }}
              hidden={selectedScope === ChoiceScopeEnum.ALL_VENUES || selectedVenues.length > 0}
              type='link'
              onClick={onClickSelectVenue}
            >{intl.$t({ defaultMessage: 'Select <venuePlural></venuePlural>' })}</Button>
          </Space>
        </Radio.Group>
      </Form.Item>
      {selectedVenues.length > 0 && selectedScope === ChoiceScopeEnum.SPECIFIC_VENUE &&
        DisplaySelectedVenues(true)}
    </>
  }

  const MspScopeForm = () => {
    return <>
      <Form.Item
        name='ownscope'
        label={intl.$t({ defaultMessage: 'Scope' })}
        children={
          <Checkbox checked={true} children={intl.$t({ defaultMessage: 'Own Account' })} />
        }
      />
      <Form.Item
        name='mspvenues'
        rules={[
          { validator: () =>{
            if(selectedScope === ChoiceScopeEnum.SPECIFIC_VENUE && selectedVenues.length === 0) {
              return Promise.reject(
                `${intl.$t({ defaultMessage: 'Please select <venuePlural></venuePlural>' })} `
              )
            }
            return Promise.resolve()}
          }
        ]}>
        <Radio.Group
          style={{ marginLeft: 22 }}
          value={selectedScope}
          onChange={onScopeChange}
        >
          <Space direction={'vertical'} size={12}>
            <Radio
              key={ChoiceScopeEnum.ALL_VENUES}
              value={ChoiceScopeEnum.ALL_VENUES}>
              {intl.$t({ defaultMessage: 'All <VenuePlural></VenuePlural>' })}
            </Radio>
            <Radio
              key={ChoiceScopeEnum.SPECIFIC_VENUE}
              value={ChoiceScopeEnum.SPECIFIC_VENUE}>
              {intl.$t({ defaultMessage: 'Specific <VenuePlural></VenuePlural>' })}
            </Radio>
            <Button
              style={{ marginLeft: '22px' }}
              hidden={selectedScope === ChoiceScopeEnum.ALL_VENUES || selectedVenues.length > 0}
              type='link'
              onClick={onClickSelectVenue}
            >{intl.$t({ defaultMessage: 'Select <venuePlural></venuePlural>' })}</Button>
          </Space>
        </Radio.Group>
      </Form.Item>
      {selectedVenues.length > 0 && selectedScope === ChoiceScopeEnum.SPECIFIC_VENUE &&
        DisplaySelectedVenues(false)}

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
        name='mspcustomers'
        initialValue={ChoiceCustomerEnum.ALL_CUSTOMERS}
        hidden={!displayMspScope}
        rules={[
          { validator: () =>{
            if(selectedMspScope === ChoiceCustomerEnum.SPECIFIC_CUSTOMER
            && selectedCustomers.length === 0) {
              return Promise.reject(
                `${intl.$t({ defaultMessage: 'Please select customer(s)' })} `
              )
            }
            return Promise.resolve()}
          }
        ]}>
        <Radio.Group
          style={{ marginLeft: 22 }}
          value={selectedMspScope}
          onChange={onCustomerChange}
        >
          <Space direction={'vertical'} size={12}>
            <Radio
              key={ChoiceCustomerEnum.ALL_CUSTOMERS}
              value={ChoiceCustomerEnum.ALL_CUSTOMERS}>
              {intl.$t({ defaultMessage: 'All Customers' })}
            </Radio>
            <Radio
              key={ChoiceCustomerEnum.SPECIFIC_CUSTOMER}
              value={ChoiceCustomerEnum.SPECIFIC_CUSTOMER}>
              {intl.$t({ defaultMessage: 'Specific Customer(s)' })}
            </Radio>
            <Button
              style={{ marginLeft: '22px' }}
              hidden={selectedMspScope ===
              ChoiceCustomerEnum.ALL_CUSTOMERS || selectedCustomers.length > 0}
              type='link'
              onClick={onClickSelectCustomer}
            >Select customers</Button>
          </Space>
        </Radio.Group>
      </Form.Item>
      {displayMspScope && selectedCustomers.length > 0 &&
       selectedMspScope === ChoiceCustomerEnum.SPECIFIC_CUSTOMER &&
       <DisplaySelectedCustomers />}
    </>
  }

  const MspPrimeAdminScopeForm = () => {
    return <>
      <Form.Item
        name='mspscope'
        label={intl.$t({ defaultMessage: 'Scope' })}
        valuePropName='checked'
        children={
          <Checkbox checked={displayMspScope}
            onChange={e => setDisplayMspScope(e.target.checked)}
            children={intl.$t({ defaultMessage: 'MSP Customers' })} />
        }
      />
      <Form.Item
        name='mspcustomers'
        initialValue={ChoiceCustomerEnum.ALL_CUSTOMERS}
        hidden={!displayMspScope}
        rules={[
          { validator: () =>{
            if(selectedMspScope === ChoiceCustomerEnum.SPECIFIC_CUSTOMER
            && selectedCustomers.length === 0) {
              return Promise.reject(
                `${intl.$t({ defaultMessage: 'Please select customer(s)' })} `
              )
            }
            return Promise.resolve()}
          }
        ]}>
        <Radio.Group
          style={{ marginLeft: 22 }}
          value={selectedMspScope}
          onChange={onCustomerChange}
        >
          <Space direction={'vertical'} size={12}>
            <Radio
              key={ChoiceCustomerEnum.ALL_CUSTOMERS}
              value={ChoiceCustomerEnum.ALL_CUSTOMERS}>
              {intl.$t({ defaultMessage: 'All Customers' })}
            </Radio>
            <Radio
              key={ChoiceCustomerEnum.SPECIFIC_CUSTOMER}
              value={ChoiceCustomerEnum.SPECIFIC_CUSTOMER}>
              {intl.$t({ defaultMessage: 'Specific Customer(s)' })}
            </Radio>
            <Button
              style={{ marginLeft: '22px' }}
              hidden={selectedMspScope ===
              ChoiceCustomerEnum.ALL_CUSTOMERS || selectedCustomers.length > 0}
              type='link'
              onClick={onClickSelectCustomer}
            >Select customers</Button>
          </Space>
        </Radio.Group>
      </Form.Item>
      {displayMspScope && selectedCustomers.length > 0 &&
       selectedMspScope === ChoiceCustomerEnum.SPECIFIC_CUSTOMER &&
        <DisplaySelectedCustomers />}
    </>
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
                { max: 128 },
                { validator: (_, value) => {
                  if(groupNames.includes(value)) {
                    return Promise.reject(
                      `${intl.$t({ defaultMessage: 'Name already exists' })} `
                    )
                  }
                  return Promise.resolve()}
                },
                { validator: (_, value) => systemDefinedNameValidator(value) },
                { validator: (_, value) => specialCharactersRegExp(value),
                  message: intl.$t({ defaultMessage:
                    'Special characters (other than $, -, . and _) are not allowed' })
                },
                { validator: (_, value) => excludeSpaceRegExp(value) }
              ]}
              children={<Input disabled={disableNameChange} />}
            />
            <Form.Item
              name='description'
              label={intl.$t({ defaultMessage: 'Description' })}
              rules={[
                { max: 180 }
              ]}
              children={
                <Input.TextArea rows={4} />
              }
            />
            <CustomRoleSelector
              isOnboardedMsp={isOnboardedMsp}
              isEditMode={true}
              disabled={privilegeGroup?.roleName === RolesEnum.PRIME_ADMIN}
              setSelected={setSelectedRole}
            />
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={8}>
            {isOnboardedMsp
              ? (privilegeGroup?.roleName === RolesEnum.PRIME_ADMIN
                ? <MspPrimeAdminScopeForm /> : <MspScopeForm />)
              : <ScopeForm />}
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  }

  return (<>
    <PageHeader
      title={isClone ? intl.$t({ defaultMessage: 'Clone Privilege Group' })
        : intl.$t({ defaultMessage: 'Edit Privilege Group' })
      }
      breadcrumb={[
        { text: intl.$t({ defaultMessage: 'Administration' }) },
        { text: intl.$t({ defaultMessage: 'Users & Privileges' }) },
        { text: intl.$t({ defaultMessage: 'Privilege Groups' }),
          link: '/administration/userPrivileges/privilegeGroups' }
      ]}
      footer={<AdministrationTabs />}
    />
    <PrivilegeGroupForm />
    {selectVenueDrawer && <SelectVenuesDrawer
      visible={selectVenueDrawer}
      selected={selectedVenues}
      setVisible={setSelectVenueDrawer}
      setSelected={setSelectedVenus}
    />}
    {selectCustomerDrawer && (selectedRole === RolesEnum.PRIME_ADMIN
      ? <SelectCustomerOnlyDrawer
        visible={selectCustomerDrawer}
        selected={selectedCustomers}
        setVisible={setSelectCustomerDrawer}
        setSelected={setSelectedCustomers}
      />
      : <SelectCustomerDrawer
        visible={selectCustomerDrawer}
        selected={selectedCustomers}
        setVisible={setSelectCustomerDrawer}
        setSelected={setSelectedCustomers}
      />)
    }
  </>)
}
