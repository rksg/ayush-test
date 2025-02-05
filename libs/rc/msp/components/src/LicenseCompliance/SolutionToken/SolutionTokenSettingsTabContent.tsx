import { useEffect, useState } from 'react'

import { Checkbox }  from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { useGetSolutionTokenSettingsQuery }                  from '@acx-ui/msp/services'
import { DeviceComplianceTypeLabels, SolutionTokenSettings } from '@acx-ui/msp/utils'

import * as UI from '../styledComponents'



export default function SolutionTokenSettingsTabContent (props: {
    isTabSelected: boolean
}) {
  const { $t } = useIntl()
  const params = useParams()
  const [settingsData, setSettingsData] = useState<SolutionTokenSettings[]>([])

  const { isTabSelected } = props

  const queryData = useGetSolutionTokenSettingsQuery(
    { params }, { skip: !isTabSelected })

  useEffect(() => {

    if (queryData.data){
      setSettingsData(queryData?.data)
    }

  }, [queryData])

  return <>
    <UI.FieldLabelSubs3 width='275px'
      style={{ fontWeight: '600',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--acx-accents-blue-55)' }}>
      <label>{$t({ defaultMessage: 'Enabled Solutions' })}</label>
      <label>{$t({ defaultMessage: 'License Cost' })}</label>
    </UI.FieldLabelSubs3>
    {
      settingsData.map((setting: SolutionTokenSettings, idx: number) =>
        <UI.FieldLabelSubs3
          key={idx}
          style={idx === 0
            ? { marginTop: '10px' }
            : {}}
          width='275px'>
          <Checkbox
            checked={setting.capped}
            value={setting.capped}
          >
            {DeviceComplianceTypeLabels[setting.featureType]
              ? $t(DeviceComplianceTypeLabels[setting.featureType])
              : setting.featureType}
          </Checkbox>
          <label>{`${setting?.licenseToken} ${setting?.featureCostUnit}`}</label>
        </UI.FieldLabelSubs3>
      )
    }
  </>
}