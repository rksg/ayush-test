import { useContext, useEffect } from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { Loader, StepsForm }                                                  from '@acx-ui/components'
import { RadiusOptionsForm }                                                  from '@acx-ui/rc/components'
import { useGetVenueRadiusOptionsQuery, useUpdateVenueRadiusOptionsMutation } from '@acx-ui/rc/services'
import { VenueRadiusOptions }                                                 from '@acx-ui/rc/utils'

import { VenueEditContext } from '../../..'

const { useWatch } = Form

export function RadiusOptions () {
  const { $t } = useIntl()
  const { venueId } = useParams()

  const {
    editContextData,
    setEditContextData,
    editAdvanceSettingContext,
    setEditAdvanceSettingContext
  } = useContext(VenueEditContext)

  const form = Form.useFormInstance()
  const getVenueRadiusOptions = useGetVenueRadiusOptionsQuery({ params: { venueId } })
  const [updateVenueRadiusOptions, { isLoading: isUpdatingVenueRadiusOptions }] =
  useUpdateVenueRadiusOptionsMutation()

  const overrideEnabled = useWatch<boolean>('overrideEnabled')

  useEffect(() => {
    const { data, isLoading } = getVenueRadiusOptions
    if (isLoading === false && data) {
      form.setFieldsValue(data)
    }

  }, [ getVenueRadiusOptions ])


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
        payload: payload
      }).unwrap()

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleChanged = () => {
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'settings',
      tabTitle: $t({ defaultMessage: 'Advanced Settings' }),
      isDirty: true
    })

    editAdvanceSettingContext && setEditAdvanceSettingContext({
      ...editAdvanceSettingContext,
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
