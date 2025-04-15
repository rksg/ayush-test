import React, { useEffect } from 'react'

import {
  Form,
  Radio
} from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { Select }                  from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { useMspCustomerListQuery } from '@acx-ui/msp/services'
import { SpaceWrapper }            from '@acx-ui/rc/components'
import { useTableQuery }           from '@acx-ui/rc/utils'
import { RolesEnum }               from '@acx-ui/types'
import { AccountType }             from '@acx-ui/utils'

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
  const isViewmodleAPIsMigrateEnabled = useIsSplitOn(Features.VIEWMODEL_APIS_MIGRATE_MSP_TOGGLE)

  useEffect(() => {
    (role === RolesEnum.PRIME_ADMIN)
      ? form.setFieldValue('ecType', ECCustomerRadioButtonEnum.all)
      : form.setFieldValue('ecType', ECCustomerRadioButtonEnum.none)
  }, [role])

  const ecTypesList = getEcTypes().map((item) => ({
    label: $t(item.label),
    value: item.value
  }))

  const tableQuery = useTableQuery({
    useQuery: useMspCustomerListQuery,
    pagination: {
      pageSize: 10000
    },
    defaultPayload: {
      filters: {
        tenantType: [AccountType.MSP_EC, AccountType.MSP_REC,
          AccountType.MSP_INTEGRATOR, AccountType.MSP_INSTALLER]
      },
      fields: [
        'id',
        'name'
      ],
      sortField: 'name',
      sortOrder: 'ASC'
    },
    enableRbac: isViewmodleAPIsMigrateEnabled
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
                      showArrow
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