import { useContext, useEffect } from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'

import { AnchorContext, Loader, StepsForm } from '@acx-ui/components'
import { VenueRadiusOptions }               from '@acx-ui/rc/utils'
import { useParams }                        from '@acx-ui/react-router-dom'

import { RadiusOptionsForm }  from '../../RadiusOptionsForm'
import { ApGroupEditContext } from '../context'

const { useWatch } = Form

export function RadiusOptions () {
  const { $t } = useIntl()
  const params = useParams()

  const overrideEnabled = useWatch<boolean>('overrideEnabled')
  const form = Form.useFormInstance()
  const { setReadyToScroll } = useContext(AnchorContext)

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(ApGroupEditContext)

  useEffect(() => {
    if (true) {
      // form.setFieldsValue(data)

      setReadyToScroll?.(r => [...(new Set(r.concat('RADIUS-Options')))])
    }

  }, [form, setReadyToScroll])

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

      // await updateVenueRadiusOptions({
      //   params: { venueId },
      //   payload: payload,
      //   enableRbac: resolvedRbacEnabled
      // }).unwrap()

      console.log(payload)

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
    isLoading: false,
    isFetching: false
  }]}>
    <StepsForm.FieldLabel width={'280px'}>
      {$t({ defaultMessage: 'Override the settings in active networks' })}
      <Form.Item
        name='overrideEnabled'
        valuePropName={'checked'}
        initialValue={false}
        children={<Switch disabled={!true} onChange={handleChanged} />}
      />
    </StepsForm.FieldLabel>
    {overrideEnabled &&
        <RadiusOptionsForm
          context='venue'
          disabled={!true}
          showSingleSessionIdAccounting={true}
          onDataChanged={handleChanged} />
    }
  </Loader>
  )
}
