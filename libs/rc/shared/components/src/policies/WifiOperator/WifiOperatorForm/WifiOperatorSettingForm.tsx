import { Button, Form, Input, Space } from 'antd'
import TextArea                       from 'antd/lib/input/TextArea'
import { useIntl }                    from 'react-intl'

import { GridCol, GridRow, Select, StepsFormLegacy, Subtitle }             from '@acx-ui/components'
import { DeleteOutlinedIcon }                                              from '@acx-ui/icons'
import { useGetWifiOperatorListQuery }                                     from '@acx-ui/rc/services'
import { FriendlyName, domainNameWildcardRegExp, servicePolicyNameRegExp } from '@acx-ui/rc/utils'
import { useParams }                                                       from '@acx-ui/react-router-dom'

import { FriendlyNameEnum }        from '../constants'
import { friendlyNameEnumOptions } from '../contentMaps'


type WifiOperatorSettingFormProps = {
  edit: boolean
}

const WifiOperatorSettingForm = (props: WifiOperatorSettingFormProps) => {
  const { $t } = useIntl()
  const { useWatch } = Form
  const { edit } = props
  const params = useParams()

  const [friendlyNames] = [useWatch<FriendlyName[]>('friendlyNames')]

  const friendlyNameKeys = Object.keys(FriendlyNameEnum) as Array<keyof typeof FriendlyNameEnum>
  const friendlyNameLanguageOptions = friendlyNameKeys.map(key =>
    ( { value: key, label: $t(friendlyNameEnumOptions[FriendlyNameEnum[key]]) }))
  const { data } = useGetWifiOperatorListQuery({
    params,
    payload: {
      fields: ['name', 'id'], sortField: 'name',
      sortOrder: 'ASC', page: 1, pageSize: 10000
    }
  })

  const nameValidator = async (_rule: unknown, value: string) => {
    const policyId = edit ? params.policyId : ''
    return new Promise<void>((resolve, reject) => {
      if (!edit && value
        && data?.data.length
        && data?.data.filter(item => item.id !== policyId)
          .findIndex((wifiOperator) => wifiOperator.name === value) !== -1
      ) {
        return reject(
          $t({ defaultMessage: 'The Wi-Fi Operator with that name already exists' })
        )
      }
      return resolve()
    })
  }

  const validateDuplicateLangauage = (langCode: string) => {
    return new Promise<void>((resolve, reject) => {
      if (friendlyNames.filter(item => {return item.language === langCode}).length > 1) {
        return reject(
          $t({ defaultMessage: 'Duplicate language' })
        )
      }
      return resolve()
    })
  }

  return (
    <>
      <Form.Item
        name='name'
        label={$t({ defaultMessage: 'Profile Name' })}
        rules={[
          { required: true },
          { min: 2 },
          { max: 32 },
          { validator: nameValidator },
          { validator: (_, value) => servicePolicyNameRegExp(value) }
        ]}
        validateFirst
        hasFeedback
        initialValue={''}
        children={<Input/>}
      />
      <Form.Item
        name='domainNames'
        label={$t({ defaultMessage: 'Domain' })}
        rules={[
          { required: true },
          { validator: (_, value) => {
            let namesSplit: string[] = value.split(/\r?\n/)
            return domainNameWildcardRegExp(namesSplit)
          }
          }
        ]}
        initialValue={''}
        children={<TextArea rows={8} placeholder={$t({ defaultMessage: 'On domain per line' })}/>}
      />
      <Subtitle level={3}>
        { $t({ defaultMessage: 'Operator Friendly Name' }) }
      </Subtitle>

      <Form.List name='friendlyNames' initialValue={[{}]}>
        {(fields, { add, remove }) => (
          <>
            {fields?.map((field, index) =>
              <Space align='start' size={12} key={`friendlyName_${index}`}>
                {<Form.Item
                  name={[field.name, 'language']}
                  label={$t({ defaultMessage: 'Language' })}
                  rules={[
                    { required: true },
                    { validator: (_, value) => validateDuplicateLangauage(value) }
                  ]}
                  children={
                    <Select style={{ minWidth: 150 }}
                      data-testid={`select_language_${index}`}
                      placeholder={$t({ defaultMessage: 'Select...' })}
                      options={friendlyNameLanguageOptions}
                    />}
                /> }
                <Form.Item
                  name={[field.name, 'name']}
                  label={$t({ defaultMessage: 'Friendly Name' })}
                  rules={[
                    { required: true },
                    { min: 1 },
                    { max: 252 }
                  ]}
                  children={<Input data-testid={`input_name_${index}`} />}
                />
                <Button
                  aria-label='delete'
                  type='link'
                  hidden={fields.length === 1}
                  style={{ marginTop: '20px', marginLeft: '6px' }}
                  icon={<DeleteOutlinedIcon />}
                  onClick={() => remove(field.name)}
                />
              </Space>
            )}
            <Button type='link'
              data-testid='addFriendlyNameBtn'
              style={{ textAlign: 'left' }}
              onClick={() => {
                add( undefined, fields.length)
              }}>
              {$t({ defaultMessage: 'Add another name' })}
            </Button>
          </>
        )}
      </Form.List>
    </>
  )
}
export default WifiOperatorSettingForm