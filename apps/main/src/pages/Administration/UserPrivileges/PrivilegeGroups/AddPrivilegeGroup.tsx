
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
import { MspEcWithVenue }               from '@acx-ui/msp/utils'
import { useAddPrivilegeGroupMutation } from '@acx-ui/rc/services'
import {
  PrivilegePolicy,
  PrivilegePolicyEntity,
  PrivilegePolicyObjectType,
  Venue,
  VenueObjectList
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

import CustomRoleSelector from '../CustomRoles/CustomRoleSelector'
import * as UI            from '../styledComponents'


import { SelectCustomerDrawer } from './SelectCustomerDrawer'
import { SelectVenuesDrawer }   from './SelectVenuesDrawer'

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

  const setSelectedVenues = (selected: Venue[]) => {
    setVenues(selected)
  }

  const setSelectedCustomers = (selected: MspEcWithVenue[]) => {
    setCustomers(selected)
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
        delegation: false
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
          const venueIds = ec.children.filter(v => v.selected).map(venue => venue.id)
          let venueList = {} as VenueObjectList
          venueList['com.ruckus.cloud.venue.model.venue'] = venueIds
          policyEntities.push({
            tenantId: ec.id,
            objectList: venueList
          })
        })
        privilegeGroupData.delegation = displayMspScope
        privilegeGroupData.policyEntityDTOS =
        (selectedMspScope === ChoiceCustomerEnum.SPECIFIC_CUSTOMER && policyEntities.length > 0)
          ? policyEntities : undefined
      }

      await addPrivilegeGroup({ payload: privilegeGroupData }).unwrap()

      navigate(linkToPrivilegeGroups )
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const DisplaySelectedVenues = () => {
    const firstVenue = selectedVenues[0]
    const restVenue = selectedVenues.slice(1)
    return <div style={{ marginLeft: '12px', marginTop: '-16px', marginBottom: '10px' }}>
      <UI.VenueList key={firstVenue.id}>
        {firstVenue.name}
        <Button
          type='link'
          style={{ marginLeft: '40px' }}
          onClick={onClickSelectVenue}
        >{intl.$t({ defaultMessage: 'Change' })}</Button>
      </UI.VenueList>
      {restVenue.map(venue =>
        <UI.VenueList key={venue.id}>
          {venue.name}
        </UI.VenueList>
      )}</div>
  }

  const DisplaySelectedCustomers = () => {
    const firstCustomer = selectedCustomers[0]
    const restCustomer = selectedCustomers.slice(1)
    return <div style={{ marginLeft: '12px', marginTop: '-16px', marginBottom: '10px' }}>
      <UI.VenueList key={firstCustomer.id}>
        {firstCustomer.name} ({firstCustomer.children.every(v => v.selected) ?
          'All Venues' : (firstCustomer.children.filter(v => v.selected).length + ' ' +
        (firstCustomer.children.filter(v => v.selected).length > 1 ? ' Venues' : ' Venue'))})
        <Button
          type='link'
          style={{ marginLeft: '40px' }}
          onClick={onClickSelectCustomer}
        >{intl.$t({ defaultMessage: 'Change' })}</Button>
      </UI.VenueList>
      {restCustomer.map(ec =>
        <UI.VenueList key={ec.id}>
          {ec.name} ({ec.children.every(v => v.selected) ?
            'All Venues' : (ec.children.filter(v => v.selected).length + ' ' +
          (ec.children.filter(v => v.selected).length > 1 ? ' Venues' : ' Venue'))})
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
                `${intl.$t({ defaultMessage: 'Please select venue(s)' })} `
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
              {intl.$t({ defaultMessage: 'All Venues' })}
            </Radio>
            <Radio
              key={ChoiceScopeEnum.SPECIFIC_VENUE}
              value={ChoiceScopeEnum.SPECIFIC_VENUE}>
              {intl.$t({ defaultMessage: 'Specific Venue(s)' })}
            </Radio>
            <Button
              style={{ marginLeft: '22px' }}
              hidden={selectedScope === ChoiceScopeEnum.ALL_VENUES || selectedVenues.length > 0}
              type='link'
              onClick={onClickSelectVenue}
            >{intl.$t({ defaultMessage: 'Select venues' })}</Button>
          </Space>
        </Radio.Group>
      </Form.Item>
      {selectedVenues.length > 0 && selectedScope === ChoiceScopeEnum.SPECIFIC_VENUE &&
        <DisplaySelectedVenues />}
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
                `${intl.$t({ defaultMessage: 'Please select venue(s)' })} `
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
              {intl.$t({ defaultMessage: 'All Venues' })}
            </Radio>
            <Radio
              key={ChoiceScopeEnum.SPECIFIC_VENUE}
              value={ChoiceScopeEnum.SPECIFIC_VENUE}>
              {intl.$t({ defaultMessage: 'Specific Venue(s)' })}
            </Radio>
            <Button
              style={{ marginLeft: '22px' }}
              hidden={selectedScope === ChoiceScopeEnum.ALL_VENUES || selectedVenues.length > 0}
              type='link'
              onClick={onClickSelectVenue}
            >{intl.$t({ defaultMessage: 'Select venues' })}</Button>
          </Space>
        </Radio.Group>
      </Form.Item>
      {selectedVenues.length > 0 && selectedScope === ChoiceScopeEnum.SPECIFIC_VENUE &&
        <DisplaySelectedVenues />}

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
      {selectedCustomers.length > 0 && selectedMspScope === ChoiceCustomerEnum.SPECIFIC_CUSTOMER &&
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
        {selectVenueDrawer && <SelectVenuesDrawer
          visible={selectVenueDrawer}
          selected={selectedVenues}
          setVisible={setSelectVenueDrawer}
          setSelected={setSelectedVenues}
        />}
        {selectCustomerDrawer && <SelectCustomerDrawer
          visible={selectCustomerDrawer}
          selected={selectedCustomers}
          setVisible={setSelectCustomerDrawer}
          setSelected={setSelectedCustomers}
        />}

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
