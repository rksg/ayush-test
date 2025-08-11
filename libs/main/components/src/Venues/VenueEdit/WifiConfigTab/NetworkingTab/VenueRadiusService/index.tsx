/* eslint-disable max-len */
import { useContext, useEffect, useRef, useState } from 'react'

import { Form, Space, Switch } from 'antd'
import { DefaultOptionType }   from 'antd/lib/select'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { Loader, StepsForm, Tooltip } from '@acx-ui/components'
import {
  useActivateVenueRadiusServiceMutation,
  useActivateVenueTemplateRadiusServiceMutation,
  useDeactivateVenueRadiusServiceMutation,
  useDeactivateVenueTemplateRadiusServiceMutation,
  useGetAAAPolicyListQuery,
  useGetAAAPolicyTemplateListQuery
} from '@acx-ui/rc/services'
import { AaaServerTypeEnum, useConfigTemplateQueryFnSwitcher } from '@acx-ui/rc/utils'

import { VenueEditContext }                         from '../../..'
import { useVenueConfigTemplateMutationFnSwitcher } from '../../../../venueConfigTemplateApiSwitcher'

import { VenueRadiusServiceForm } from './VenueRadiusServiceForm'

const { useWatch } = Form

type VenueRadiusServiceProps = {
  isAllowEdit?: boolean
  onDataChanged?: (()=> void)
}

type RadiusRefType = {
  initAuthId: string | undefined,
  initAccountingId: string | undefined
}

