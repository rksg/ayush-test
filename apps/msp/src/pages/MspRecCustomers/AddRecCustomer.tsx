import { useState } from 'react'

import {
  Form,
  Typography
} from 'antd'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  Subtitle
} from '@acx-ui/components'
// import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import {
} from '@acx-ui/msp/services'
import { ManageAdminsDrawer, SelectIntegratorDrawer } from '@acx-ui/msp/components'
// import {
//   useAddCustomerMutation,
//   useUpdateCustomerMutation
// } from '@acx-ui/msp/services'
import {
  MspAdministrator,
  MspEc
} from '@acx-ui/msp/utils'
import { roleDisplayText } from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
// import { useGetUserProfileQuery } from '@acx-ui/user'
import { AccountType } from '@acx-ui/utils'

import { SelectRecCustomerDrawer } from './SelectRecCustomer'
import * as UI                     from './styledComponents'



export function AddRecCustomer () {
  const intl = useIntl()
  //   const isHspSupportEnabled = useIsSplitOn(Features.MSP_HSP_SUPPORT)

  const navigate = useNavigate()
  const linkToRecCustomers = useTenantLink('/dashboard/mspreccustomers', 'v')
  //   const { action, status, tenantId, mspEcTenantId } = useParams()
  const { action, mspEcTenantId } = useParams()

  const [mspRecCustomer, setRecCustomer] = useState([] as MspAdministrator[])
  const [mspAdmins, setAdministrator] = useState([] as MspAdministrator[])
  const [mspIntegrator, setIntegrator] = useState([] as MspEc[])
  const [mspInstaller, setInstaller] = useState([] as MspEc[])
  const [drawerRecVisible, setDrawerRecVisible] = useState(false)
  const [drawerAdminVisible, setDrawerAdminVisible] = useState(false)
  const [drawerIntegratorVisible, setDrawerIntegratorVisible] = useState(false)
  const [drawerInstallerVisible, setDrawerInstallerVisible] = useState(false)
  //   const [addCustomer] = useAddCustomerMutation()
  //   const [updateCustomer] = useUpdateCustomerMutation()

  const { Paragraph } = Typography
  const isEditMode = action === 'edit'

  //   const { data: userProfile } = useGetUserProfileQuery({ params: useParams() })

  //   const handleAddCustomer = //async (values: EcFormData) => {
  // try {
  //   const ecFormData = { ...values }
  //   const today = EntitlementUtil.getServiceStartDate()
  //   const expirationDate = EntitlementUtil.getServiceEndDate(subscriptionEndDate)
  //   const quantityWifi = _.isString(ecFormData.wifiLicense)
  //     ? parseInt(ecFormData.wifiLicense, 10) : ecFormData.wifiLicense
  //   const quantitySwitch = _.isString(ecFormData.switchLicense)
  //     ? parseInt(ecFormData.switchLicense, 10) : ecFormData.switchLicense
  //   const quantityApsw = _.isString(ecFormData.apswLicense)
  //     ? parseInt(ecFormData.apswLicense, 10) : ecFormData.apswLicense
  //   const assignLicense = trialSelected ? { trialAction: AssignActionEnum.ACTIVATE }
  //     : isDeviceAgnosticEnabled
  //       ? { assignments: [{
  //         quantity: quantityApsw,
  //         action: AssignActionEnum.ADD,
  //         isTrial: false,
  //         deviceType: EntitlementDeviceType.MSP_APSW
  //       }] }
  //       : { assignments: [{
  //         quantity: quantityWifi,
  //         action: AssignActionEnum.ADD,
  //         isTrial: false,
  //         deviceType: EntitlementDeviceType.MSP_WIFI
  //       },
  //       {
  //         quantity: quantitySwitch,
  //         action: AssignActionEnum.ADD,
  //         isTrial: false,
  //         deviceType: EntitlementDeviceType.MSP_SWITCH
  //       }] }

  //   const delegations= [] as MspEcDelegatedAdmins[]
  //   mspAdmins.forEach((admin: MspAdministrator) => {
  //     delegations.push({
  //       msp_admin_id: admin.id,
  //       msp_admin_role: admin.role
  //     })
  //   })
  //   const customer: MspEcData = {
  //     tenant_type: AccountType.MSP_EC,
  //     name: ecFormData.name,
  //     street_address: ecFormData.address.addressLine as string,
  //     city: address.city,
  //     country: address.country,
  //     service_effective_date: today,
  //     service_expiration_date: expirationDate,
  //     admin_delegations: delegations,
  //     licenses: assignLicense
  //   }
  //   if (ecFormData.admin_email) {
  //     customer.admin_email = ecFormData.admin_email
  //     customer.admin_firstname = ecFormData.admin_firstname
  //     customer.admin_lastname = ecFormData.admin_lastname
  //     customer.admin_role = ecFormData.admin_role
  //   }
  //   const ecDelegations=[] as MspIntegratorDelegated[]
  //   if (mspIntegrator.length > 0) {
  //     ecDelegations.push({
  //       delegation_type: AccountType.MSP_INTEGRATOR,
  //       delegation_id: mspIntegrator[0].id
  //     })
  //   }
  //   if (mspInstaller.length > 0) {
  //     ecDelegations.push({
  //       delegation_type: AccountType.MSP_INSTALLER,
  //       delegation_id: mspInstaller[0].id
  //     })
  //   }
  //   if (ecDelegations.length > 0) {
  //     customer.delegations = ecDelegations
  //   }

  //   const result =
  //   await addCustomer({ params: { tenantId: tenantId }, payload: customer }).unwrap()
  //   if (result) {
  //   // const ecTenantId = result.tenant_id
  //   }
  //   navigate(linkToRecCustomers, { replace: true })
  //   return true
  // } catch (error) {
  //   console.log(error) // eslint-disable-line no-console
  //   return false
  // }
  //   }

  //   const handleEditCustomer = async (values: EcFormData) => {
  // try {
  //   const ecFormData = { ...values }
  //   const today = EntitlementUtil.getServiceStartDate()
  //   const expirationDate = EntitlementUtil.getServiceEndDate(subscriptionEndDate)
  //   const expirationDateOrig = EntitlementUtil.getServiceEndDate(subscriptionOrigEndDate)
  //   const needUpdateLicense = expirationDate !== expirationDateOrig

  //   const licAssignment = []
  //   if (isTrialEditMode) {
  //     const quantityWifi = _.isString(ecFormData.wifiLicense)
  //       ? parseInt(ecFormData.wifiLicense, 10) : ecFormData.wifiLicense
  //     licAssignment.push({
  //       quantity: quantityWifi,
  //       action: AssignActionEnum.ADD,
  //       isTrial: false,
  //       deviceType: EntitlementDeviceType.MSP_WIFI
  //     })
  //     const quantitySwitch = _.isString(ecFormData.switchLicense)
  //       ? parseInt(ecFormData.switchLicense, 10) : ecFormData.switchLicense
  //     licAssignment.push({
  //       quantity: quantitySwitch,
  //       action: AssignActionEnum.ADD,
  //       isTrial: false,
  //       deviceType: EntitlementDeviceType.MSP_SWITCH
  //     })
  //     if (isDeviceAgnosticEnabled) {
  //       const quantityApsw = _.isString(ecFormData.apswLicense)
  //         ? parseInt(ecFormData.apswLicense, 10) : ecFormData.apswLicense
  //       licAssignment.push({
  //         quantity: quantityApsw,
  //         action: AssignActionEnum.ADD,
  //         isTrial: false,
  //         deviceType: EntitlementDeviceType.MSP_APSW
  //       })
  //     }
  //   } else {
  //     if (_.isString(ecFormData.wifiLicense) || needUpdateLicense) {
  //       const wifiAssignId = getAssignmentId(EntitlementDeviceType.MSP_WIFI)
  //       const quantityWifi = _.isString(ecFormData.wifiLicense)
  //         ? parseInt(ecFormData.wifiLicense, 10) : ecFormData.wifiLicense
  //       const actionWifi = wifiAssignId === 0 ? AssignActionEnum.ADD : AssignActionEnum.MODIFY
  //       licAssignment.push({
  //         quantity: quantityWifi,
  //         assignmentId: wifiAssignId,
  //         action: actionWifi,
  //         isTrial: false,
  //         deviceType: EntitlementDeviceType.MSP_WIFI
  //       })
  //     }
  //     if (_.isString(ecFormData.switchLicense) || needUpdateLicense) {
  //       const switchAssignId = getAssignmentId(EntitlementDeviceType.MSP_SWITCH)
  //       const quantitySwitch = _.isString(ecFormData.switchLicense)
  //         ? parseInt(ecFormData.switchLicense, 10) : ecFormData.switchLicense
  //       const actionSwitch = switchAssignId === 0 ? AssignActionEnum.ADD : AssignActionEnum.MODIFY
  //       licAssignment.push({
  //         quantity: quantitySwitch,
  //         assignmentId: switchAssignId,
  //         action: actionSwitch,
  //         deviceSubtype: EntitlementDeviceSubType.ICX,
  //         deviceType: EntitlementDeviceType.MSP_SWITCH
  //       })
  //     }

  //     if (isDeviceAgnosticEnabled ) {
  //       if (_.isString(ecFormData.apswLicense) || needUpdateLicense) {
  //         const apswAssignId = getAssignmentId(EntitlementDeviceType.MSP_APSW)
  //         const quantityApsw = _.isString(ecFormData.apswLicense)
  //           ? parseInt(ecFormData.apswLicense, 10) : ecFormData.apswLicense
  //         const actionApsw = apswAssignId === 0 ? AssignActionEnum.ADD : AssignActionEnum.MODIFY
  //         licAssignment.push({
  //           quantity: quantityApsw,
  //           assignmentId: apswAssignId,
  //           action: actionApsw,
  //           deviceType: EntitlementDeviceType.MSP_APSW
  //         })
  //       }
  //     }
  //   }

  //   const customer: MspEcData = {
  //     tenant_type: AccountType.MSP_EC,
  //     name: ecFormData.name,
  //     street_address: ecFormData.address.addressLine as string,
  //     city: address.city,
  //     country: address.country,
  //     service_effective_date: today,
  //     service_expiration_date: expirationDate
  //   }
  //   if (!isTrialMode && licAssignment.length > 0) {
  //     let assignLicense = {
  //       subscription_start_date: today,
  //       subscription_end_date: expirationDate,
  //       assignments: licAssignment
  //     }
  //     customer.licenses = assignLicense
  //   }

  //   await updateCustomer({ params: { mspEcTenantId: mspEcTenantId }, payload: customer }).unwrap()
  //   navigate(linkToRecCustomers, { replace: true })
  //   return true
  // } catch (error) {
  //   console.log(error) // eslint-disable-line no-console
  //   return false
  // }
  //   }
  const selectedRecCustomer = (selected: MspAdministrator[]) => {
    setRecCustomer(selected)
  }

  const selectedMspAdmins = (selected: MspAdministrator[]) => {
    setAdministrator(selected)
  }

  const selectedIntegrators = (tenantType: string, selected: MspEc[] ) => {
    (tenantType === AccountType.MSP_INTEGRATOR) ? setIntegrator(selected) : setInstaller(selected)
  }

  const displayRecCustomer = () => {
    if (!mspRecCustomer || mspRecCustomer.length === 0)
      return '--'
    if (mspRecCustomer.length === 1) {
      return <>
        <Form.Item
          label={intl.$t({ defaultMessage: 'Name' })}
        >
          <Paragraph>{mspRecCustomer[0].name}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Email' })}
        >
          <Paragraph>{mspRecCustomer[0].email}</Paragraph>
        </Form.Item>
      </>
    }
    return <div style={{ marginTop: '5px', marginBottom: '30px' }}>
      {mspRecCustomer.map(admin =>
        <UI.AdminList>
          {admin.email} {intl.$t(roleDisplayText[admin.role])}
        </UI.AdminList>
      )}
    </div>
  }

  const displayMspAdmins = () => {
    if (!mspAdmins || mspAdmins.length === 0)
      return '--'
    return <>
      {mspAdmins.map(admin =>
        <UI.AdminList key={admin.id}>
          {admin.email} ({intl.$t(roleDisplayText[admin.role])})
        </UI.AdminList>
      )}
    </>
  }

  const displayIntegrator = () => {
    const value = !mspIntegrator || mspIntegrator.length === 0 ? '--' : mspIntegrator[0].name
    return value
  }

  const displayInstaller = () => {
    const value = !mspInstaller || mspInstaller.length === 0 ? '--' : mspInstaller[0].name
    return value
  }

  const MspAdminsForm = () => {
    return <>
      <UI.FieldLabelAdmins width='275px' style={{ marginTop: '15px' }}>
        <label>{intl.$t({ defaultMessage: 'REC Customer' })}</label>
        <Form.Item children={<div>{displayRecCustomer()}</div>} />
        {!isEditMode && <Form.Item
          children={<UI.FieldTextLink onClick={() => setDrawerRecVisible(true)}>
            {intl.$t({ defaultMessage: 'Manage' })}
          </UI.FieldTextLink>
          }
        />}
      </UI.FieldLabelAdmins>
      <UI.FieldLabelAdmins width='275px' style={{ marginTop: '-12px' }}>
        <label>{intl.$t({ defaultMessage: 'MSP Administrators' })}</label>
        <Form.Item children={<div>{displayMspAdmins()}</div>} />
        {!isEditMode && <Form.Item
          children={<UI.FieldTextLink onClick={() => setDrawerAdminVisible(true)}>
            {intl.$t({ defaultMessage: 'Manage' })}
          </UI.FieldTextLink>
          }
        />}
      </UI.FieldLabelAdmins>
      <UI.FieldLabelAdmins width='275px' style={{ marginTop: '-12px' }}>
        <label>{intl.$t({ defaultMessage: 'Integrator' })}</label>
        <Form.Item children={displayIntegrator()} />
        {!isEditMode && <Form.Item
          children={<UI.FieldTextLink onClick={() => setDrawerIntegratorVisible(true)}>
            {intl.$t({ defaultMessage: 'Manage' })}
          </UI.FieldTextLink>}
        />}
      </UI.FieldLabelAdmins>
      <UI.FieldLabelAdmins width='275px' style={{ marginTop: '-12px' }}>
        <label>{intl.$t({ defaultMessage: 'Installer' })}</label>
        <Form.Item children={displayInstaller()} />
        {!isEditMode && <Form.Item
          children={<UI.FieldTextLink onClick={() => setDrawerInstallerVisible(true)}>
            {intl.$t({ defaultMessage: 'Manage' })}
          </UI.FieldTextLink>}
        />}
      </UI.FieldLabelAdmins>
    </>
  }

  return (
    <>
      <PageHeader
        title={intl.$t({ defaultMessage: 'Add REC Customer Account' })}
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'My Customers' }) },
          {
            text: intl.$t({ defaultMessage: 'MSP REC Customers' }),
            link: '/dashboard/mspRecCustomers', tenantType: 'v'
          }
        ]}
      />
      <StepsForm
        // formRef={formRef}
        // onFinish={isEditMode ? handleEditCustomer : handleAddCustomer}
        onCancel={() => navigate(linkToRecCustomers)}
        buttonLabel={{ submit: isEditMode ?
          intl.$t({ defaultMessage: 'Save' }):
          intl.$t({ defaultMessage: 'Add' }) }}
      >

        <StepsForm.StepForm
          name='accountDetail'
          title={intl.$t({ defaultMessage: 'Account Details' })}
        >
          <Subtitle level={3}>
            { intl.$t({ defaultMessage: 'Account Details' }) }</Subtitle>

          <MspAdminsForm></MspAdminsForm>
        </StepsForm.StepForm>

      </StepsForm>

      {drawerRecVisible && <SelectRecCustomerDrawer
        visible={drawerRecVisible}
        setVisible={setDrawerRecVisible}
        setSelected={selectedRecCustomer}
        tenantId={mspEcTenantId}
      />}
      {drawerAdminVisible && <ManageAdminsDrawer
        visible={drawerAdminVisible}
        setVisible={setDrawerAdminVisible}
        setSelected={selectedMspAdmins}
        tenantId={mspEcTenantId}
      />}
      {drawerIntegratorVisible && <SelectIntegratorDrawer
        visible={drawerIntegratorVisible}
        tenantType={AccountType.MSP_INTEGRATOR}
        setVisible={setDrawerIntegratorVisible}
        setSelected={selectedIntegrators}
      />}
      {drawerInstallerVisible && <SelectIntegratorDrawer
        visible={drawerInstallerVisible}
        tenantType={AccountType.MSP_INSTALLER}
        setVisible={setDrawerInstallerVisible}
        setSelected={selectedIntegrators}
      />}
    </>
  )
}
