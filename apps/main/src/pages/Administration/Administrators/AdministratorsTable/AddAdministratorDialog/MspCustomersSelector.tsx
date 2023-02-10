// import { useState } from 'react'

import {
  Form,
  Radio,
  // Row,
  // Col,
  // Space,
  Select
} from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import {
  useMspCustomerListQuery
} from '@acx-ui/rc/services'
import {
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

export enum ECCustomerRadioButtonEnum {
  none = 'none',
  all = 'all',
  specific = 'specific'
}

export const GetEcTypeString = (type: ECCustomerRadioButtonEnum) => {
  switch (type) {
    case ECCustomerRadioButtonEnum.none:
      return defineMessage({ defaultMessage: 'None' })
    case ECCustomerRadioButtonEnum.all:
      return defineMessage({ defaultMessage: 'All Customers' })
    case ECCustomerRadioButtonEnum.specific:
      return defineMessage({ defaultMessage: 'Specific Customers' })
    default:
      return defineMessage({ defaultMessage: 'Known' })
  }
}

export const getEcTypes = () => {
  return [
    {
      label: GetEcTypeString(ECCustomerRadioButtonEnum.none),
      value: ECCustomerRadioButtonEnum.none
    },
    {
      label: GetEcTypeString(ECCustomerRadioButtonEnum.all),
      value: ECCustomerRadioButtonEnum.all
    },
    {
      label: GetEcTypeString(ECCustomerRadioButtonEnum.specific),
      value: ECCustomerRadioButtonEnum.specific
    }]
}

const MspCustomerSelector = () => {
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  const ecType = Form.useWatch('ecType', form)

  const ecTypesList = getEcTypes().map((item) => ({
    label: $t(item.label),
    value: item.value
  }))

  const { data, isLoading } = useMspCustomerListQuery({ params })
  const options = data?.data.map((item) => {
    return {
      label: item.name,
      value: item.id
    }
  }).filter(a => a.label !== '')

  return (
    <>
      <Form.Item
        name='ecType'
        label={$t({ defaultMessage: 'Managed Customers' })}
        initialValue={ECCustomerRadioButtonEnum.all}
      >
        <Radio.Group style={{ width: '100%' }}>
          {ecTypesList.map((item) => {
            return (
              <Radio
                value={item.value}
              >
                {$t({ defaultMessage: 'Managed Customers:' })}
              </Radio>
            )
          })

          }
        </Radio.Group>
      </Form.Item>

      {ecType === ECCustomerRadioButtonEnum.specific && (
        <Form.Item
          name='mspEC'
          noStyle
        >
          <Select
            options={options}
            disabled={isLoading}
          />
        </Form.Item>
      )}
    </>
  )
}

export default MspCustomerSelector