import { useEffect, useState } from 'react'

import { Row, Col, Form, Input, Select } from 'antd'
import TextArea                          from 'antd/lib/input/TextArea'
import { DefaultOptionType }             from 'antd/lib/select'
import _                                 from 'lodash'
import { useIntl }                       from 'react-intl'
import { useParams }                     from 'react-router-dom'

import { Button, Loader }            from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  useGetTroubleshootingQuery,
  useGetVlanListBySwitchLevelQuery,
  useLazyGetTroubleshootingCleanQuery,
  useMacAddressTableMutation,
  useSwitchPortlistQuery
} from '@acx-ui/rc/services'
import {
  sortPortFunction,
  TroubleshootingMacAddressOptionsEnum,
  TroubleshootingType
} from '@acx-ui/rc/utils'

export function SwitchMacAddressForm () {
  const { $t } = useIntl()
  const { tenantId, switchId } = useParams()
  const [form] = Form.useForm()

  const [isValid, setIsValid] = useState(true)
  const [lasySyncTime, setLastSyncTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [refineOption, setRefineOption] = useState(TroubleshootingMacAddressOptionsEnum.NONE)

  const portPayload = {
    fields: ['id', 'portIdentifier'],
    page: 1,
    pageSize: 10000,
    filters: { switchId: [switchId] },
    sortField: 'portIdentifier',
    sortOrder: 'ASC'
  }
  const vlanPayload = {
    sortField: 'vlanId',
    fields: ['vlanId'],
    sortOrder: 'ASC',
    page: 1,
    pageSize: 10000
  }
  const vlanList = useGetVlanListBySwitchLevelQuery({
    params: { tenantId, switchId },
    payload: vlanPayload
  })
  const portList = useSwitchPortlistQuery({ params: { tenantId }, payload: portPayload })
  const [portOptions, setPortOptions] = useState([] as DefaultOptionType[])
  const [vlanOptions, setVlanOptions] = useState([] as DefaultOptionType[])

  useEffect(() => {
    if (!portList.isLoading) {
      setPortOptions(portList?.data?.data?.map(port => ({ id: port.portIdentifier }))
        .sort(sortPortFunction)
        .map(item => ({
          label: item.id, value: item.id
        }))
      ?? [])
    }
  }, [portList])

  useEffect(() => {
    if (!vlanList.isLoading) {
      setVlanOptions(vlanList?.data?.data?.map(item => ({
        label: item.vlanId, value: item.vlanId
      })) ?? [])
    }
  }, [vlanList])

  const troubleshootingParams = {
    tenantId,
    switchId,
    troubleshootingType: TroubleshootingType.MAC_ADDRESS_TABLE
  }

  const [runMutation] = useMacAddressTableMutation()
  const [getTroubleshootingClean] = useLazyGetTroubleshootingCleanQuery()
  const getTroubleshooting =
    useGetTroubleshootingQuery({
      params: troubleshootingParams
    })

  const refetchResult = function () {
    setTimeout(() => {
      getTroubleshooting.refetch()
    }, 3000)
  }

  const parseResult = function (response: string) {
    if (response === 'EMPTY_RESULT') {
      return $t({ defaultMessage: 'No data to display.' })
    }

    try {
      const data = JSON.parse(response)
      let result = ''
      if (data.entry) {
        const dataEntry = data.entry
        result =
        `Total active entries from all ports = ${dataEntry.length}\nMAC-Address\t\tPort\t\tVLAN\t\n`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dataEntry.forEach((entry: any)=> {
          const port = entry.interface['interface-ref'].config.interface.split(' ')[1]
          result += `${entry['mac-address']}\t${port}\t\t${entry.vlan}\t\n`
        })
      }
      return result

    } catch (e) {
      if (response && response.includes('response is timeout')) {
        // eslint-disable-next-line max-len
        const noticeMessage = $t({ defaultMessage: ' Notice: This window displays up to 4500 MAC addresses learnt on the switch. If there are more then 5000 MAC-addresses learnt on the switch, access them by running \'show mac\' command on the remote CLI session.' })
        response += `\n\n${noticeMessage}`
      }
      return response
    }
  }

  useEffect(() => {
    if (getTroubleshooting.data?.response) {
      const response = getTroubleshooting.data.response
      setIsLoading(response.syncing)

      if (response.syncing) {
        refetchResult()
      }

      form.setFieldsValue({
        portIdentify: response.macAddressTablePortIdentify,
        vlanId: response.macAddressTableVlanId,
        macAddress: response.macAddressTableAddress,
        refineOption: response.macAddressTableType
      })

      setRefineOption(response.macAddressTableType || TroubleshootingMacAddressOptionsEnum.NONE)
      setLastSyncTime(response.latestResultResponseTime)
      form.setFieldValue('result', parseResult(response.result))

      if (response.latestResultResponseTime) {
        setIsValid(true)
      }
    }

  }, [getTroubleshooting.data])

  const onSubmit = async () => {
    setIsLoading(true)
    try {
      const macAddressTableType = form.getFieldValue('refineOption')
      let payload = {
        macAddressTableType: TroubleshootingMacAddressOptionsEnum.NONE,
        troubleshootingType: 'mac-address-table'
      } as {
        macAddressTableType: TroubleshootingMacAddressOptionsEnum,
        portIdentify?: string,
        vlanId?: string,
        macAddress?: string,
        troubleshootingType: string
        troubleshootingPayload?: object
      }

      switch(macAddressTableType) {
        case TroubleshootingMacAddressOptionsEnum.PORT:
          const portIdentify = form.getFieldValue('portIdentify')
          if (!_.isEmpty(portIdentify)) {
            payload.portIdentify = portIdentify
            payload.macAddressTableType = macAddressTableType
            payload.troubleshootingPayload = {
              portIdentify, macAddressTableType
            }
          }
          break
        case TroubleshootingMacAddressOptionsEnum.VLAN:
          const vlanId = form.getFieldValue('vlanId')
          if (!_.isEmpty(vlanId) || Number(vlanId) > 0) {
            payload.vlanId = vlanId
            payload.macAddressTableType = macAddressTableType
            payload.troubleshootingPayload = {
              vlanId, macAddressTableType
            }
          }
          break
        case TroubleshootingMacAddressOptionsEnum.MAC:
          const macAddress = form.getFieldValue('macAddress')
          if (!_.isEmpty(macAddress)) {
            payload.macAddress = macAddress
            payload.macAddressTableType = macAddressTableType
            payload.troubleshootingPayload = {
              macAddress, macAddressTableType
            }
          }
          break
      }

      const result = await runMutation({ params: { tenantId, switchId }, payload }).unwrap()
      if (result) {
        refetchResult()
      }
    } catch (error) {
      setIsValid(false)
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onClear = async () => {
    setIsLoading(true)
    await getTroubleshootingClean({
      params: troubleshootingParams
    })
    refetchResult()
  }

  const onCopy = async () => {
    const response = form.getFieldValue('result')
    navigator.clipboard.writeText(response)
  }

  const onChangeForm = function () {
    if (refineOption === TroubleshootingMacAddressOptionsEnum.MAC) {
      form.validateFields()
        .then(() => {
          setIsValid(true)
        })
        .catch(() => {
          setIsValid(false)
        })
    }
  }

  return <Form
    form={form}
    layout='vertical'
    onChange={onChangeForm}
  >
    <Row gutter={20}>
      <Col span={8}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '300px 300px',
            gridColumnGap: '30px'
          }}>
          <Form.Item
            initialValue={TroubleshootingMacAddressOptionsEnum.NONE}
            label={$t({ defaultMessage: 'Refine table by' })}
            name='refineOption'
          >
            <Select
              disabled={isLoading}
              options={[
                {
                  label: $t({ defaultMessage: 'Select...' }),
                  value: TroubleshootingMacAddressOptionsEnum.NONE
                },
                {
                  label: $t({ defaultMessage: 'Connected Port' }),
                  value: TroubleshootingMacAddressOptionsEnum.PORT
                },
                {
                  label: $t({ defaultMessage: 'VLAN' }),
                  value: TroubleshootingMacAddressOptionsEnum.VLAN
                },
                {
                  label: $t({ defaultMessage: 'MAC Address' }),
                  value: TroubleshootingMacAddressOptionsEnum.MAC
                }
              ]}
              onChange={async (value: TroubleshootingMacAddressOptionsEnum) => {
                setRefineOption(value)
              }}
            />

          </Form.Item>
          {refineOption === TroubleshootingMacAddressOptionsEnum.MAC &&
              <Form.Item
                label={' '}
                data-testid='inputMacAddress'
                name='macAddress'
                initialValue={''}
                rules={[
                  {
                    validator: (_, value) => {
                      // eslint-disable-next-line max-len
                      const re = new RegExp(/^(([0-9a-f]{2}\:){5}[0-9a-f]{2})$/)
                      if (value && !re.test(value)) {
                        return Promise.reject(
                          $t({ defaultMessage: 'Please enter valid MAC address' }))
                      }
                      return Promise.resolve()
                    }
                  }
                ]}
              >
                <Input
                  disabled={isLoading}
                  placeholder={$t({ defaultMessage: 'Enter MAC Address' })}
                />
              </Form.Item>
          }
          {refineOption === TroubleshootingMacAddressOptionsEnum.PORT &&
              <Form.Item
                label={' '}
                name='portIdentify'
                initialValue={''}
              >
                <Select
                  data-testid='selectPort'
                  disabled={isLoading}
                  options={[
                    { label: $t({ defaultMessage: 'Select Port...' }), value: '' },
                    ...portOptions
                  ]}
                />
              </Form.Item>
          }
          {refineOption === TroubleshootingMacAddressOptionsEnum.VLAN &&
              <Form.Item
                label={' '}
                name='vlanId'
                initialValue={''}
              >
                <Select
                  data-testid='selectVlan'
                  disabled={isLoading}
                  options={[
                    { label: $t({ defaultMessage: 'Select VLAN...' }), value: '' },
                    ...vlanOptions
                  ]}
                />
              </Form.Item>
          }
        </div>

        {!_.isEmpty(lasySyncTime) &&
          <Form.Item
            label={$t({ defaultMessage: 'Last synced at' })}
            children={
              formatter(DateFormatEnum.DateTimeFormatWithSeconds)(lasySyncTime)}
          />}

        <Form.Item wrapperCol={{ offset: 0, span: 16 }}
          style={{ alignItems: 'center' }}>
          <Button
            type='link'
            style={{ width: '50px', height: '32px', marginRight: '10px' }}
            disabled={_.isEmpty(lasySyncTime) || isLoading}
            onClick={onClear}
          >
            {$t({ defaultMessage: 'Clear' })}
          </Button>
          <Button
            type='primary'
            htmlType='submit'
            disabled={!isValid || isLoading}
            onClick={onSubmit}>
            {$t({ defaultMessage: 'Show Table' })}
          </Button>
        </Form.Item>
      </Col>
    </Row>
    <Loader states={[{
      isLoading: false,
      isFetching: isLoading
    }]}>
      <Form.Item
        name='result'>
        <TextArea
          style={{ resize: 'none', height: '300px', fontFamily: 'monospace' }}
          autoSize={false}
          readOnly={true}
        />
      </Form.Item>
      <Button
        type='link'
        style={{ alignSelf: 'baseline' }}
        disabled={_.isEmpty(lasySyncTime) || isLoading}
        onClick={onCopy}
      >
        {$t({ defaultMessage: 'Copy Output' })}
      </Button>
    </Loader>
  </Form>
}
