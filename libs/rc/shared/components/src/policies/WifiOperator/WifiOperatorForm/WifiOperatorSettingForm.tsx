import { Button, Form, Input, Space } from 'antd'
import TextArea                       from 'antd/lib/input/TextArea'
import { useIntl }                    from 'react-intl'

import { Select, Subtitle }                                                                      from '@acx-ui/components'
import { useGetWifiOperatorListQuery }                                                           from '@acx-ui/rc/services'
import { FriendlyName, checkObjectNotExists, domainNameWildcardRegExp, servicePolicyNameRegExp } from '@acx-ui/rc/utils'
import { useParams }                                                                             from '@acx-ui/react-router-dom'

import { FriendlyNameEnum }        from '../constants'
import { friendlyNameEnumOptions } from '../contentMaps'

import { DeleteOutlinedIcon } from './styledComponents'


const WifiOperatorSettingForm = () => {
  const { $t } = useIntl()
  const { useWatch } = Form
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

  const nameValidator = (value: string) => {
    if (data?.data && value) {
      const list = data.data
        .filter(n => n.id !== params.policyId)
        .map(n => n.name)

      return checkObjectNotExists(list, value, $t({ defaultMessage: 'Wi-Fi Operator' }))
    }
    return Promise.resolve()
  }

  const domainNamesValidator = (value: string) => {
    if (value) {
      let namesSplit: string[] = value.split(/\r?\n/)
      return domainNameWildcardRegExp(namesSplit)
    }
    return Promise.resolve()
  }


  const validateDuplicateLangauage = (langCode: string) => {
    if (langCode) {
      if (friendlyNames.filter(item => item.language === langCode).length > 1) {
        return Promise.reject($t({ defaultMessage: 'Duplicate language' }))
      }
    }
    return Promise.resolve()
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
          { validator: (_, value) => servicePolicyNameRegExp(value) },
          { validator: (_, value) => nameValidator(value) }
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
          { validator: (_, value) => domainNamesValidator(value) }
        ]}
        initialValue={''}
        children={<TextArea rows={8} placeholder={$t({ defaultMessage: 'One domain per line' })}/>}
      />
      <Subtitle level={3}>
        { $t({ defaultMessage: 'Operator Friendly Name' }) }
      </Subtitle>

      <Form.List name='friendlyNames' initialValue={[{}]}>
        {(fields, { add, remove }) => (
          <>
            {fields?.map((field, index) =>
              <Space key={`friendlyName_${index}`}>
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
                {fields.length > 1 &&
                <Button
                  aria-label='delete'
                  type='link'
                  icon={<DeleteOutlinedIcon />}
                  style={{ width: '50px' }}
                  onClick={() => remove(field.name)}
                />
                }
              </Space>
            )}
            {(fields.length < friendlyNameKeys.length) &&
              <Button type='link'
                data-testid='addFriendlyNameBtn'
                style={{ textAlign: 'left' }}
                onClick={() => {
                  add(undefined, fields.length)
                }}>
                {$t({ defaultMessage: 'Add another name' })}
              </Button>
            }
          </>
        )}
      </Form.List>
    </>
  )
}
export default WifiOperatorSettingForm