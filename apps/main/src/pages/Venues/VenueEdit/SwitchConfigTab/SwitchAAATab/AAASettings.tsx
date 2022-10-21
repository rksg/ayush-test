/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import {
  Form,
  Popconfirm,
  Select,
  Switch,
  Transfer
} from 'antd'
import { TransferItem } from 'antd/lib/transfer'
import _                from 'lodash'
import { useIntl }      from 'react-intl'

import { Loader, Fieldset }                                        from '@acx-ui/components'
import { useGetAaaSettingQuery, useVenueSwitchAAAServerListQuery } from '@acx-ui/rc/services'
import { useTableQuery, AAAServerTypeEnum, AAA_SERVER_TYPE }       from '@acx-ui/rc/utils'
import { useParams }                                               from '@acx-ui/react-router-dom'

const SERVERS_OBJ = {
  RADIUS: {
    key: AAA_SERVER_TYPE.RADIUS,
    name: AAA_SERVER_TYPE.RADIUS.toString()
  },
  TACACS_PLUS: {
    key: AAA_SERVER_TYPE.TACACS,
    name: AAA_SERVER_TYPE.TACACS.toString()
  },
  LOCAL: {
    key: AAA_SERVER_TYPE.LOCAL,
    name: AAA_SERVER_TYPE.LOCAL.toString()
  }
}

const AUTHEN_SERVERS_OBJ = {
  ...SERVERS_OBJ,
  NONE_TYPE: {
    key: AAA_SERVER_TYPE.NONE,
    name: AAA_SERVER_TYPE.NONE.toString()
  }
}

const AUTHOR_SERVERS_OBJ = {
  ...SERVERS_OBJ,
  NONE_TYPE: {
    key: AAA_SERVER_TYPE.NONE,
    name: AAA_SERVER_TYPE.NONE.toString()
  }
}

const ACCOUNTING_SERVERS_OBJ = {
  ...SERVERS_OBJ,
  NONE_TYPE: {
    key: AAA_SERVER_TYPE.NONE,
    name: AAA_SERVER_TYPE.NONE.toString()
  }
}

const defaultAvailableLoginServers: TransferItem[] = [
  AUTHEN_SERVERS_OBJ.RADIUS,
  AUTHEN_SERVERS_OBJ.TACACS_PLUS,
  AUTHEN_SERVERS_OBJ.LOCAL,
  AUTHEN_SERVERS_OBJ.NONE_TYPE
]

const defaultAvailableCommandAuthOrder: TransferItem[] = [
  AUTHOR_SERVERS_OBJ.RADIUS,
  AUTHOR_SERVERS_OBJ.TACACS_PLUS,
  AUTHOR_SERVERS_OBJ.NONE_TYPE
]

const defaultAvailableExecAuthOrder: TransferItem[] = [
  AUTHOR_SERVERS_OBJ.RADIUS,
  AUTHOR_SERVERS_OBJ.TACACS_PLUS,
  AUTHOR_SERVERS_OBJ.NONE_TYPE
]

const defaultAvailableCommandAcctOrder: TransferItem[] = [
  ACCOUNTING_SERVERS_OBJ.RADIUS,
  ACCOUNTING_SERVERS_OBJ.TACACS_PLUS,
  ACCOUNTING_SERVERS_OBJ.NONE_TYPE
]

const defaultAvailableExecAcctOrder: TransferItem[] = [
  ACCOUNTING_SERVERS_OBJ.RADIUS,
  ACCOUNTING_SERVERS_OBJ.TACACS_PLUS,
  ACCOUNTING_SERVERS_OBJ.NONE_TYPE
]

const defaultFormData = {
  authnEnabledSsh: false,
  authnEnableTelnet: false,
  authzEnabledCommand: false,
  authzEnabledExec: false,
  acctEnabledCommand: false,
  acctEnabledExec: false,
  selectedLoginServers: [] as AAA_SERVER_TYPE[],
  selectedCommandAuthOrder: [] as AAA_SERVER_TYPE[],
  selectedExecAuthOrder: [] as AAA_SERVER_TYPE[],
  selectedCommandAcctOrder: [] as AAA_SERVER_TYPE[],
  selectedExecAcctOrder: [] as AAA_SERVER_TYPE[],
  authzCommonsLevel: 'READ_ONLY',
  acctCommonsLevel: 'READ_ONLY'
}

