import _           from 'lodash'
import { useIntl } from 'react-intl'

import { showActionModal }                                      from '@acx-ui/components'
import { useGetPreferencesQuery, useUpdatePreferenceMutation }  from '@acx-ui/rc/services'
import { COUNTRY_CODE, TenantPreferenceSettings, CommonResult } from '@acx-ui/rc/utils'
import { useParams }                                            from '@acx-ui/react-router-dom'

export const getMapRegion = (data: TenantPreferenceSettings | undefined): string => {
  return data?.global.mapRegion as string
}

export const countryCodes = COUNTRY_CODE.map(item=> ({
  label: item.name,
  value: item.code
}))

export interface updatePreferenceProps {
  newData: TenantPreferenceSettings;
  onSuccess?: (res:CommonResult) => void;
  onError?: (err:unknown) => void;
}

export const usePreference = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { data, ...getReqState } = useGetPreferencesQuery({ params })
  const [ updatePreference, updateReqState] = useUpdatePreferenceMutation()
  const currentMapRegion = getMapRegion(data)
  const currentPreferredLang = data?.global.preferredLanguage as string

  const update = async (props: updatePreferenceProps) => {
    const { newData, onSuccess, onError } = props

    const payload = _.merge({}, data, newData)

    try {
      const res = await updatePreference({ params, payload }).unwrap()
      if (onSuccess)
        onSuccess(res)

      // FIXME: need to confirm refresh behavior with UX
      // limitation due to known issue on GoogleMap js-api-loader:
      //   https://github.com/googlemaps/js-api-loader/issues/210
      if (newData.global?.mapRegion) {
        showActionModal({
          type: 'confirm',
          title: $t({ defaultMessage: 'Information' }),
          content: $t({ defaultMessage: `We need to refresh page to activate map region.
           Thank you for your understanding` }),
          customContent: {
            action: 'CUSTOM_BUTTONS',
            buttons: [{
              text: $t({ defaultMessage: 'OK' }),
              type: 'primary',
              key: 'ok',
              handler: () => {
                window.location.reload()
              },
              closeAfterAction: true
            }]
          }
        })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console

      if (onError)
        onError(error)
    }
  }

  return {
    currentMapRegion,
    getReqState,
    updateReqState,
    currentPreferredLang,
    data,
    update,
    updatePreference
  }
}
