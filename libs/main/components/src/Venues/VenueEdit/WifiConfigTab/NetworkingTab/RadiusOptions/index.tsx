import { useContext, useEffect } from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { AnchorContext, Loader, StepsForm }     from '@acx-ui/components'
import { Features, useIsSplitOn }               from '@acx-ui/feature-toggle'
import { RadiusOptionsForm }                    from '@acx-ui/rc/components'
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

import { VenueEditContext }               from '../../..'
import {
  useVenueConfigTemplateMutationFnSwitcher,
  useVenueConfigTemplateQueryFnSwitcher
} from '../../../../venueConfigTemplateApiSwitcher'

const { useWatch } = Form

export function RadiusOptions () {
  const { $t } = useIntl()
  const { venueId } = useParams()
  const { isTemplate } = useConfigTemplate()
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API) && !isTemplate

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const form = Form.useFormInstance()
  const getVenueRadiusOptions = useVenueConfigTemplateQueryFnSwitcher<VenueRadiusOptions>(
    useGetVenueRadiusOptionsQuery,
    useGetVenueTemplateRadiusOptionsQuery,
    isUseRbacApi
  )

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
        enableRbac: isUseRbacApi
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
        children={<Switch onChange={handleChanged} />}
      />
    </StepsForm.FieldLabel>
    {overrideEnabled &&
      <RadiusOptionsForm
        context='venue'
        showSingleSessionIdAccounting={true}
        onDataChanged={handleChanged} />
    }
  </Loader>
  )
}