export function AAASettings () {
  const { tenantId, venueId } = useParams()
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  const serverLevelItem = [{
    value: 'PORT_CONFIG',
    label: $t({ defaultMessage: 'Port Config' })
  }, {
    value: 'READ_ONLY',
    label: $t({ defaultMessage: 'Read Only' })
  }, {
    value: 'READ_WRITE',
    label: $t({ defaultMessage: 'Read Write' })
  }]

  SERVERS_OBJ.RADIUS.name = $t({ defaultMessage: 'RADIUS Servers' })
  SERVERS_OBJ.TACACS_PLUS.name = $t({ defaultMessage: 'TACACS+ Servers' })
  SERVERS_OBJ.LOCAL.name = $t({ defaultMessage: 'Local Users' })
  AUTHEN_SERVERS_OBJ.NONE_TYPE.name = $t({ defaultMessage: 'No Authentication' })
  AUTHOR_SERVERS_OBJ.NONE_TYPE.name = $t({ defaultMessage: 'No Authorization' })
  ACCOUNTING_SERVERS_OBJ.NONE_TYPE.name = $t({ defaultMessage: 'No Accounting' })

  const defaultPayload = {
    venueId,
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const radiusTableQuery = useTableQuery({
    useQuery: useVenueSwitchAAAServerListQuery,
    defaultPayload: { ...defaultPayload, serverType: AAAServerTypeEnum.RADIUS },
    pagination: {
      pageSize: 5
    }
  })

  const tacasTableQuery = useTableQuery({
    useQuery: useVenueSwitchAAAServerListQuery,
    defaultPayload: { ...defaultPayload, serverType: AAAServerTypeEnum.TACACS },
    pagination: {
      pageSize: 5
    }
  })

  const { data: aaaSetting, isFetching, isLoading } = useGetAaaSettingQuery({ params: { tenantId, venueId } })

  const [ availableLoginServers, setAvailableLoginServers] = useState(defaultAvailableLoginServers)
  const [ availableCommandAuthOrder, setAvailableCommandAuthOrder] = useState(defaultAvailableCommandAuthOrder)
  const [ availableExecAuthOrder, setAvailableExecAuthOrder] = useState(defaultAvailableExecAuthOrder)
  const [ availableCommandAcctOrder, setAvailableCommandAcctOrder] = useState(defaultAvailableCommandAcctOrder)
  const [ availableExecAcctOrder, setAvailableExecAcctOrder] = useState(defaultAvailableExecAcctOrder)

  useEffect(() => {
    if (radiusTableQuery.data && tacasTableQuery.data) {
      const hasRadius = radiusTableQuery.data.totalCount > 0
      const hasTacacs = tacasTableQuery.data.totalCount > 0

      const filterOutFn = (servers: TransferItem[]) => {
        return servers
          .filter(server => hasRadius || server.key !== AAA_SERVER_TYPE.RADIUS)
          .filter(server => hasTacacs || server.key !== AAA_SERVER_TYPE.TACACS)
      }

      setAvailableLoginServers(filterOutFn(defaultAvailableLoginServers))
      setAvailableCommandAuthOrder(filterOutFn(defaultAvailableCommandAuthOrder))
      setAvailableExecAuthOrder(filterOutFn(defaultAvailableExecAuthOrder))
      setAvailableCommandAcctOrder(filterOutFn(defaultAvailableCommandAcctOrder))
      setAvailableExecAcctOrder(filterOutFn(defaultAvailableExecAcctOrder))
    }
  }, [radiusTableQuery.data, tacasTableQuery.data])

  useEffect(() => {
    if (aaaSetting) {
      let initData = { ...defaultFormData, ...aaaSetting }

      initData.selectedLoginServers = []
      aaaSetting.authnFirstPref && initData.selectedLoginServers.push(AUTHEN_SERVERS_OBJ[aaaSetting.authnFirstPref].key)
      aaaSetting.authnSecondPref && initData.selectedLoginServers.push(AUTHEN_SERVERS_OBJ[aaaSetting.authnSecondPref].key)
      aaaSetting.authnThirdPref && initData.selectedLoginServers.push(AUTHEN_SERVERS_OBJ[aaaSetting.authnThirdPref].key)
      aaaSetting.authnFourthPref && initData.selectedLoginServers.push(AUTHEN_SERVERS_OBJ[aaaSetting.authnFourthPref].key)

      initData.selectedCommandAuthOrder = []
      aaaSetting.authzCommonsFirstServer && initData.selectedCommandAuthOrder.push(AUTHOR_SERVERS_OBJ[aaaSetting.authzCommonsFirstServer].key)
      aaaSetting.authzCommonsSecondServer && initData.selectedCommandAuthOrder.push(AUTHOR_SERVERS_OBJ[aaaSetting.authzCommonsSecondServer].key)
      aaaSetting.authzCommonsThirdServer && initData.selectedCommandAuthOrder.push(AUTHOR_SERVERS_OBJ[aaaSetting.authzCommonsThirdServer].key)

      initData.selectedExecAuthOrder = []
      aaaSetting.authzExecFirstServer && initData.selectedExecAuthOrder.push(AUTHOR_SERVERS_OBJ[aaaSetting.authzExecFirstServer].key)
      aaaSetting.authzExecSecondServer && initData.selectedExecAuthOrder.push(AUTHOR_SERVERS_OBJ[aaaSetting.authzExecSecondServer].key)
      aaaSetting.authzExecThirdServer && initData.selectedExecAuthOrder.push(AUTHOR_SERVERS_OBJ[aaaSetting.authzExecThirdServer].key)

      initData.selectedCommandAcctOrder = []
      aaaSetting.acctCommonsFirstServer && initData.selectedCommandAcctOrder.push(ACCOUNTING_SERVERS_OBJ[aaaSetting.acctCommonsFirstServer].key)
      aaaSetting.acctCommonsSecondServer && initData.selectedCommandAcctOrder.push(ACCOUNTING_SERVERS_OBJ[aaaSetting.acctCommonsSecondServer].key)
      aaaSetting.acctCommonsThirdServer && initData.selectedCommandAcctOrder.push(ACCOUNTING_SERVERS_OBJ[aaaSetting.acctCommonsThirdServer].key)

      initData.selectedExecAcctOrder = []
      aaaSetting.acctExecFirstServer && initData.selectedExecAcctOrder.push(ACCOUNTING_SERVERS_OBJ[aaaSetting.acctExecFirstServer].key)
      aaaSetting.acctExecSecondServer && initData.selectedExecAcctOrder.push(ACCOUNTING_SERVERS_OBJ[aaaSetting.acctExecSecondServer].key)
      aaaSetting.acctExecThirdServer && initData.selectedExecAcctOrder.push(ACCOUNTING_SERVERS_OBJ[aaaSetting.acctExecThirdServer].key)

      form.setFieldsValue(initData)
    }
  }, [form, aaaSetting])

  const authnEnabledSsh = Form.useWatch('authnEnabledSsh')
  const authnEnableTelnet = Form.useWatch('authnEnableTelnet')
  const authzEnabledCommand = Form.useWatch('authzEnabledCommand')
  const authzEnabledExec = Form.useWatch('authzEnabledExec')
  const acctEnabledCommand = Form.useWatch('acctEnabledCommand')
  const acctEnabledExec = Form.useWatch('acctEnabledExec')

  const [openConfirm, setOpenConfirm] = useState(false)

  const defaultFieldSetProps = {
    style: { marginBottom: '20px', width: '840px' },
    switchStyle: { display: 'none', cursor: 'default' },
    checked: true
  }

  const defaultTransferProps = {
    titles: [$t({ defaultMessage: 'Available Servers' }), $t({ defaultMessage: 'Selected order' })],
    showSelectAll: false,
    listStyle: {
      width: 300,
      height: 172
    },
    render: (item: TransferItem) => item.name,
    onChange: (targetKeys: string[]) => {
      if (targetKeys.indexOf(AAA_SERVER_TYPE.NONE) >= 0) {
        _.pull(targetKeys, AAA_SERVER_TYPE.NONE)
        targetKeys.push(AAA_SERVER_TYPE.NONE) // Move NONE to the end
      }
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    const currentAuthnEnabledSsh = form.getFieldValue('authnEnabledSsh')
    if (newOpen === false) {
      setOpenConfirm(false)
      if (currentAuthnEnabledSsh === false) {
        form.setFieldValue('authnEnableTelnet', false)
      }
      return
    }
    if (currentAuthnEnabledSsh === true) {
      form.setFieldValue('authnEnableTelnet', !authnEnableTelnet)
    } else {
      setOpenConfirm(true)
    }
  }

  const orderValidator = (targetKeys: string[], serverObjNone: { name: string }) => {
    if (targetKeys.indexOf(AAA_SERVER_TYPE.NONE) === 0) {
      return Promise.reject($t({ defaultMessage: '"{name}" cannot be saved as first option.' }, serverObjNone))
    }
    return Promise.resolve()
  }

  return (
    <Loader states={[{ isLoading, isFetching }]}>
      <Fieldset {...defaultFieldSetProps} label={$t({ defaultMessage: 'Log-in Authentication' })} >
        <Form.Item
          name='authnEnabledSsh'
          label={$t({ defaultMessage: 'SSH Authentication' })}
          valuePropName='checked'
        >
          <Switch disabled={authnEnableTelnet}/>
        </Form.Item>
        <Popconfirm
          title={$t({ defaultMessage: 'Telnet Authentication requires SSH Authentication also to be turned ON.' })}
          placement='bottomLeft'
          visible={openConfirm}
          onVisibleChange={handleOpenChange}
          onConfirm={() => {
            setOpenConfirm(false)
            form.setFieldValue('authnEnabledSsh', true)
          }}
        >
          <Form.Item
            name='authnEnableTelnet'
            label={$t({ defaultMessage: 'Telnet Authentication' })}
            valuePropName='checked'
          >
            <Switch />
          </Form.Item>
        </Popconfirm>
        { authnEnabledSsh &&
        <Form.Item
          name='selectedLoginServers'
          label={$t({ defaultMessage: 'Set Priority' })}
          valuePropName='targetKeys'
          rules={[
            { required: true, message: $t({ defaultMessage: 'The Selected Order must be configured.' }) },
            { validator: (_, value) => orderValidator(value, AUTHEN_SERVERS_OBJ.NONE_TYPE) }
          ]}
        >
          <Transfer
            {...defaultTransferProps}
            dataSource={availableLoginServers}
            titles={[$t({ defaultMessage: 'Available Servers & Users' }), $t({ defaultMessage: 'Selected order' })]}
          />
        </Form.Item>
        }
      </Fieldset>
      <Fieldset {...defaultFieldSetProps} label={$t({ defaultMessage: 'Authorization' })} >
        <Form.Item
          name='authzEnabledCommand'
          label={$t({ defaultMessage: 'Command Authorization' })}
          valuePropName='checked'
        >
          <Switch />
        </Form.Item>
        { authzEnabledCommand &&
        <>
          <Form.Item
            name='authzCommonsLevel'
            label={$t({ defaultMessage: 'Level' })}
          >
            <Select style={{ width: 128 }}
              options={serverLevelItem}
            />
          </Form.Item>
          <Form.Item
            name='selectedCommandAuthOrder'
            label={$t({ defaultMessage: 'Set Priority' })}
            valuePropName='targetKeys'
            rules={[
              { required: true, message: $t({ defaultMessage: 'The Selected Order must be configured.' }) },
              { validator: (_, value) => orderValidator(value, AUTHOR_SERVERS_OBJ.NONE_TYPE) }
            ]}
          >
            <Transfer
              {...defaultTransferProps}
              dataSource={availableCommandAuthOrder}
            />
          </Form.Item>
        </>
        }
        <Form.Item
          name='authzEnabledExec'
          label={$t({ defaultMessage: 'Executive Authorization' })}
          valuePropName='checked'
        >
          <Switch />
        </Form.Item>
        { authzEnabledExec &&
        <Form.Item
          name='selectedExecAuthOrder'
          label={$t({ defaultMessage: 'Set Priority' })}
          valuePropName='targetKeys'
          rules={[
            { required: true, message: $t({ defaultMessage: 'The Selected Order must be configured.' }) },
            { validator: (_, value) => orderValidator(value, AUTHOR_SERVERS_OBJ.NONE_TYPE) }
          ]}
        >
          <Transfer
            {...defaultTransferProps}
            dataSource={availableExecAuthOrder}
          />
        </Form.Item>
        }
      </Fieldset>
      <Fieldset {...defaultFieldSetProps} label={$t({ defaultMessage: 'Accounting' })} >
        <Form.Item
          name='acctEnabledCommand'
          label={$t({ defaultMessage: 'Command Accounting' })}
          valuePropName='checked'
        >
          <Switch />
        </Form.Item>
        { acctEnabledCommand &&
        <>
          <Form.Item
            name='acctCommonsLevel'
            label={$t({ defaultMessage: 'Level' })}
          >
            <Select style={{ width: 128 }}
              options={serverLevelItem}
            />
          </Form.Item>
          <Form.Item
            name='selectedCommandAcctOrder'
            label={$t({ defaultMessage: 'Set Priority' })}
            valuePropName='targetKeys'
            rules={[
              { required: true, message: $t({ defaultMessage: 'The Selected Order must be configured.' }) },
              { validator: (_, value) => orderValidator(value, ACCOUNTING_SERVERS_OBJ.NONE_TYPE) }
            ]}
          >
            <Transfer
              {...defaultTransferProps}
              dataSource={availableCommandAcctOrder}
            />
          </Form.Item>
        </>
        }
        <Form.Item
          name='acctEnabledExec'
          label={$t({ defaultMessage: 'Executive Accounting' })}
          valuePropName='checked'
        >
          <Switch />
        </Form.Item>
        { acctEnabledExec &&
        <Form.Item
          name='selectedExecAcctOrder'
          label={$t({ defaultMessage: 'Set Priority' })}
          valuePropName='targetKeys'
          rules={[
            { required: true, message: $t({ defaultMessage: 'The Selected Order must be configured.' }) },
            { validator: (_, value) => orderValidator(value, ACCOUNTING_SERVERS_OBJ.NONE_TYPE) }
          ]}
        >
          <Transfer
            {...defaultTransferProps}
            dataSource={availableExecAcctOrder}
          />
        </Form.Item>
        }
      </Fieldset>
    </Loader>
  )
}