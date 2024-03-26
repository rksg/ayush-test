import { Params } from 'react-router-dom'

import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { AccountType }                              from '@acx-ui/utils'

import { useIntegratorCustomerListQuery } from './index'

export function useHospitalityVerticalCheck (parentMspId: string,
  tenantType: string,
  params: Readonly<Params<string>>) {

  const integratorPayload = {
    searchString: '',
    filters: {
      mspTenantId: [parentMspId],
      tenantType: [AccountType.MSP_REC]
    },
    fields: [
      'check-all',
      'id',
      'name',
      'tenantType',
      'status',
      'alarmCount',
      'mspAdminCount',
      'mspEcAdminCount',
      'mspInstallerAdminCount',
      'mspIntegratorAdminCount',
      'creationDate',
      'expirationDate',
      'wifiLicense',
      'switchLicense',
      'streetAddress'
    ],
    searchTargetFields: [
      'name'
    ],
    page: 1,
    pageSize: 10,
    defaultPageSize: 10,
    total: 0,
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const isTechPartner =
  tenantType === AccountType.MSP_INTEGRATOR || tenantType === AccountType.MSP_INSTALLER

  const isHspPlmFeatureOn = useIsTierAllowed(Features.MSP_HSP_PLM_FF)
  const isHspSupportEnabled = useIsSplitOn(Features.MSP_HSP_SUPPORT) && isHspPlmFeatureOn

  const { data: integratorListData } = useIntegratorCustomerListQuery({
    params, payload: integratorPayload }, { skip: !isTechPartner })

  // for now acx_account_vetical is not available in jwt of LSP tenant so for temp fix
  // we are having these checks for moe details check ACX-52099
  if (isTechPartner) {
    // if account is not tech partner (integrator / installer) / LSP
    // then will have FF check else we will call useIntegratorCustomerListQuery
    // and will check if data is available and based on that will show and hide
    // Brand 360 and RUCKUS END Customer menue options
    return !!integratorListData?.data?.length
  } else {
    return isHspSupportEnabled
  }
}