import { useEffect } from 'react'

import _ from 'lodash'

import { useGetPreferencesQuery, useUpdatePreferenceMutation }  from '@acx-ui/rc/services'
import { COUNTRY_CODE, TenantPreferenceSettings, CommonResult } from '@acx-ui/rc/utils'
import { useParams }                                            from '@acx-ui/react-router-dom'

import { useUpdateGoogleMapRegion } from './useUpdateGoogleMapRegion'

const getMapRegion = (data: TenantPreferenceSettings | undefined): string => {
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
  const params = useParams()
  const { update: updateGoogleMapRegion } = useUpdateGoogleMapRegion()

  const { data, ...getReqState } = useGetPreferencesQuery({ params })
  const [ updatePreference, updateReqState] = useUpdatePreferenceMutation()
  const currentMapRegion = getMapRegion(data)

  const update = async (props: updatePreferenceProps) => {
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

  useEffect(() => {
    updateGoogleMapRegion(currentMapRegion)
  }, [currentMapRegion, updateGoogleMapRegion])


  return {
    currentMapRegion,
    getReqState,
    updateReqState,
    data,
    update,
    updatePreference
  }
}