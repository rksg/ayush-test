import { Form, Select }           from 'antd'
import { defineMessage, useIntl } from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Loader, StepsFormNew } from '@acx-ui/components'
import { useNetworkListQuery }  from '@acx-ui/rc/services'

const name = 'wlanName' as const
const label = defineMessage({ defaultMessage: 'Network' })

const payload = {
  fields: ['id', 'name'],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 10_000 // TODO: handle client with networks more than this
}

export function WlanName () {
  const { $t } = useIntl()
  const params = useParams()
  const networks = useNetworkListQuery({ payload, params }, {
    selectFromResult: (res) => ({
      ...res,
      noData: res.data ? !Boolean(res.data.totalCount) : false,
      names: res.data?.data.map(network => network.name),
      options: res.data?.data.map(network => <Select.Option
        key={network.id}
        value={network.name}
        children={network.name}
      />)
    })
  })

  const validateNameExists = (name?: string) => {
    const ok = Promise.resolve()
    if (!name) return ok
    if (networks.names?.includes(name)) return ok
    return Promise.reject($t({ defaultMessage: '"{name}" not exists' }, { name }))
  }

  return <Loader style={{ height: 'auto' }} states={[networks]}>
    <Form.Item
      name={name}
      label={$t(label)}
      rules={[
        { required: true },
        { validator: (_, value) => validateNameExists(value) }
      ]}
      children={<Select
        status={networks.noData ? 'error' : undefined}
        placeholder={networks.noData
          ? $t({ defaultMessage: 'No Networks found' })
          : $t({ defaultMessage: 'Select a Network' })}
        children={networks.options}
      />}
    />
  </Loader>
}

WlanName.fieldName = name
WlanName.label = label

WlanName.FieldSummary = function WlanNameFieldSummary () {
  const { $t } = useIntl()
  return <Form.Item
    name={name}
    label={$t(label)}
    children={<StepsFormNew.FieldSummary />}
  />
}
