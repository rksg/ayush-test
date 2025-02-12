import { useEffect, useState } from 'react'

import { Checkbox }  from 'antd'
import { omit }      from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, showToast }                                                        from '@acx-ui/components'
import { useGetSolutionTokenSettingsQuery, useUpdateSolutionTokenSettingsMutation } from '@acx-ui/msp/services'
import { DeviceComplianceTypeLabels, SolutionTokenSettings }                        from '@acx-ui/msp/utils'
import { useUserProfileContext }                                                    from '@acx-ui/user'

import * as UI from '../styledComponents'


export default function SolutionTokenSettingsTabContent (props: {
    isTabSelected: boolean
}) {
  const { $t } = useIntl()
  const params = useParams()
  const [settingsData, setSettingsData] = useState<SolutionTokenSettings[]>([])

  const { isTabSelected } = props

  const {
    isPrimeAdmin
  } = useUserProfileContext()

  const isPrimeAdminUser = isPrimeAdmin()

  const queryData = useGetSolutionTokenSettingsQuery(
    { params }, { skip: !isTabSelected })

  const [updateSolutionTokenSettings, {
    isLoading: updating
  }] = useUpdateSolutionTokenSettingsMutation()

  useEffect(() => {
    if(isTabSelected && queryData.data) {
      setSettingsData(queryData.data)
    }
  }, [isTabSelected, queryData])

  const enabledSolutionHandler = async (item: SolutionTokenSettings) => {
    const _item = { ...item, enabled: !item.enabled }
    const updatedItem =
    omit(_item, ['featureName', 'maxQuantity', 'licenseToken', 'featureUnit'])

    await updateSolutionTokenSettings({
      params,
      payload: [updatedItem]
    }).unwrap()
      .then(() => {

        const featureName = DeviceComplianceTypeLabels[item.featureType]
          ? $t(DeviceComplianceTypeLabels[item.featureType])
          : item.featureName

        showToast({
          type: 'success',
          content: `${featureName} ` + $t({ defaultMessage: 'is {enabled}' },
            { enabled: item.enabled ? 'Disabled' : 'Enabled' })
        })
      }).catch((error) => {
        showToast({
          type: 'error',
          content: error?.data?.message || error?.data?.error?.message
        })
      })

  }

  return <Loader states={[{
    isLoading: queryData.isLoading || updating
  }]}>
    <UI.FieldLabelSubs3 width='275px'
      style={{ fontWeight: '600',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--acx-accents-blue-55)' }}>
      <label>{$t({ defaultMessage: 'Enabled Solutions' })}</label>
      <label>{$t({ defaultMessage: 'License Cost' })}</label>
    </UI.FieldLabelSubs3>
    {
      settingsData.map((setting: SolutionTokenSettings, idx: number) =>
      {
        return <UI.FieldLabelSubs3
          key={idx}
          style={idx === 0
            ? { marginTop: '10px' }
            : {}}
          width='275px'>
          <Checkbox
            checked={setting.enabled}
            onChange={() => { enabledSolutionHandler(setting) }}
            disabled={!isPrimeAdminUser}
          >
            {DeviceComplianceTypeLabels[setting.featureType]
              ? $t(DeviceComplianceTypeLabels[setting.featureType])
              : setting.featureName}
          </Checkbox>
          <label>{`${setting?.licenseToken} ${setting?.featureCostUnit}`}</label>
        </UI.FieldLabelSubs3>
      })
    }
  </Loader>
}