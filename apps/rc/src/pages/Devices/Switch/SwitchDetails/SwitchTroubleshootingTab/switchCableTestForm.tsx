import { useContext, useEffect, useState } from 'react'

import { Row, Col, Form, Tooltip } from 'antd'
import { DefaultOptionType }       from 'antd/lib/select'
import _                           from 'lodash'
import { useIntl }                 from 'react-intl'
import { useParams }               from 'react-router-dom'

import { Button, Loader, Select, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                    from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                 from '@acx-ui/formatter'
import { useGetTroubleshootingQuery,
  useLazyGetTroubleshootingCleanQuery,
  usePingMutation,
  useSwitchPortlistQuery }                             from '@acx-ui/rc/services'
import { SwitchPortViewModelQueryFields, TroubleshootingType, sortPortFunction } from '@acx-ui/rc/utils'
import { getIntl }                                                               from '@acx-ui/utils'

import { SwitchDetailsContext } from '..'

import * as UI from './styledComponents'

interface CableTestTable {
  port: string
  speed: string
  status: string
  pairA: string
  pairB: string
  pairC: string
  pairD: string
}

export const parseResult = function (response: string) {
  const { $t } = getIntl()
  return response === 'EMPTY_RESULT' ? $t({ defaultMessage: 'No data to display.' }) : response
}

export function SwitchCableTestForm () {
  const { $t } = useIntl()
  const { tenantId, switchId, serialNumber } = useParams()
  const { switchDetailsContextData } = useContext(SwitchDetailsContext)
  const [pingForm] = Form.useForm()

  const [isValid, setIsValid] = useState(false)
  const [lasySyncTime, setLastSyncTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [portOptions, setPortOptions] = useState([] as DefaultOptionType[])

  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const troubleshootingParams = {
    tenantId,
    switchId,
    troubleshootingType: TroubleshootingType.PING,
    venueId: switchDetailsContextData.switchDetailHeader?.venueId
  }

  const [runMutation] = usePingMutation()
  const [getTroubleshootingClean] = useLazyGetTroubleshootingCleanQuery()
  const getTroubleshooting =
    useGetTroubleshootingQuery({
      params: troubleshootingParams,
      enableRbac: isSwitchRbacEnabled
    }, {
      skip: !switchDetailsContextData.switchDetailHeader?.venueId
    })

  const portPayload = {
    page: 1,
    pageSize: 10000,
    filters: { switchId: [serialNumber] },
    sortField: 'portIdentifierFormatted',
    sortOrder: 'ASC',
    fields: SwitchPortViewModelQueryFields
  }
  const portList = useSwitchPortlistQuery({
    params: { tenantId },
    payload: portPayload,
    enableRbac: isSwitchRbacEnabled
  })

  const refetchResult = function () {
    setTimeout(() => {
      getTroubleshooting.refetch()
    }, 3000)
  }

  useEffect(() => {
    if (getTroubleshooting.data?.response) {
      const response = getTroubleshooting.data.response
      setIsLoading(response.syncing)

      if(response.syncing) {
        refetchResult()
      }

      pingForm.setFieldValue('targetHost', response.pingIp)
      setLastSyncTime(response.latestResultResponseTime)
      pingForm.setFieldValue('result', parseResult(response.result))

      if (response.latestResultResponseTime) {
        setIsValid(true)
      }
      if (!response.pingIp) {
        setIsValid(false)
      }
    }

  }, [getTroubleshooting])

  useEffect(() => {
    if (!portList.isLoading) {
      setPortOptions([
        { label: $t({ defaultMessage: 'Select Port...' }), value: null },
        ...(portList?.data?.data?.map(port => ({
          id: port.portIdentifier,
          label: port.portIdentifier,
          disabled: port.portSpeed === 'AUTO'
        }))
          .sort(sortPortFunction)
          .map(item => ({
            label: item.label, value: item.id, disabled: true
          }))
      ?? [])
      ])
    }
  }, [portList])

  const onSubmit = async () => {
    setIsLoading(true)
    try {
      const payload = {
        targetHost: pingForm.getFieldValue('targetHost'),
        troubleshootingPayload: {
          targetHost: pingForm.getFieldValue('targetHost')
        },
        troubleshootingType: 'ping'
      }
      const result = await runMutation({
        params: {
          tenantId,
          switchId,
          venueId: switchDetailsContextData.switchDetailHeader?.venueId
        },
        payload,
        enableRbac: isSwitchRbacEnabled
      }).unwrap()
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
    setIsValid(false)
    await getTroubleshootingClean({
      params: troubleshootingParams,
      enableRbac: isSwitchRbacEnabled
    })
    refetchResult()
  }

  const onChangeForm = function () {
    pingForm.validateFields()
      .then(() => {
        setIsValid(true)
      })
      .catch(() => {
        setIsValid(false)
      })
  }

  const columns: TableProps<CableTestTable>['columns'] = [
    {
      title: $t({ defaultMessage: 'Port' }),
      key: 'port',
      dataIndex: 'port'
    },
    {
      title: $t({ defaultMessage: 'Speed' }),
      key: 'speed',
      dataIndex: 'speed'
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status'
    },
    {
      title: $t({ defaultMessage: 'Pair A' }),
      key: 'pair1',
      dataIndex: 'pair1'
    },
    {
      title: $t({ defaultMessage: 'Pair B' }),
      key: 'pair2',
      dataIndex: 'pair2'
    },
    {
      title: $t({ defaultMessage: 'Pair C' }),
      key: 'pair3',
      dataIndex: 'pair3'
    },
    {
      title: $t({ defaultMessage: 'Pair D' }),
      key: 'pair4',
      dataIndex: 'pair4'
    }
  ]

  return <Form
    form={pingForm}
    layout='vertical'
    onChange={onChangeForm}
  >
    <Row gutter={20}>
      <Col span={8}>
        <Form.Item
          name='port'
          label={<>{$t({ defaultMessage: 'Port' })}</>}
          rules={[
            { required: true }
          ]}
          children={<Select
            defaultValue={null}
            showSearch
            // onChange={onPortChange}
            dropdownMatchSelectWidth={false}
            allowClear>
            {
              portOptions.map(({ label, value, disabled }) =>
                (<Select.Option value={value}
                  key={value}
                  disabled={disabled}
                  children={
                    <>{
                      disabled ? <Tooltip
                        // eslint-disable-next-line max-len
                        title={$t({ defaultMessage: 'To execute the cable test, port speed must be set to “Auto”' })}>
                        <span>{label}</span></Tooltip> : <>{label}</>
                    }</>}
                />))
            }
          </Select>
          }
        />
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
            {$t({ defaultMessage: 'Run' })}
          </Button>
        </Form.Item>
      </Col>
    </Row>
    <UI.ResultContainer>
      <Loader states={[{
        isLoading: false,
        isFetching: isLoading
      }]}>
        <Table columns={columns} style={{ margin: '10px' }}/>
      </Loader>
    </UI.ResultContainer>
  </Form>
}
