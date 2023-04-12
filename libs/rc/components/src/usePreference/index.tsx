import _           from 'lodash'
import { useIntl } from 'react-intl'

import { showActionModal }                                      from '@acx-ui/components'
import { useGetPreferencesQuery, useUpdatePreferenceMutation }  from '@acx-ui/rc/services'
import { COUNTRY_CODE, TenantPreferenceSettings, CommonResult } from '@acx-ui/rc/utils'
import { useNavigate, useParams }                               from '@acx-ui/react-router-dom'

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
  const navigate = useNavigate()
  const { data, ...getReqState } = useGetPreferencesQuery({ params })
  const [ updatePreference, updateReqState] = useUpdatePreferenceMutation()
  const currentMapRegion = getMapRegion(data)
  const currentPreferredLang = data?.global.preferredLanguage as string

  const innerUpdate = async (props: updatePreferenceProps) => {
    const { newData, onSuccess, onError } = props
    const payload = _.merge({}, data, newData)

    try {
      const res = await updatePreference({ params, payload }).unwrap()
      if (onSuccess)
        onSuccess(res)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console

      if (onError)
        onError(error)
    }
  }

  const update = async (props: updatePreferenceProps) => {
    const { newData } = props

    // update map region
    if (newData.global?.mapRegion) {
      // limitation due to known issue on GoogleMap js-api-loader:
      //   https://github.com/googlemaps/js-api-loader/issues/210
      showActionModal({
        type: 'confirm',
        title: $t({ defaultMessage: 'Confirm' }),
        content: $t({
          defaultMessage: `Changing Map Region will affect all users in this account.{br}
                            Are you sure you what to change Map Region?`
        }, {
          br: <br/>
        }),
        onOk: async () => {
          await innerUpdate({
            ...props,
            onSuccess: (res) => {
              if (props.onSuccess)
                props.onSuccess(res)

              navigate(0)
            } })
        }
      })
    } else {
      await innerUpdate(props)
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
