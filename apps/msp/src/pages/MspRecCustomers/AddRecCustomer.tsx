import { useEffect, useState } from 'react'

import {
  Form,
  Switch,
  Typography
} from 'antd'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  Subtitle,
  showToast
} from '@acx-ui/components'
import { ManageAdminsDrawer, SelectIntegratorDrawer } from '@acx-ui/msp/components'
import {
  useAddRecCustomerMutation,
  useDisableMspEcSupportMutation,
  useEnableMspEcSupportMutation,
  useGetMspEcDelegatedAdminsQuery,
  useGetMspEcSupportQuery,
  useMspAdminListQuery,
  useMspCustomerListQuery
} from '@acx-ui/msp/services'
import {
  MspAdministrator,
  MspEc,
  MspEcDelegatedAdmins,
  MspIntegratorDelegated,
  MspRecCustomer,
  MspRecData
} from '@acx-ui/msp/utils'
import { roleDisplayText, useTableQuery } from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { RolesEnum }   from '@acx-ui/types'
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
  const [ecSupportEnabled, setEcSupport] = useState(false)
  const [drawerRecVisible, setDrawerRecVisible] = useState(false)
  const [drawerAdminVisible, setDrawerAdminVisible] = useState(false)
  const [drawerIntegratorVisible, setDrawerIntegratorVisible] = useState(false)
  const [drawerInstallerVisible, setDrawerInstallerVisible] = useState(false)
  const [addRecCustomer] = useAddRecCustomerMutation()

  const { Paragraph } = Typography
  const isEditMode = action === 'edit'

  const { data: Administrators } =
      useMspAdminListQuery({ params: useParams() }, { skip: !isEditMode })
  const { data: delegatedAdmins } =
      useGetMspEcDelegatedAdminsQuery({ params: { mspEcTenantId } }, { skip: !isEditMode })
  const { data: ecSupport } =
      useGetMspEcSupportQuery({ params: { mspEcTenantId } }, { skip: !isEditMode })
  const { data: techPartners } = useTableQuery({
    useQuery: useMspCustomerListQuery,
    pagination: {
      pageSize: 10000
    },
    defaultPayload: {
      filters: { tenantType: [AccountType.MSP_INTEGRATOR, AccountType.MSP_INSTALLER] },
      fields: [
        'id',
        'name',
        'tenantType'
      ],
      sortField: 'name',
      sortOrder: 'ASC'
    },
    option: { skip: !isEditMode }
  })

  const [
    enableMspEcSupport
  ] = useEnableMspEcSupportMutation()

  const [
    disableMspEcSupport
  ] = useDisableMspEcSupportMutation()

  const ecSupportOnChange = (checked: boolean) => {
    if (checked) {
      enableMspEcSupport({ params: { mspEcTenantId: mspEcTenantId } })
        .then(() => {
          showToast({
            type: 'success',
            content: intl.$t({ defaultMessage: 'EC support enabled' })
          })
          setEcSupport(true)
        })
    } else {
      disableMspEcSupport({ params: { mspEcTenantId: mspEcTenantId } })
        .then(() => {
          showToast({
            type: 'success',
            content: intl.$t({ defaultMessage: 'EC support disabled' })
          })
          setEcSupport(false)
        })
    }
  }

  useEffect(() => {
    if (delegatedAdmins && Administrators) {
      let selDelegateAdmins: MspAdministrator[] = []
      const admins = delegatedAdmins?.map((admin: MspEcDelegatedAdmins)=> admin.msp_admin_id)
      const selAdmins = Administrators.filter(rec => admins.includes(rec.id))
      selAdmins.forEach((element:MspAdministrator) => {
        const role =
        delegatedAdmins.find(row => row.msp_admin_id=== element.id)?.msp_admin_role ?? element.role
        const rec = { ...element }
        rec.role = role as RolesEnum
        selDelegateAdmins.push(rec)
      })
      setAdministrator(selDelegateAdmins)
    }
    if (isEditMode) {
      setEcSupport((ecSupport && ecSupport?.length > 0) || false)
    }
  }, [delegatedAdmins, Administrators])

  useEffect(() => {
    if (techPartners?.data && mspEcTenantId) {
      const assignedIntegrator = techPartners.data.filter(mspEc =>
        mspEc.assignedMspEcList?.includes(mspEcTenantId)
        && mspEc.tenantType === AccountType.MSP_INTEGRATOR)
      const assignedInstaller = techPartners.data.filter(mspEc =>
        mspEc.assignedMspEcList?.includes(mspEcTenantId)
        && mspEc.tenantType === AccountType.MSP_INSTALLER)
      setIntegrator(assignedIntegrator)
      setInstaller(assignedInstaller)
    }
  }, [techPartners])

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
        label={intl.$t({ defaultMessage: 'Property Name' })}
      >
        <Paragraph>{mspRecCustomer[0].account_name}</Paragraph>
      </Form.Item>
      <Form.Item style={{ marginTop: '-22px' }}
        label={intl.$t({ defaultMessage: 'Address' })}
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
        <label>{intl.$t({ defaultMessage: 'RUCKUS End Customer' })}</label>
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

  const EnableSupportForm = () => {
    return <>
      <div>
        <h4 style={{ display: 'inline-block', marginTop: '38px', marginRight: '25px' }}>
          {intl.$t({ defaultMessage: 'Enable access to Ruckus Support' })}</h4>
        <Switch defaultChecked={ecSupportEnabled} onChange={ecSupportOnChange}/></div>
      <div><label>
        {intl.$t({ defaultMessage: 'If checked, Ruckus Support team is granted a temporary' +
  ' administrator-level access for 21 days.' })}</label>
      </div>
      <label>
        {intl.$t({ defaultMessage: 'Enable when requested by Ruckus Support team.' })}</label>
    </>
  }

  return (
    <>
      <PageHeader
        title={intl.$t({ defaultMessage: 'Add RUCKUS End Customer Account' })}
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'My Customers' }) },
          {
            text: intl.$t({ defaultMessage: 'RUCKUS End Customers' }),
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
          {isEditMode && <EnableSupportForm />}

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
