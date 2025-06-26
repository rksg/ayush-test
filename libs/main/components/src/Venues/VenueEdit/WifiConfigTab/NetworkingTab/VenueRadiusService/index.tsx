/* eslint-disable max-len */
import { useContext, useEffect, useRef, useState } from 'react'

import { Form, Space, Switch } from 'antd'
import { DefaultOptionType }   from 'antd/lib/select'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { AnchorContext, Loader, StepsForm, Tooltip } from '@acx-ui/components'
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

type RadiusServiceRefType = {
  initAuthId: string | undefined,
  initAccountingId: string | undefined
}

export const VenueRadiusService = (props: VenueRadiusServiceProps) => {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { isAllowEdit=true } = props
  const initRadiusServiceRef = useRef<RadiusServiceRefType>({
    initAuthId: undefined,
    initAccountingId: undefined
  })

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const [ authRadiusOptions, setAuthRadiusOptions ] = useState<DefaultOptionType[]>([])
  const [ accountingOptions, setAccountingOptions ] = useState<DefaultOptionType[]>([])

  const form = Form.useFormInstance()
  const [ overrideAuthEnabled, overrideAccountingEnabled ]= [
    useWatch<boolean>('overrideAuthEnabled'),
    useWatch<boolean>('overrideAccountingEnabled')
  ]

  const getRadiusServerProfiles = useConfigTemplateQueryFnSwitcher({
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
    const { data, isLoading } = getRadiusServerProfiles
    if (isLoading === false && data && venueId) {
      const excludeRecSec = data?.data.filter(radius => radius.radSecOptions?.tlsEnabled !== true)

      const authServices = excludeRecSec.filter(radius => radius.type === 'AUTHENTICATION')
      const initAuthServiceId = authServices.find(radius => radius.venueIds?.includes(venueId))?.id
      const authOptions = authServices?.map(radius => ({ label: radius.name, value: radius.id })) ?? []

      const accountingServices = excludeRecSec.filter(radius => radius.type === 'ACCOUNTING')
      const initAccountServiceId = accountingServices.find(radius => radius.venueIds?.includes(venueId))?.id
      const accountingOptions = accountingServices?.map(radius => ({ label: radius.name, value: radius.id! })) ?? []

      initRadiusServiceRef.current = {
        initAuthId: initAuthServiceId,
        initAccountingId: initAccountServiceId
      }

      setAuthRadiusOptions(authOptions)
      setAccountingOptions(accountingOptions)

      form.setFieldValue('overrideAuthEnabled', !!initAuthServiceId)
      form.setFieldValue('overrideAccountingEnabled', !!initAccountServiceId)
      form.setFieldValue('authServiceId', initAuthServiceId)
      form.setFieldValue('accountingServiceId', initAccountServiceId)

      setReadyToScroll?.(r => [...(new Set(r.concat('RADIUS-Options')))])
    }

  }, [form, getRadiusServerProfiles, setReadyToScroll, venueId])

  const handleUpdateRadiusService = async () => {
    const curAuthId = form.getFieldValue('authServiceId')
    const curAccountingId = form.getFieldValue('accountingServiceId')

    const { initAuthId, initAccountingId } = initRadiusServiceRef.current

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
      const fieldName = (type === AaaServerTypeEnum.AUTHENTICATION)? 'authServiceId' : 'accountingServiceId'
      form.setFieldValue(fieldName, undefined)
      handleChanged()
    }
  }

  const handleRadiusIdChanged = () => {
    handleChanged()
  }

  const authTooltipTitle = $t({ defaultMessage: '....' })
  const accTooltipTitle = $t({ defaultMessage: '....' })

  return (<Loader states={[{
    isLoading: getRadiusServerProfiles.isLoading,
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
        fieldName={'authServiceId'}
        options={authRadiusOptions}
        onRadiusChanged={handleRadiusIdChanged}
      />}
    <StepsForm.FieldLabel width={'330px'}>
      <Space>
        {$t({ defaultMessage: 'Override Accounting service in active networks' })}
        <Tooltip.Question title={accTooltipTitle}
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
        fieldName={'accountingServiceId'}
        options={accountingOptions}
        onRadiusChanged={handleRadiusIdChanged}
      />}
  </Loader>)

}