export const VenueRadiusService = (props: VenueRadiusServiceProps) => {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { isAllowEdit=true } = props
  const initRadiusRef = useRef<RadiusRefType>({
    initAuthId: undefined,
    initAccountingId: undefined
  })
  const createdAuthRadiusIdRef = useRef<string>()
  const createAccountingRadiusIdRef = useRef<string>()

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(VenueEditContext)

  const [ authRadiusOptions, setAuthRadiusOptions ] = useState<DefaultOptionType[]>([])
  const [ accountingOptions, setAccountingOptions ] = useState<DefaultOptionType[]>([])
  const [ radiusTotalCount, setRadiusTotalCount ] = useState(0)

  const form = Form.useFormInstance()
  const [ overrideAuthEnabled, overrideAccountingEnabled ]= [
    useWatch<boolean>('overrideAuthEnabled'),
    useWatch<boolean>('overrideAccountingEnabled')
  ]

  const { data, isLoading } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetAAAPolicyListQuery,
    useTemplateQueryFn: useGetAAAPolicyTemplateListQuery,
    payload: {
      fields: [ 'id', 'name', 'type', 'radSecOptions', 'venueIds'],
      page: 1, pageSize: 1024
    },
    enableRbac: true
  })

  const [activateVenueRadius, { isLoading: isActivating }] =
    useVenueConfigTemplateMutationFnSwitcher(
      useActivateVenueRadiusServiceMutation,
      useActivateVenueTemplateRadiusServiceMutation
    )
  const [deactivateVenueRadius, { isLoading: isDeactivating }] =
    useVenueConfigTemplateMutationFnSwitcher(
      useDeactivateVenueRadiusServiceMutation,
      useDeactivateVenueTemplateRadiusServiceMutation
    )

  useEffect(() => {
    if (isLoading === false && data && venueId) {
      const excludeRecSec = data.data?.filter(radius => radius.radSecOptions?.tlsEnabled !== true)
      const authServices = excludeRecSec.filter(radius => radius.type === 'AUTHENTICATION')
      const initAuthServiceId = authServices.find(radius => radius.venueIds?.includes(venueId))?.id
      const authOptions = authServices?.map(radius => ({ label: radius.name, value: radius.id })) ?? []

      const accountingServices = excludeRecSec.filter(radius => radius.type === 'ACCOUNTING')
      const initAccountingServiceId = accountingServices.find(radius => radius.venueIds?.includes(venueId))?.id
      const accountingOptions = accountingServices?.map(radius => ({ label: radius.name, value: radius.id! })) ?? []

      initRadiusRef.current = {
        initAuthId: initAuthServiceId,
        initAccountingId: initAccountingServiceId
      }

      setAuthRadiusOptions(authOptions)
      setAccountingOptions(accountingOptions)
      setRadiusTotalCount(data.totalCount ?? 0)

      const createdAuthId = createdAuthRadiusIdRef.current
      const hasIncludedAuthOptions = createdAuthId && authOptions.find((option) => option.value === createdAuthId)
      const curAuthRadiusId = hasIncludedAuthOptions? createdAuthId : initAuthServiceId

      const createdAccountingId = createAccountingRadiusIdRef.current
      const hasIncludedAccountingOptions = createdAccountingId && accountingOptions.find((option) => option.value === createdAccountingId)
      const curAccountingRadiusId = hasIncludedAccountingOptions? createdAccountingId : initAccountingServiceId

      form.setFieldValue('overrideAuthEnabled', !!curAuthRadiusId)
      form.setFieldValue('overrideAccountingEnabled', !!curAccountingRadiusId)
      form.setFieldValue('authServiceId', curAuthRadiusId)
      form.setFieldValue('accountingServiceId', curAccountingRadiusId)

    }
  }, [form, data, isLoading, venueId])

  const handleUpdateRadiusService = async () => {
    const curAuthId = form.getFieldValue('authServiceId')
    const curAccountingId = form.getFieldValue('accountingServiceId')

    const { initAuthId, initAccountingId } = initRadiusRef.current

    if (initAuthId !== curAuthId) {
      if (curAuthId) {
        await activateVenueRadius({ params: { venueId, radiusId: curAuthId } }).unwrap()
      } else {
        await deactivateVenueRadius({ params: { venueId, radiusId: initAuthId } }).unwrap()
      }
    }

    if (initAccountingId !== curAccountingId) {
      if (curAccountingId) {
        await activateVenueRadius({ params: { venueId, radiusId: curAccountingId } }).unwrap()
      } else {
        await deactivateVenueRadius({ params: { venueId, radiusId: initAccountingId } }).unwrap()
      }
    }

    if (createdAuthRadiusIdRef.current) {
      createdAuthRadiusIdRef.current = undefined
    }
    if (createAccountingRadiusIdRef.current) {
      createAccountingRadiusIdRef.current = undefined
    }
  }

  const handleChanged = () => {
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'networking',
      tabTitle: $t({ defaultMessage: 'Networking' }),
      isDirty: true
    })

    setEditNetworkingContextData && setEditNetworkingContextData({
      ...editNetworkingContextData,
      updateRadiusService: handleUpdateRadiusService
    })

  }

  const handleOverrideEnableChanged = (enable: boolean, type: AaaServerTypeEnum) => {
    if (!enable) {
      let fieldName: string
      if (type === AaaServerTypeEnum.AUTHENTICATION) {
        createdAuthRadiusIdRef.current = undefined
        fieldName = 'authServiceId'
      } else { // type === AaaServerTypeEnum.ACCOUNTING
        createAccountingRadiusIdRef.current = undefined
        fieldName = 'accountingServiceId'
      }

      form.setFieldValue(fieldName, undefined)
      handleChanged()
    }
  }

  const handleRadiusIdChanged = (type: AaaServerTypeEnum) => {
    if (type === AaaServerTypeEnum.AUTHENTICATION) {
      createdAuthRadiusIdRef.current = undefined
    } else { // type === AaaServerTypeEnum.ACCOUNTING
      createAccountingRadiusIdRef.current = undefined
    }
    handleChanged()
  }

  const handleRadiusCreated = (id: string, type: AaaServerTypeEnum) => {
    if (type === AaaServerTypeEnum.AUTHENTICATION) {
      createdAuthRadiusIdRef.current = id
    } else {
      createAccountingRadiusIdRef.current = id
    }
    handleChanged()
  }

  // eslint-disable-next-line max-len
  const authTooltipTitle =$t({ defaultMessage: 'Only non-proxy authentication servers from active networks will be overridden' })
  // eslint-disable-next-line max-len
  const acctTooltipTitle = $t({ defaultMessage: 'Only non-proxy accounting servers from active networks will be overridden' })

  return (<Loader states={[{
    isLoading: isLoading,
    isFetching: isActivating || isDeactivating
  }]}>
    <StepsForm.FieldLabel width={'330px'}>
      <Space>
        {$t({ defaultMessage: 'Override Authentication service in active networks' })}
        <Tooltip.Question title={authTooltipTitle}
          iconStyle={{ height: '16px', width: '16px', marginBottom: '-4px' }} />
      </Space>
      <Form.Item
        name='overrideAuthEnabled'
        valuePropName={'checked'}
        initialValue={false}
        children={<Switch disabled={!isAllowEdit}
          onChange={(enable)=> handleOverrideEnableChanged(enable, AaaServerTypeEnum.AUTHENTICATION)} />}
      />
    </StepsForm.FieldLabel>
    {overrideAuthEnabled &&
      <VenueRadiusServiceForm
        label={$t({ defaultMessage: 'Authentication Service' })}
        fieldName='authServiceId'
        type='AUTHENTICATION'
        options={authRadiusOptions}
        radiusTotalCount={radiusTotalCount}
        onRadiusChanged={() => handleRadiusIdChanged(AaaServerTypeEnum.AUTHENTICATION)}
        onRadiusCreated={(id) => handleRadiusCreated(id, AaaServerTypeEnum.AUTHENTICATION)}
      />}
    <StepsForm.FieldLabel width={'330px'}>
      <Space>
        {$t({ defaultMessage: 'Override Accounting service in active networks' })}
        <Tooltip.Question title={acctTooltipTitle}
          iconStyle={{ height: '16px', width: '16px', marginBottom: '-4px' }} />
      </Space>
      <Form.Item
        name='overrideAccountingEnabled'
        valuePropName={'checked'}
        initialValue={false}
        children={<Switch disabled={!isAllowEdit}
          onChange={(enable)=> handleOverrideEnableChanged(enable, AaaServerTypeEnum.ACCOUNTING)} />}
      />
    </StepsForm.FieldLabel>
    {overrideAccountingEnabled &&
      <VenueRadiusServiceForm
        label={$t({ defaultMessage: 'Accounting Service' })}
        fieldName='accountingServiceId'
        type='ACCOUNTING'
        options={accountingOptions}
        radiusTotalCount={radiusTotalCount}
        onRadiusChanged={() => handleRadiusIdChanged(AaaServerTypeEnum.ACCOUNTING)}
        onRadiusCreated={(id) => handleRadiusCreated(id, AaaServerTypeEnum.ACCOUNTING)}
      />}
  </Loader>)

}