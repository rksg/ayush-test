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
import { ManageAdminsDrawer, SelectIntegratorDrawer } from '@acx-ui/msp/components'
import { useAddRecCustomerMutation }                  from '@acx-ui/msp/services'
import {
  MspAdministrator,
  MspEc,
  MspEcDelegatedAdmins,
  MspIntegratorDelegated,
  MspRecCustomer,
  MspRecData
} from '@acx-ui/msp/utils'
import { roleDisplayText } from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { AccountType } from '@acx-ui/utils'

import { SelectRecCustomerDrawer } from './SelectRecCustomer'
import * as UI                     from './styledComponents'



export function AddRecCustomer () {
  const intl = useIntl()
  const navigate = useNavigate()
  const linkToRecCustomers = useTenantLink('/dashboard/mspreccustomers', 'v')
  //   const { action, status, tenantId, mspEcTenantId } = useParams()
  const { action, tenantId, mspEcTenantId } = useParams()

  const [mspRecCustomer, setRecCustomer] = useState([] as MspRecCustomer[])
  const [mspAdmins, setAdministrator] = useState([] as MspAdministrator[])
  const [mspIntegrator, setIntegrator] = useState([] as MspEc[])
  const [mspInstaller, setInstaller] = useState([] as MspEc[])
  const [drawerRecVisible, setDrawerRecVisible] = useState(false)
  const [drawerAdminVisible, setDrawerAdminVisible] = useState(false)
  const [drawerIntegratorVisible, setDrawerIntegratorVisible] = useState(false)
  const [drawerInstallerVisible, setDrawerInstallerVisible] = useState(false)
  const [addRecCustomer] = useAddRecCustomerMutation()

  const { Paragraph } = Typography
  const isEditMode = action === 'edit'

  const handleAddCustomer = async () => {
    try {

      const delegations= [] as MspEcDelegatedAdmins[]
      mspAdmins.forEach((admin: MspAdministrator) => {
        delegations.push({
          msp_admin_id: admin.id,
          msp_admin_role: admin.role
        })
      })
      const ecDelegations=[] as MspIntegratorDelegated[]
      if (mspIntegrator.length > 0) {
        ecDelegations.push({
          delegation_type: AccountType.MSP_INTEGRATOR,
          delegation_id: mspIntegrator[0].id
        })
      }
      if (mspInstaller.length > 0) {
        ecDelegations.push({
          delegation_type: AccountType.MSP_INSTALLER,
          delegation_id: mspInstaller[0].id
        })
      }
      const customer: MspRecData = {
        account_id: mspRecCustomer[0].account_id,
        admin_delegations: delegations
      }

      if (ecDelegations.length > 0) {
        customer.delegations = ecDelegations
      }

      const result =
    await addRecCustomer({ params: { tenantId: tenantId }, payload: customer }).unwrap()
      if (result) {
        // const ecTenantId = result.tenant_id
      }
      navigate(linkToRecCustomers, { replace: true })
      return true
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
      return false
    }
  }

  const selectedRecCustomer = (selected: MspRecCustomer[]) => {
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
    return <>
      <Form.Item
        label={intl.$t({ defaultMessage: 'Name' })}
      >
        <Paragraph>{mspRecCustomer[0].account_name}</Paragraph>
      </Form.Item>
      <Form.Item style={{ marginTop: '-22px' }}
        label={intl.$t({ defaultMessage: 'Email' })}
      >
        <Paragraph>{mspRecCustomer[0].email_id}</Paragraph>
      </Form.Item>
    </>
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
        onFinish={handleAddCustomer}
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
