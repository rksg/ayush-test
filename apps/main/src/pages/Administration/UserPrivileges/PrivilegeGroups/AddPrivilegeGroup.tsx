
import React, { useEffect, useState } from 'react'

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
  StepsForm
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { MspEcWithVenue }                                           from '@acx-ui/msp/utils'
import { useAddPrivilegeGroupMutation, useGetPrivilegeGroupsQuery } from '@acx-ui/rc/services'
import {
  CustomGroupType,
  PrivilegePolicy,
  PrivilegePolicyEntity,
  PrivilegePolicyObjectType,
  Venue,
  VenueObjectList,
  excludeSpaceRegExp,
  specialCharactersRegExp,
  systemDefinedNameValidator,
  TenantType
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { RolesEnum } from '@acx-ui/types'

import CustomRoleSelector from '../CustomRoles/CustomRoleSelector'
import * as UI            from '../styledComponents'


import { NewSelectCustomerDrawer }  from './NewSelectCustomerDrawer'
import { SelectCustomerDrawer }     from './SelectCustomerDrawer'
import { SelectCustomerOnlyDrawer } from './SelectCustomerOnlyDrawer'
import { SelectVenuesDrawer }       from './SelectVenuesDrawer'

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

export enum ChoiceScopeEnum {
  ALL_VENUES = 'ALL_VENUES',
  SPECIFIC_VENUE = 'SPECIFIC_VENUE'
}

export enum ChoiceCustomerEnum {
  ALL_CUSTOMERS = 'ALL_CUSTOMERS',
  SPECIFIC_CUSTOMER = 'SPECIFIC_CUSTOMER'
}

export function AddPrivilegeGroup () {
  const intl = useIntl()
  const [selectVenueDrawer, setSelectVenueDrawer] = useState(false)
  const [selectCustomerDrawer, setSelectCustomerDrawer] = useState(false)
  const [selectedScope, setSelectedScope ] = useState(ChoiceScopeEnum.ALL_VENUES)
  const [selectedMspScope, setSelectedMspScope ] = useState(ChoiceCustomerEnum.ALL_CUSTOMERS)
  const [selectedVenues, setVenues] = useState([] as Venue[])
  const [selectedCustomers, setCustomers] = useState([] as MspEcWithVenue[])
  const [displayMspScope, setDisplayMspScope] = useState(false)
  const [selectedRole, setCustomRole] = useState('')

  const navigate = useNavigate()
  const location = useLocation().state as PrivilegeGroupSateProps
  const [groupNames, setGroupNames] = useState([] as RolesEnum[])

  const customerListEnhancementToggle =
    useIsSplitOn(Features.ACX_UI_PRIVILEGE_GROUP_CUSTOMERS_LIST_ENHANCEMENT)

  const linkToPrivilegeGroups = useTenantLink('/administration/userPrivileges/privilegeGroups', 't')
  const [form] = Form.useForm()
  const [addPrivilegeGroup] = useAddPrivilegeGroupMutation()
  const isOnboardedMsp = location.isOnboardedMsp ?? false
  const tenantType = location?.tenantType as TenantType
  const isTechPartner =
    tenantType === TenantType.MSP_INSTALLER || tenantType === TenantType.MSP_INTEGRATOR

  const { data: privilegeGroupList } = useGetPrivilegeGroupsQuery({})
  useEffect(() => {
    if (privilegeGroupList) {
      const nameList = privilegeGroupList.filter(item =>
        item.type === CustomGroupType.CUSTOM).map(item => item.name)
      setGroupNames(nameList as RolesEnum[])
    }
  }, [privilegeGroupList])

  const onClickSelectVenue = () => {
    setSelectVenueDrawer(true)
  }

  const onClickSelectCustomer = () => {
    setSelectCustomerDrawer(true)
  }

  const setSelectedVenues = (selected: Venue[]) => {
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

  const handleAddPrivilegeGroup = async () => {
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
          if (privilegeGroupData.roleName === RolesEnum.PRIME_ADMIN) {
            ec.allVenues = true
          }
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

      await addPrivilegeGroup({ payload: privilegeGroupData }).unwrap()

      navigate(linkToPrivilegeGroups )
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

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
    const firstCustomerWithVenues = `${firstCustomer.name} (${firstCustomer.allVenues ?
      intl.$t({ defaultMessage: 'All <VenuePlural></VenuePlural>' }) :
      intl.$t({ defaultMessage: '{count} <VenuePlural></VenuePlural>' },
        { count: firstCustomer.children?.filter(v => v.selected).length })})`
    return <div style={{ marginLeft: '12px', marginTop: '-16px', marginBottom: '10px' }}>
      <UI.VenueList key={firstCustomer.id}>
        <Typography.Text
          title={firstCustomerWithVenues}
          style={{ width: '250px' }}
          ellipsis={true}
        >
          {firstCustomerWithVenues}
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
            {ec.name} ({ec.allVenues ?
              intl.$t({ defaultMessage: 'All <VenuePlural></VenuePlural>' }) :
              intl.$t({ defaultMessage: '{count} <VenuePlural></VenuePlural>' },
                { count: ec.children?.filter(v => v.selected).length })})
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
        DisplaySelectedVenues(true) }
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
        DisplaySelectedVenues(false) }

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
            >{intl.$t({ defaultMessage: 'Select customers' })}</Button>
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
            >
              {intl.$t({ defaultMessage: 'Select customers' })}
            </Button>
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
              children={<Input />}
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
              setSelected={setSelectedRole}
            />
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={8}>
            {isOnboardedMsp
              ? (selectedRole === RolesEnum.PRIME_ADMIN
                ? <MspPrimeAdminScopeForm /> : <MspScopeForm />)
              : <ScopeForm />}
          </Col>
        </Row>
        {selectVenueDrawer && <SelectVenuesDrawer
          visible={selectVenueDrawer}
          selected={selectedVenues}
          setVisible={setSelectVenueDrawer}
          setSelected={setSelectedVenues}
        />}
        {selectCustomerDrawer && (selectedRole === RolesEnum.PRIME_ADMIN
          ? <SelectCustomerOnlyDrawer
            visible={selectCustomerDrawer}
            selected={selectedCustomers}
            setVisible={setSelectCustomerDrawer}
            setSelected={setSelectedCustomers}
          />
          : customerListEnhancementToggle
            ? <NewSelectCustomerDrawer
              visible={selectCustomerDrawer}
              selected={selectedCustomers}
              setVisible={setSelectCustomerDrawer}
              setSelected={setSelectedCustomers}/>
            : <SelectCustomerDrawer
              visible={selectCustomerDrawer}
              selected={selectedCustomers}
              setVisible={setSelectCustomerDrawer}
              setSelected={setSelectedCustomers}
            />)
        }

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
