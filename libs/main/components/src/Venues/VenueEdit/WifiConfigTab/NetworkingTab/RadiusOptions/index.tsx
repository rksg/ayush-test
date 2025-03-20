import { useContext, useEffect } from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { AnchorContext, Loader, StepsForm }      from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { RadiusOptionsForm }                     from '@acx-ui/rc/components'
import {
  useGetVenueRadiusOptionsQuery,
  useUpdateVenueRadiusOptionsMutation,
  useGetVenueTemplateRadiusOptionsQuery,
  useUpdateVenueTemplateRadiusOptionsMutation
} from '@acx-ui/rc/services'
import {
  VenueRadiusOptions,
  useConfigTemplate
} from '@acx-ui/rc/utils'

import { VenueEditContext, VenueWifiConfigItemProps } from '../../..'
import {
  useVenueConfigTemplateMutationFnSwitcher,
  useVenueConfigTemplateQueryFnSwitcher
} from '../../../../venueConfigTemplateApiSwitcher'

const { useWatch } = Form

export function RadiusOptions (props: VenueWifiConfigItemProps) {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { isTemplate } = useConfigTemplate()
  const { isAllowEdit=true } = props
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isUseRbacApi

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const form = Form.useFormInstance()
  const getVenueRadiusOptions = useVenueConfigTemplateQueryFnSwitcher<VenueRadiusOptions>({
    useQueryFn: useGetVenueRadiusOptionsQuery,
    useTemplateQueryFn: useGetVenueTemplateRadiusOptionsQuery,
    enableRbac: isUseRbacApi
  })

  const [updateVenueRadiusOptions, { isLoading: isUpdatingVenueRadiusOptions }] =
    useVenueConfigTemplateMutationFnSwitcher(
      useUpdateVenueRadiusOptionsMutation,
      useUpdateVenueTemplateRadiusOptionsMutation
    )

  const overrideEnabled = useWatch<boolean>('overrideEnabled')

  useEffect(() => {
    const { data, isLoading } = getVenueRadiusOptions
    if (isLoading === false && data) {
      form.setFieldsValue(data)

      setReadyToScroll?.(r => [...(new Set(r.concat('RADIUS-Options')))])
    }

  }, [form, getVenueRadiusOptions, setReadyToScroll])


  const handleUpdateRadiusOptions = async () => {
    try {
      const formData = form.getFieldsValue()
      let payload: VenueRadiusOptions = {
        overrideEnabled: formData.overrideEnabled,
        nasIdType: formData.nasIdType,
        nasRequestTimeoutSec: formData.nasRequestTimeoutSec,
        nasMaxRetry: formData.nasMaxRetry,
        nasReconnectPrimaryMin: formData.nasReconnectPrimaryMin,
        calledStationIdType: formData.calledStationIdType,
        singleSessionIdAccounting: formData.singleSessionIdAccounting
      }

      if (formData.nasIdDelimiter) {
        payload.nasIdDelimiter = formData.nasIdDelimiter
      }

      if (formData.userDefinedNasId) {
        payload.userDefinedNasId = formData.userDefinedNasId
      }

      await updateVenueRadiusOptions({
        params: { venueId },
        payload: payload,
        enableRbac: resolvedRbacEnabled
      }).unwrap()

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
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
      updateRadiusOptions: handleUpdateRadiusOptions
    })
  }

  return (<Loader states={[{
    isLoading: getVenueRadiusOptions.isLoading,
    isFetching: isUpdatingVenueRadiusOptions
  }]}>
    <StepsForm.FieldLabel width={'280px'}>
      {$t({ defaultMessage: 'Override the settings in active networks' })}
      <Form.Item
        name='overrideEnabled'
        valuePropName={'checked'}
        initialValue={false}
        children={<Switch disabled={!isAllowEdit} onChange={handleChanged} />}
      />
    </StepsForm.FieldLabel>
    {overrideEnabled &&
      <RadiusOptionsForm
        context='venue'
        disabled={!isAllowEdit}
        showSingleSessionIdAccounting={true}
        onDataChanged={handleChanged} />
    }
  </Loader>
  )
}
