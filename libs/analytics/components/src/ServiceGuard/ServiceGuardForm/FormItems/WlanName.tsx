import { useCallback, useMemo } from 'react'

import { Form, Select }           from 'antd'
import { NamePath }               from 'antd/es/form/interface'
import { defineMessage, useIntl } from 'react-intl'
import { useParams }              from 'react-router-dom'

import {
  Loader,
  StepsForm,
  Tooltip,
  useStepFormContext
} from '@acx-ui/components'
import { useNetworkListQuery } from '@acx-ui/rc/services'
import { getIntl }             from '@acx-ui/utils'

import { useWlanAuthMethodsMap } from '../../services'
import { ServiceGuardFormDto }   from '../../types'

import { AuthenticationMethod } from './AuthenticationMethod'

const name = ['configs', 0, 'wlanName'] as NamePath
const label = defineMessage({ defaultMessage: 'Network' })

const payload = {
  fields: ['id', 'name', 'venues', 'aps'],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 10_000 // TODO: handle client with networks more than this
}

const validateNameExists = (names?: string[], name?: string) => {
  const { $t } = getIntl()
  const ok = Promise.resolve()
  if (!name) return ok
  if (names?.includes(name)) return ok
  return Promise.reject($t({ defaultMessage: '"{name}" does not exists' }, { name }))
}

export function WlanName () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<ServiceGuardFormDto>()
  const map = useWlanAuthMethodsMap()
  const response = useNetworkListQuery({ payload, params: useParams() })
  const { noData, names, networks } = useMemo(() => {
    if (!response.data) return { noData: false }

    const networks = response.data.data.filter(item => Boolean(item.aps && item.venues.count))

    return {
      networks,
      noData: networks.length === 0,
      names: networks.map(network => network.name)
    }
  }, [response.data])

  const tooltip = networks?.some(network => !Boolean(map.data?.[network.name]))
    ? <Tooltip.Question
      title={$t({ defaultMessage: 'Network is disabled if it is not ready for test' })}
    />
    : undefined

  const handleChange = useCallback((name: string) => {
    const selected = map.data?.[name]?.at(0)
    form.setFieldValue(AuthenticationMethod.fieldName, selected)
  }, [form, map.data])

  return <Loader style={{ height: 'auto', minHeight: 71 }} states={[response, map]}>
    <Form.Item required label={<>{$t(label)}{tooltip}</>}>
      <Form.Item
        noStyle
        name={name}
        label={$t(label)}
        rules={[
          { required: true },
          { validator: (_, value) => validateNameExists(names, value) }
        ]}
        children={<Select<string>
          showSearch
          onChange={handleChange}
          status={noData ? 'error' : undefined}
          placeholder={noData
            ? $t({ defaultMessage: 'No networks found' })
            : $t({ defaultMessage: 'Select a network' })}
          children={networks?.map(network => <Select.Option
            key={network.id}
            value={network.name}
            children={network.name}
            disabled={!Boolean(map.data?.[network.name])}
          />)}
        />}
      />
    </Form.Item>
  </Loader>
}

WlanName.fieldName = name
WlanName.label = label

WlanName.FieldSummary = function WlanNameFieldSummary () {
  const { $t } = useIntl()
  return <Form.Item
    name={name as unknown as NamePath}
    label={$t(label)}
    children={<StepsForm.FieldSummary />}
  />
}
