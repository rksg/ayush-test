import { useEffect, useState } from 'react'

import { Form, InputNumber, Switch } from 'antd'
import { useIntl }                   from 'react-intl'
import { useParams }                 from 'react-router-dom'

import { useGetSolutionTokenSettingsQuery }                  from '@acx-ui/msp/services'
import { DeviceComplianceTypeLabels, SolutionTokenSettings } from '@acx-ui/msp/utils'

import * as UI from '../styledComponents'

export default function SolutionTokenSettingsForm () {
  const { $t } = useIntl()
  const params = useParams()
  const [settingsData, setSettingsData] = useState<SolutionTokenSettings[]>([])

  const queryData = useGetSolutionTokenSettingsQuery(
    { params })

  useEffect(() => {

    if (queryData.data){
      setSettingsData(queryData?.data)
    }

  }, [queryData])

  return <div><UI.SettingsFieldLabel width='600px'>
    <label>{ $t({ defaultMessage: 'Enabled Solutions' }) }</label>
    <label>{ $t({ defaultMessage: 'Token License Cost' }) }</label>
    <label>{ $t({ defaultMessage: 'Solution Usage Cap' }) }</label>
    <label></label>
  </UI.SettingsFieldLabel>
  <Form name='solutionTokenSettings'>
    {
      settingsData.map((setting: SolutionTokenSettings) =>
        <UI.SettingsFieldLabelKeyValue width='600px' key={setting.featureType}>
          <label>
            {DeviceComplianceTypeLabels[setting.featureType]
              ? $t(DeviceComplianceTypeLabels[setting.featureType])
              : setting.featureType}
          </label>
          <label>{`${setting?.licenseToken} ${setting?.featureCostUnit}`}</label>
          <label>
            <Form.Item
              name={setting.featureType + '_capped'}
              style={{
                margin: '0px'
              }}
              initialValue={setting.capped}
              children={<>
                <Switch
                  checked={setting.capped}
                />
                <span>{setting.capped ? $t({ defaultMessage: 'Capped' })
                  : $t({ defaultMessage: 'Uncapped' })}</span></>
              }/>
          </label>
          <label>
            <Form.Item
              name={setting.featureType + '_maxQuantity'}
              initialValue={setting.maxQuantity}
              style={{
                margin: '0px'
              }}
              children={<>
                <InputNumber
                  controls={false}
                  style={{
                    height: '28px',
                    fontSize: '12px',
                    width: '60px'
                  }}/>
                <span style={{
                  fontSize: '12px'
                }}>{` ${setting.featureUnit}`}</span></>
              }/>
          </label>
        </UI.SettingsFieldLabelKeyValue>
      )
    }

  </Form>
  </div>
}