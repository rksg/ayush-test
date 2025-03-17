import { useEffect, useState } from 'react'

import { Form, InputNumber, Switch } from 'antd'
import { FormInstance }              from 'antd/es/form/Form'
import { useIntl }                   from 'react-intl'
import { useParams }                 from 'react-router-dom'

import { Loader, showToast }                                                        from '@acx-ui/components'
import { useGetSolutionTokenSettingsQuery, useUpdateSolutionTokenSettingsMutation } from '@acx-ui/msp/services'
import { DeviceComplianceType, DeviceComplianceTypeLabels, SolutionTokenSettings }  from '@acx-ui/msp/utils'
import { useUserProfileContext }                                                    from '@acx-ui/user'

import * as UI from '../styledComponents'

interface FormValues {
  [key: string]: SolutionTokenSettings
}

export default function SolutionTokenSettingsForm (props: {
  form: FormInstance<SolutionTokenSettings> }) {
  const { $t } = useIntl()
  const params = useParams()
  const [formValues, setFormValues] = useState<FormValues>({} as FormValues)
  const [isLoading, setIsLoading] = useState(true)

  const {
    isPrimeAdmin
  } = useUserProfileContext()

  const isPrimeAdminUser = isPrimeAdmin()

  const queryData = useGetSolutionTokenSettingsQuery(
    { params })

  const [updateSolutionTokenSettings, {
    isLoading: updating
  }] = useUpdateSolutionTokenSettingsMutation()

  useEffect(() => {

    if (queryData.data){
      setFormValues(queryData.data.reduce((acc, setting: SolutionTokenSettings) => {
        acc[setting.featureType] = {
          ...setting
        }
        return acc
      }, {} as FormValues))

      setIsLoading(false)
    }

  }, [queryData])

  const handleSwitchChange = (featureType: DeviceComplianceType, checked: boolean) => {
    setFormValues((prevState) => ({
      ...prevState,
      [featureType]: {
        ...prevState[featureType],
        capped: checked
      }
    }))
  }

  const handleQuantityChange = (featureType: DeviceComplianceType, value: number) => {
    setFormValues((prevState) => ({
      ...prevState,
      [featureType]: {
        ...prevState[featureType],
        maxQuantity: value || 0
      }
    }))
  }

  const submitForm = async () => {
    const result = Object.values(formValues).map(item => {
      return { featureType: item.featureType,
        capped: item.capped,
        ...(!item.capped ? { maxQuantity: item.maxQuantity } : {}) }
    })
    await updateSolutionTokenSettings({
      params,
      payload: result
    }).unwrap()
      .then(() => {
        showToast({
          type: 'success',
          content: $t({ defaultMessage: 'Solution Usage Cap Updated!' })
        })
      }).catch((error) => {
        showToast({
          type: 'error',
          content: error?.data?.message || error?.data?.error?.message
        })
      })
  }

  return <Loader states={[{
    isLoading: (isLoading && queryData.isLoading) || updating
  }]}><div>
      <UI.SettingsFieldLabel width='600px'>
        <label>{ $t({ defaultMessage: 'Enabled Solutions' }) }</label>
        <label>{ $t({ defaultMessage: 'Token License Cost' }) }</label>
        <label>{ $t({ defaultMessage: 'Solution Usage Cap' }) }</label>
        <label></label>
      </UI.SettingsFieldLabel>
      <Form name='solutionTokenSettings' form={props.form} onFinish={submitForm}>
        {
          Object.entries(formValues).map((setting) => {
            const { capped, maxQuantity, featureType,
              licenseToken, featureCostUnit, enabled, featureName, featureUnit } = setting[1]

            return <UI.SettingsFieldLabelKeyValue width='600px' key={featureType}>
              <label>
                {DeviceComplianceTypeLabels[featureType]
                  ? $t(DeviceComplianceTypeLabels[featureType])
                  : featureName}
              </label>
              <label>{`${licenseToken} ${featureCostUnit}`}</label>
              <label>
                <Form.Item
                  name={featureType + '-capped'}
                  style={{
                    margin: '0px'
                  }}
                  initialValue={capped}
                  valuePropName='checked'
                  children={<>
                    <Switch
                      checked={capped}
                      disabled={!(isPrimeAdminUser && enabled)}
                      onChange={(ev) => handleSwitchChange(featureType, ev)}/>
                    <span>
                      { capped ? $t({ defaultMessage: 'Capped' })
                        : $t({ defaultMessage: 'Uncapped' }) }
                    </span>
                  </>
                  }/>
              </label>
              { !capped
          && <label>
            <Form.Item
              name={featureType + '-maxQuantity'}
              style={{
                margin: '0px'
              }}
              rules={[{
                required: true,
                message: $t({ defaultMessage: 'Please enter quantity!' })
              }]}
              initialValue={maxQuantity}
              children={<>
                <InputNumber
                  controls={false}
                  disabled={!(isPrimeAdminUser && enabled)}
                  min={0}
                  defaultValue={maxQuantity}
                  value={maxQuantity}
                  onChange={(ev) => handleQuantityChange(featureType, ev)}
                  style={{
                    height: '28px',
                    fontSize: '12px',
                    width: '60px',
                    margin: '0 4px'
                  }}/>
                <label>{featureUnit}</label>
              </>
              }/>
          </label>
              }
            </UI.SettingsFieldLabelKeyValue>
          }
          )
        }

      </Form>
    </div>
  </Loader>
}