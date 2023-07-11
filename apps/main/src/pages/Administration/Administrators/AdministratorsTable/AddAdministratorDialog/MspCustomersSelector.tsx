import React, { useEffect } from 'react'

import {
  Form,
  Radio,
  Select
} from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { useMspCustomerListQuery } from '@acx-ui/msp/services'
import { SpaceWrapper }            from '@acx-ui/rc/components'
import { useTableQuery }           from '@acx-ui/rc/utils'
import { RolesEnum }               from '@acx-ui/types'

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
  const form = Form.useFormInstance()
  const ecType = Form.useWatch('ecType', form)
  const role = Form.useWatch('role', form)

  useEffect(() => {
    (role === RolesEnum.DPSK_ADMIN || role === RolesEnum.GUEST_MANAGER)
      ? form.setFieldValue('ecType', 'none')
      : form.setFieldValue('ecType', 'all')
  }, [role])

  const ecTypesList = getEcTypes().map((item) => ({
    label: $t(item.label),
    value: item.value
  }))

  const tableQuery = useTableQuery({
    useQuery: useMspCustomerListQuery,
    defaultPayload: {
      filters: {},
      fields: [
        'id',
        'name'
      ],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  const options = tableQuery.data?.data.map((item) => {
    return {
      label: item.name,
      value: item.id
    }
  }).filter(a => a.label !== '')

  return (
    <Form.Item
      name='ecType'
      label={$t({ defaultMessage: 'Managed Customers' })}
      initialValue={ECCustomerRadioButtonEnum.all}
      rules={[{ required: true }]}
    >
      <Radio.Group style={{ width: '100%' }}
        disabled={role === RolesEnum.DPSK_ADMIN || role === RolesEnum.GUEST_MANAGER}>
        <SpaceWrapper full direction='vertical' size='middle'>
          {ecTypesList.map((item) => {
            return (
              <React.Fragment key={item.value}>
                <Radio value={item.value}>
                  {item.label}
                </Radio>

                {(ecType === ECCustomerRadioButtonEnum.specific &&
                 item.value === ECCustomerRadioButtonEnum.specific) && (
                  <Form.Item
                    name='delegatedEcs'
                    noStyle
                    rules={[{
                      required: true,
                      message: $t({ defaultMessage: 'Please select customer(s) to manage' })
                    }]}
                  >
                    <Select
                      mode='multiple'
                      options={options}
                      disabled={tableQuery.isLoading}
                      showSearch
                      allowClear
                      optionFilterProp='label'
                    />
                  </Form.Item>
                )}
              </React.Fragment>
            )})}
        </SpaceWrapper>
      </Radio.Group>
    </Form.Item>
  )
}

export default MspCustomerSelector