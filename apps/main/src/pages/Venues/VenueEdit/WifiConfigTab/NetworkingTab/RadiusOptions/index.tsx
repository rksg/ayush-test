import { useContext, useEffect } from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'
import { useParams }    from 'react-router-dom'

import { Loader, StepsForm }                                                  from '@acx-ui/components'
import { RadiusOptionsForm }                                                  from '@acx-ui/rc/components'
import { useGetVenueRadiusOptionsQuery, useUpdateVenueRadiusOptionsMutation } from '@acx-ui/rc/services'

import { VenueEditContext } from '../../..'

const { useWatch } = Form

/*
const defaultRadiusOptionsData = {
  radiusOptions: {
    overrideEnabled: false,
    nasIdType: 'BSSID',
    nasRequestTimeoutSec: 3,
    nasMaxRetry: 2,
    nasReconnectPrimaryMin: 5,
    calledStationIdType: 'BSSID',
    nasIdDelimiter: 'DASH',
    userDefinedNasId: '',
    singleSessionIdAccounting: false
  }
}*/

export function RadiusOptions () {
  const { $t } = useIntl()
  const { venueId } = useParams()

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(VenueEditContext)

  const form = Form.useFormInstance()
  const getVenueRadiusOptions = useGetVenueRadiusOptionsQuery({ params: { venueId } })
  const [updateVenueRadiusOptions, { isLoading: isUpdatingVenueRadiusOptions }] =
  useUpdateVenueRadiusOptionsMutation()

  const overrideEnabled = useWatch<boolean>(['radiusOptions', 'overrideEnabled'])

  useEffect(() => {
    const { data, isLoading } = getVenueRadiusOptions
    if (isLoading === false && data) {
      form.setFieldsValue(data)
    }

  }, [ getVenueRadiusOptions ])


  const handleUpdateRadiusOptions = async () => {
    try {
      const { radiusOptions } = form.getFieldsValue()

      await updateVenueRadiusOptions({
        params: { venueId },
        payload: {
          radiusOptions
        }
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
        name={['radiusOptions', 'overrideEnabled']}
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
