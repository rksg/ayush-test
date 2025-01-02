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
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  ManageAdminsDrawer,
  ManageDelegateAdminDrawer,
  ManageMspDelegationDrawer,
  SelectIntegratorDrawer
} from '@acx-ui/msp/components'
import {
  useAddBrandCustomersMutation,
  useAddRecCustomerMutation,
  useDisableMspEcSupportMutation,
  useEnableMspEcSupportMutation,
  useGetMspEcDelegatedAdminsQuery,
  useGetMspEcQuery,
  useGetMspEcSupportQuery,
  useMspAdminListQuery,
  useMspCustomerListQuery
} from '@acx-ui/msp/services'
import {
  MSPUtils,
  MspAdministrator,
  MspEc,
  MspEcDelegatedAdmins,
  MspIntegratorDelegated,
  MspMultiRecData,
  MspRecCustomer,
  MspRecData
} from '@acx-ui/msp/utils'
import { useGetPrivilegeGroupsQuery }                     from '@acx-ui/rc/services'
import { PrivilegeGroup, roleDisplayText, useTableQuery } from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { RolesEnum }                  from '@acx-ui/types'
import { useUserProfileContext }      from '@acx-ui/user'
import { AccountType, noDataDisplay } from '@acx-ui/utils'

import { SelectRecCustomerDrawer } from './SelectRecCustomer'
import * as UI                     from './styledComponents'

