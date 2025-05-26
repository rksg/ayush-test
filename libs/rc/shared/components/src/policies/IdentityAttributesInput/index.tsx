import { useEffect, useState } from 'react'

import { Form, Input, Row, Col, Space, Button, Select } from 'antd'
import { useIntl }                                      from 'react-intl'

import { Tooltip, cssStr } from '@acx-ui/components'
import { DeleteOutlined }  from '@acx-ui/icons'
import {
  AttributeMapping,
  IdentityAttributeMappingNameType,
  getIdentityAttributeMappingNameTypeOptions,
  getValueFromMapping
} from '@acx-ui/rc/utils'
import { noDataDisplay } from '@acx-ui/utils'

import { FieldLabel }  from '../../NetworkForm/styledComponents'
import { Description } from '../CertificateTemplate/styledComponents'

interface IdentityAttributesInputProps {
  fieldLabel: string
  attributeMappings?: AttributeMapping[]
  description?: string
  readMode?: boolean
}

export const excludedAttributeTypes = [
  IdentityAttributeMappingNameType.DISPLAY_NAME,
  IdentityAttributeMappingNameType.EMAIL,
  IdentityAttributeMappingNameType.PHONE_NUMBER
]

export const IdentityAttributesInput = (props: IdentityAttributesInputProps) => {
  const { fieldLabel, attributeMappings, description, readMode = false } = props
  const { $t } = useIntl()
  const [identityName, setIdentityName ] = useState<string|undefined>('')
  const [identityEmail, setIdentityEmail ] = useState<string|undefined>('')
  const [identityPhone, setIdentityPhone ] = useState<string|undefined>('')

  const maxMappingCount =
    getIdentityAttributeMappingNameTypeOptions().length - excludedAttributeTypes.length

  useEffect (()=>{
    if(attributeMappings && attributeMappings.length > 0) {
      // eslint-disable-next-line max-len
      const idName = getValueFromMapping(attributeMappings, IdentityAttributeMappingNameType.DISPLAY_NAME)
      setIdentityName(idName)

      // eslint-disable-next-line max-len
      const idEmail = getValueFromMapping(attributeMappings, IdentityAttributeMappingNameType.EMAIL)
      setIdentityEmail(idEmail)

      // eslint-disable-next-line max-len
      const idPhone = getValueFromMapping(attributeMappings, IdentityAttributeMappingNameType.PHONE_NUMBER)
      setIdentityPhone(idPhone)
    }
  }, [attributeMappings])

  return (<>
    {!readMode && (<>
      <FieldLabel width={'280px'}>
        {fieldLabel}
      </FieldLabel>
      {description && (
        <Description>
          {description}
        </Description>
      )}
    </>)}
    <Form.Item
      name='identityName'
      label={
        <>
          {$t({ defaultMessage: 'Identity Name' })}
          <Tooltip.Question
            // eslint-disable-next-line max-len
            title={$t({ defaultMessage: 'If "Identity Name" is empty or does not match, it will default to “NameID”.' })}
            placement='bottom'
            iconStyle={{ width: 16, height: 16 }}
          />
        </>
      }
      initialValue={$t({ defaultMessage: 'displayName' })}
      rules={[{ max: 255 }]}
    >
      {readMode? (identityName || noDataDisplay) : <Input />}
    </Form.Item>
    <Form.Item
      name='identityEmail'
      label={$t({ defaultMessage: 'Identity Email' })}
      initialValue={$t({ defaultMessage: 'email' })}
      rules={[{ max: 255 }]}
    >
      {readMode? (identityEmail || noDataDisplay) : <Input />}
    </Form.Item>
    <Form.Item
      name='identityPhone'
      label={$t({ defaultMessage: 'Identity Phone' })}
      initialValue={$t({ defaultMessage: 'phone' })}
      rules={[{ max: 255 }]}
    >
      {readMode? (identityPhone || noDataDisplay) : <Input />}
    </Form.Item>
    {!readMode &&
      <Form.List name='attributeMappings'>
        {
          (fields, { add, remove }) => (
            <Row gutter={[16, 20]}>
              {
                fields.map((field, index) => (
                  <Col key={`attribute-mapping-${field.key}`} span={24}>
                    <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <FieldLabel width='280px'>
                        {$t(
                          { defaultMessage: 'Identity Attribute {number}' },
                          { number: index + 1 }
                        )}
                      </FieldLabel>
                      <Button
                        type='link'
                        onClick={() => remove(index)}
                        icon={<DeleteOutlined />}
                      />
                    </Space>
                    <Form.Item
                      name={[index, 'name']}
                      label={$t({ defaultMessage: 'Attribute Type' })}
                      rules={[{ required: true }]}
                    >
                      <Select
                        options={
                          getIdentityAttributeMappingNameTypeOptions()
                            .filter(option => {
                              const value = option.value as IdentityAttributeMappingNameType

                              if (excludedAttributeTypes.includes(value)) return false

                              const selectedTypes = attributeMappings
                                ?.map((mapping: AttributeMapping, i: number) => {
                                  // Skip current row
                                  if (i === index) return null
                                  return mapping?.name
                                })
                                .filter(Boolean) ?? []
                              return !selectedTypes.includes(value)
                            })
                        }
                      />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[index, 'mappedByName']}
                      label={$t({ defaultMessage: 'Claim Name' })}
                      rules={[{ required: true }, { min: 1, max: 255 }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                ))
              }
              <Col span={24}>
                {fields.length < maxMappingCount &&
              <Button
                type='link'
                style={{ fontSize: cssStr('--acx-body-4-font-size') }}
                onClick={() => add()}
                children={$t({ defaultMessage: 'Add custom field' })}
              />
                }
              </Col>
            </Row>
          )
        }
      </Form.List>
    }
  </>)
}