export function AddRecCustomer () {
  const intl = useIntl()
  const mspUtils = MSPUtils()
  const navigate = useNavigate()
  const linkToRecCustomers = useTenantLink('/dashboard/mspreccustomers', 'v')
  //   const { action, status, tenantId, mspEcTenantId } = useParams()
  const { action, tenantId, mspEcTenantId } = useParams()

  const [mspRecCustomer, setRecCustomer] = useState([] as MspRecCustomer[])
  const [mspAdmins, setAdministrator] = useState([] as MspAdministrator[])
  const [privilegeGroups, setPrivilegeGroups] = useState([] as PrivilegeGroup[])
  const [mspIntegrator, setIntegrator] = useState([] as MspEc[])
  const [mspInstaller, setInstaller] = useState([] as MspEc[])
  const [ecSupportEnabled, setEcSupport] = useState(false)
  const [drawerRecVisible, setDrawerRecVisible] = useState(false)
  const [drawerAdminVisible, setDrawerAdminVisible] = useState(false)
  const [drawerIntegratorVisible, setDrawerIntegratorVisible] = useState(false)
  const [drawerInstallerVisible, setDrawerInstallerVisible] = useState(false)
  const [addRecCustomer] = useAddRecCustomerMutation()
  const [addBrandCustomers] = useAddBrandCustomersMutation()

  const { Paragraph } = Typography
  const isEditMode = action === 'edit'
  const multiPropertySelectionEnabled = useIsSplitOn(Features.MSP_MULTI_PROPERTY_CREATION_TOGGLE)
  const isRbacEarlyAccessEnable = useIsTierAllowed(TierFeatures.RBAC_IMPLICIT_P1)
  const isAbacToggleEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE) && isRbacEarlyAccessEnable
  const isRbacEnabled = useIsSplitOn(Features.MSP_RBAC_API)
  const isRbacPhase2Enabled = useIsSplitOn(Features.RBAC_PHASE2_TOGGLE)

  const { data: userProfileData } = useUserProfileContext()
  const { data: recCustomer } =
      useGetMspEcQuery({ params: { mspEcTenantId }, enableRbac: isRbacEnabled },
        { skip: !isEditMode })

  const { data: Administrators } =
      useMspAdminListQuery({ params: useParams() }, { skip: !isEditMode })
  const { data: delegatedAdmins } =
      useGetMspEcDelegatedAdminsQuery({ params: { mspEcTenantId }, enableRbac: isRbacEnabled },
        { skip: !isEditMode })
  const { data: ecSupport } =
      useGetMspEcSupportQuery({
        params: { mspEcTenantId }, enableRbac: isRbacEnabled }, { skip: !isEditMode })
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
  const adminRoles = [RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]
  const isSystemAdmin = userProfileData?.roles?.some(role => adminRoles.includes(role as RolesEnum))
  const { data: privilegeGroupList } = useGetPrivilegeGroupsQuery({ params: useParams() },
    { skip: !isRbacPhase2Enabled || isEditMode || isSystemAdmin })

  const [
    enableMspEcSupport
  ] = useEnableMspEcSupportMutation()

  const [
    disableMspEcSupport
  ] = useDisableMspEcSupportMutation()

  const ecSupportOnChange = (checked: boolean) => {
    if (checked) {
      enableMspEcSupport({ params: { mspEcTenantId: mspEcTenantId }, enableRbac: isRbacEnabled })
        .then(() => {
          showToast({
            type: 'success',
            content: intl.$t({ defaultMessage: 'EC support enabled' })
          })
          setEcSupport(true)
        })
    } else {
      disableMspEcSupport({ params: { mspEcTenantId: mspEcTenantId }, enableRbac: isRbacEnabled })
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
    } else {
      if (userProfileData) {
        if (isSystemAdmin) {
          const administrator = [] as MspAdministrator[]
          administrator.push ({
            id: userProfileData.adminId,
            lastName: userProfileData.lastName,
            name: userProfileData.firstName,
            email: userProfileData.email,
            role: userProfileData.role as RolesEnum,
            detailLevel: userProfileData.detailLevel
          })
          setAdministrator(administrator)
        } else {
          const pg = privilegeGroupList?.find(pg => pg.name === userProfileData.role)
          if (pg) {
            const pgList = [] as PrivilegeGroup[]
            pgList.push({ id: pg.id, name: userProfileData.role as RolesEnum })
            setPrivilegeGroups(pgList)
          }
        }
      }
    }
  }, [delegatedAdmins, Administrators, privilegeGroupList])

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
        mspIntegrator.forEach((integrator: MspEc) => {
          ecDelegations.push({
            delegation_type: AccountType.MSP_INTEGRATOR,
            delegation_id: integrator.id
          })
        })
      }
      if (mspInstaller.length > 0) {
        mspInstaller.forEach((installer: MspEc) => {
          ecDelegations.push({
            delegation_type: AccountType.MSP_INSTALLER,
            delegation_id: installer.id
          })
        })
      }
      const recCustomers=[] as MspRecData[]
      if (mspRecCustomer.length > 0) {
        const pgIds = privilegeGroups?.map((pg: PrivilegeGroup)=> pg.id)
        mspRecCustomer.forEach((cus: MspRecCustomer) => {
          recCustomers.push({
            account_id: cus.account_id,
            name: cus.account_name,
            admin_delegations: delegations,
            delegations: ecDelegations.length > 0 ? ecDelegations : undefined,
            privilege_group_ids: isRbacPhase2Enabled ? pgIds : undefined
          })
        })
      }

      const customerMulti: MspMultiRecData = { data: recCustomers }
      const customerRec: MspRecData =
      {
        account_id: mspRecCustomer[0].account_id,
        admin_delegations: delegations,
        delegations: ecDelegations.length > 0 ? ecDelegations : undefined
      }

      const customer = multiPropertySelectionEnabled ? customerMulti : customerRec

      const result = multiPropertySelectionEnabled
        ? await addBrandCustomers({ params: { tenantId: tenantId }, payload: customer }).unwrap()
        : await addRecCustomer({ params: { tenantId: tenantId }, payload: customer }).unwrap()
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
      return noDataDisplay
    return mspRecCustomer.map(customer =>
      <div key={customer.account_id}>
        <Form.Item
          label={intl.$t({ defaultMessage: 'Property Name' })}
        >
          <Paragraph>{customer.account_name}</Paragraph>
        </Form.Item>
        <Form.Item style={{ marginTop: '-22px' }}
          label={intl.$t({ defaultMessage: 'Address' })}
        >
          <Paragraph>{mspUtils.transformMspRecAddress(customer)}</Paragraph>
        </Form.Item>
      </div>
    )
  }

  const displayEditRecCustomer = () => {
    return recCustomer?.name ? recCustomer.name : noDataDisplay
  }

  const displayMspAdmins = () => {
    if (!mspAdmins || mspAdmins.length === 0)
      return noDataDisplay
    return <>
      {mspAdmins.map(admin =>
        <UI.AdminList key={admin.id}>
          {admin.email} ({roleDisplayText[admin.role]
            ? intl.$t(roleDisplayText[admin.role]) : admin.role})
        </UI.AdminList>
      )}
    </>
  }

  const displayPrivilegeGroups = () => {
    if (!privilegeGroups || privilegeGroups.length === 0)
      return noDataDisplay
    return <>
      {privilegeGroups.map(pg =>
        <UI.AdminList key={pg.id}>
          {pg.name}
        </UI.AdminList>
      )}
    </>
  }

  const displayIntegrator = () => {
    if (!mspIntegrator || mspIntegrator.length === 0)
      return noDataDisplay
    return <>
      {mspIntegrator.map(integrator =>
        <UI.AdminList key={integrator.id}>
          {integrator.name}
        </UI.AdminList>
      )}
    </>

  }

  const displayInstaller = () => {
    if (!mspInstaller || mspInstaller.length === 0)
      return noDataDisplay
    return <>
      {mspInstaller.map(installer =>
        <UI.AdminList key={installer.id}>
          {installer.name}
        </UI.AdminList>
      )}
    </>

  }

  const MspAdminsForm = () => {
    return <>
      <UI.FieldLabelAdmins width='275px' style={{ marginTop: '15px' }}>
        <label>{
          intl.$t({ defaultMessage: 'Brand Property' })
        }</label>
        <Form.Item style={{ maxHeight: '300px', overflow: 'auto' }}
          children={<div>{isEditMode ? displayEditRecCustomer() : displayRecCustomer()}</div>} />
        {!isEditMode && <Form.Item
          children={<UI.FieldTextLink onClick={() => setDrawerRecVisible(true)}>
            {intl.$t({ defaultMessage: 'Manage' })}
          </UI.FieldTextLink>
          }
        />}
      </UI.FieldLabelAdmins>
      {(isAbacToggleEnabled && isRbacPhase2Enabled && !isEditMode)
        ? <div>
          <UI.FieldLabelAdmins2 width='275px' style={{ marginTop: '-12px' }}>
            <label>{intl.$t({ defaultMessage: 'MSP Delegations' })}</label>
            <Form.Item
              children={<UI.FieldTextLink onClick={() => setDrawerAdminVisible(true)}>
                {intl.$t({ defaultMessage: 'Manage' })}
              </UI.FieldTextLink>
              }
            />
          </UI.FieldLabelAdmins2>
          <UI.FieldLabelDelegations width='260px'
            style={{ marginLeft: '15px', marginTop: '5px', marginBottom: '15px' }}>
            <label>{intl.$t({ defaultMessage: 'Users' })}</label>
            <Form.Item children={<div>{displayMspAdmins()}</div>} />
            <label>{intl.$t({ defaultMessage: 'Privilege Groups' })}</label>
            <Form.Item children={<div>{displayPrivilegeGroups()}</div>} />
          </UI.FieldLabelDelegations>
        </div>
        : <UI.FieldLabelAdmins width='275px' style={{ marginTop: '15px' }}>
          <label>{intl.$t({ defaultMessage: 'MSP Administrators' })}</label>
          <Form.Item children={<div>{displayMspAdmins()}</div>} />
          {!isEditMode && <Form.Item
            children={<UI.FieldTextLink onClick={() => setDrawerAdminVisible(true)}>
              {intl.$t({ defaultMessage: 'Manage' })}
            </UI.FieldTextLink>
            }
          />}
        </UI.FieldLabelAdmins>}
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
        title={!isEditMode ?
          intl.$t({ defaultMessage: 'Add Brand Property Account' }) :
          intl.$t({ defaultMessage: 'Brand Property Account' })
        }
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'My Customers' }) },
          {
            text: intl.$t({ defaultMessage: 'Brand Properties' }),
            link: '/dashboard/mspRecCustomers', tenantType: 'v'
          }
        ]}
      />
      {isEditMode ? <Form>
        <Subtitle level={3}>
          { intl.$t({ defaultMessage: 'Account Details' }) }</Subtitle>
        <MspAdminsForm />
        <EnableSupportForm />
      </Form>
        : <StepsForm
          onFinish={handleAddCustomer}
          onCancel={() => navigate(linkToRecCustomers)}
          buttonLabel={{ submit: intl.$t({ defaultMessage: 'Add' }) }}
        >
          <StepsForm.StepForm
            name='accountDetail'
            title={intl.$t({ defaultMessage: 'Account Details' })}
          >
            <Subtitle level={3}>
              { intl.$t({ defaultMessage: 'Account Details' }) }</Subtitle>

            <MspAdminsForm></MspAdminsForm>

          </StepsForm.StepForm>
        </StepsForm>}

      {drawerRecVisible && <SelectRecCustomerDrawer
        visible={drawerRecVisible}
        setVisible={setDrawerRecVisible}
        setSelected={selectedRecCustomer}
        multiSelectionEnabled={multiPropertySelectionEnabled}
        tenantId={mspEcTenantId}
      />}
      {drawerAdminVisible && (isAbacToggleEnabled
        ? (isRbacPhase2Enabled
          ? <ManageMspDelegationDrawer
            visible={drawerAdminVisible}
            setVisible={setDrawerAdminVisible}
            setSelectedUsers={selectedMspAdmins}
            selectedUsers={mspAdmins}
            setSelectedPrivilegeGroups={setPrivilegeGroups}
            selectedPrivilegeGroups={privilegeGroups}
            tenantIds={mspEcTenantId ? [mspEcTenantId] : undefined}/>
          : <ManageDelegateAdminDrawer
            visible={drawerAdminVisible}
            setVisible={setDrawerAdminVisible}
            setSelected={selectedMspAdmins}
            tenantId={mspEcTenantId}/>)
        : <ManageAdminsDrawer
          visible={drawerAdminVisible}
          setVisible={setDrawerAdminVisible}
          setSelected={selectedMspAdmins}
          tenantId={mspEcTenantId}/>
      )}
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
