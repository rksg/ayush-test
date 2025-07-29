/* eslint-disable max-len */
import { useContext, useEffect, useState } from 'react'

import { Row, Col, Form }    from 'antd'
import TextArea              from 'antd/lib/input/TextArea'
import { DefaultOptionType } from 'antd/lib/select'
import _                     from 'lodash'
import { useIntl }           from 'react-intl'
import { useParams }         from 'react-router-dom'

import { Button, Loader, Select, showActionModal, StatusPill, Table, TableProps, Tooltip } from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                       from '@acx-ui/formatter'
import {
  useCableTestMutation,
  useGetTroubleshootingQuery,
  useLazyGetTroubleshootingCleanQuery,
  useSwitchPortlistQuery
}                             from '@acx-ui/rc/services'
import {
  sortPortFunction
} from '@acx-ui/rc/switch/utils'
import { SwitchPortViewModelQueryFields, TroubleshootingType, SwitchPortViewModel, CableTestTable } from '@acx-ui/rc/utils'
import { getIntl }                                                                                  from '@acx-ui/utils'

import { SwitchDetailsContext } from '..'

import * as UI from './styledComponents'


export const parseResult = function (response: string) {
  const { $t } = getIntl()
  return response === 'EMPTY_RESULT' ? $t({ defaultMessage: 'No data to display.' }) : response
}

export function SwitchCableTestForm () {
  const { $t } = useIntl()
  const { tenantId, switchId, serialNumber } = useParams()
  const { switchDetailsContextData } = useContext(SwitchDetailsContext)
  const [cableTestForm] = Form.useForm()

  const [isValid, setIsValid] = useState(false)
  const [tableData, setTableData] = useState([] as CableTestTable[])
  const [lasySyncTime, setLastSyncTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isNoData, setIsNoData] = useState(false)
  const [clearPort, setClearPort] = useState(false)
  const [portOptions, setPortOptions] = useState([] as DefaultOptionType[])

  const troubleshootingParams = {
    tenantId,
    switchId,
    troubleshootingType: TroubleshootingType.CABLE_TEST,
    venueId: switchDetailsContextData.switchDetailHeader?.venueId
  }

  const [runMutation] = useCableTestMutation()
  const [getTroubleshootingClean] = useLazyGetTroubleshootingCleanQuery()
  const getTroubleshooting =
    useGetTroubleshootingQuery({
      params: troubleshootingParams,
      enableRbac: true
    }, {
      skip: !switchDetailsContextData.switchDetailHeader?.venueId
    })

  const portPayload = {
    page: 1,
    pageSize: 10000,
    filters: { switchId: [serialNumber] },
    sortField: 'portIdentifierFormatted',
    sortOrder: 'ASC',
    fields: [...SwitchPortViewModelQueryFields, 'portSpeedConfig', 'portConnectorType']
  }
  const portList = useSwitchPortlistQuery({
    params: { tenantId },
    payload: portPayload,
    enableRbac: true
  })

  const getPortDisabled = (port: SwitchPortViewModel) => {
    return port.portSpeedConfig !== 'AUTO' || port.adminStatus !== 'Up' || port.portConnectorType !== 'COPPER'
  }

  const TOOLTIPS= {
    auto: $t({ defaultMessage: 'To execute the cable test, port speed must be set to “Auto”' }),
    up: $t({ defaultMessage: 'To execute the cable test, the port must be UP' }),
    copper: $t({ defaultMessage: 'This test can only be executed on Copper ports. Fiber ports are not supported' })
  }

  const getPortDisabledTooltip = (port: SwitchPortViewModel) => {
    const t = []
    if(port.portSpeedConfig !== 'AUTO') {
      t.push(TOOLTIPS.auto)
    }
    if(port.adminStatus !== 'Up') {
      t.push(TOOLTIPS.up)
    }
    if(port.portConnectorType !== 'COPPER') {
      t.push(TOOLTIPS.copper)
    }

    if(t.length == 1) {
      return <span>{t[0]}</span>
    }else {
      return <ul>{t.map(i => <li key={port.portIdentifier + i}>{i}</li>)}</ul>
    }
  }

  const refetchResult = function () {
    setTimeout(() => {
      getTroubleshooting.refetch()
    }, 3000)
  }

  const reportMap: { [key:string]: string } = {
    'OK': $t({ defaultMessage: 'All Pairs are terminated properly.' }),
    'Open': $t({ defaultMessage: 'One or more pairs are Open. Re-run the test to be sure and if the result is the same, try connecting the cable properly. If it still shows up as ‘Open’, replace the cable.' }),
    'Same Pair Short': $t({ defaultMessage: 'Same pair short detected. Re run the test to be sure and if the result is the same, replace the cable.' }),
    'Cross Pair Short': $t({ defaultMessage: 'Cross pair short detected. Re run the test to be sure and if the result is the same, replace the cable.' }),
    'Failed': $t({ defaultMessage: 'The test failed on the highlighted pairs above. Run the test again.' }),
    'Unknown': $t({ defaultMessage: 'An unknown error has occurred during the test and the cable health could not be determined. Re-run the test and if the fail again, replace the cable.' })
  }

  useEffect(() => {
    if (getTroubleshooting.data?.response) {
      const response = getTroubleshooting.data.response
      setIsLoading(response.syncing)
      if(response.syncing) {
        refetchResult()
      }
      if(response.cableTestResult) {
        setTableData([response.cableTestResult] as CableTestTable[])
        cableTestForm.setFieldValue('port', response.cableTestResult.port)
      } else {
        setTableData([])
        setIsValid(false)
        if(clearPort){
          cableTestForm.setFieldValue('port', null)
        }
      }
      setLastSyncTime(response.latestResultResponseTime)
      cableTestForm.setFieldValue('result', parseResult(response.result))
      setIsNoData(response.result === 'EMPTY_RESULT')

      if (response.latestResultResponseTime) {
        setIsValid(true)
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
          value: port.portIdentifier,
          disabled: getPortDisabled(port),
          tooltip: getPortDisabledTooltip(port)
        }))
          .sort(sortPortFunction)
      ?? [])
      ])
    }
  }, [portList])

  const onModal = () => {
    showActionModal({
      type: 'warning',
      width: 400,
      title: $t({ defaultMessage: 'Proceed Cable Test?' }),
      content: <p>
        {$t({ defaultMessage: `
              This test might result in the adjacent ports flapping causing network disruption as a result.
              {p} Do you want to proceed?` }, {
          p: <p />
        })}
      </p>,
      customContent: {
        action: 'CUSTOM_BUTTONS',
        buttons: [
          {
            text: $t({ defaultMessage: 'Cancel' }),
            type: 'default',
            key: 'cancel'
          },
          {
            text: $t({ defaultMessage: 'Yes' }),
            type: 'primary',
            key: 'ok',
            closeAfterAction: true,
            handler: async () => {
              try{
                onSubmit()
              } catch (error) {
                console.log(error) // eslint-disable-line no-console
              }
            }
          }
        ]
      }
    })
  }

  const onSubmit = async () => {
    setIsLoading(true)
    setClearPort(false)
    try {
      const payload = {
        targetPort: cableTestForm.getFieldValue('port'),
        troubleshootingPayload: {
          targetPort: cableTestForm.getFieldValue('port')
        },
        troubleshootingType: 'cable-test'
      }
      const result = await runMutation({
        params: {
          tenantId,
          switchId,
          venueId: switchDetailsContextData.switchDetailHeader?.venueId
        },
        payload
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
    setClearPort(true)
    await getTroubleshootingClean({
      params: troubleshootingParams,
      enableRbac: true
    })
    refetchResult()
  }

  const onChangeForm = function () {
    cableTestForm.validateFields()
      .then(() => {
        setIsValid(true)
      })
      .catch(() => {
        setIsValid(false)
      })
  }

  const onCopy = async () => {
    const response = cableTestForm.getFieldValue('result')
    navigator.clipboard.writeText(response)
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      'OK': 'green',
      'Open': 'yellow',
      'Failed': 'yellow',
      'Unknown': 'yellow',
      'Same Pair Short': 'red',
      'Cross Pair Short': 'red'
    } as { [key:string]: string }
    return colorMap[status] || 'yellow'
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
      dataIndex: 'status',
      render: (_, row) => {
        return <StatusPill color={getStatusColor(row.overallStatus)} value={row.overallStatus} />
      }
    },
    {
      title: $t({ defaultMessage: 'Pair A' }),
      key: 'pairA',
      dataIndex: 'pairA',
      render: (_, row) => {
        return <StatusPill color={getStatusColor(row.pairAStatus)} value={row.pairAStatus} />
      }
    },
    {
      title: $t({ defaultMessage: 'Pair B' }),
      key: 'pairB',
      dataIndex: 'pairB',
      render: (_, row) => {
        return <StatusPill color={getStatusColor(row.pairBStatus)} value={row.pairBStatus} />
      }
    },
    {
      title: $t({ defaultMessage: 'Pair C' }),
      key: 'pairC',
      dataIndex: 'pairC',
      render: (_, row) => {
        return <StatusPill color={getStatusColor(row.pairCStatus)} value={row.pairCStatus} />
      }
    },
    {
      title: $t({ defaultMessage: 'Pair D' }),
      key: 'pairD',
      dataIndex: 'pairD',
      render: (_, row) => {
        return <StatusPill color={getStatusColor(row.pairDStatus)} value={row.pairDStatus} />
      }
    }
  ]

  return <Form
    form={cableTestForm}
    layout='vertical'
  >
    <Row gutter={20}>
      <Col span={8}>
        <Form.Item
          name='port'
          initialValue={null}
          label={<>{$t({ defaultMessage: 'Port' })}</>}
          rules={[
            { required: true }
          ]}
          children={<Select
            style={{ width: '200px' }}
            disabled={isLoading}
            showSearch
            onChange={onChangeForm}
            allowClear>
            {
              portOptions.map(({ label, value, disabled, tooltip }) =>
                (<Select.Option value={value}
                  key={value}
                  disabled={disabled}
                  children={
                    <>{
                      disabled ? <Tooltip
                        placement='right'
                        overlayStyle={{ maxWidth: '380px' }}
                        title={tooltip}>
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
            onClick={onModal}>
            {$t({ defaultMessage: 'Run Test' })}
          </Button>
        </Form.Item>
      </Col>
    </Row>
    <Loader states={[{
      isLoading: false,
      isFetching: isLoading
    }]}>
      {
        isNoData ? <Form.Item name='result'
          children={<TextArea
            style={{ resize: 'none', height: '300px', fontFamily: 'monospace' }}
            autoSize={false}
            readOnly={true}/>}
        />
          : <UI.ResultContainer>
            {
              tableData.length && tableData[0].port ? <>
                <Table
                  columns={columns}
                  dataSource={tableData}
                  rowKey='port'
                />
                <div className='report'>
                  <span className='title'>{$t({ defaultMessage: 'Report:' })}</span>
                  {reportMap[tableData[0].overallStatus]}
                </div>
              </> : null
            }
            <Form.Item name='result'
              hidden
              children={<TextArea/>}
            />
          </UI.ResultContainer>
      }
      <Button
        type='link'
        style={{ alignSelf: 'baseline' }}
        disabled={_.isEmpty(lasySyncTime) || isLoading}
        onClick={onCopy}
      >
        {$t({ defaultMessage: 'Copy CLI Output' })}
      </Button>
    </Loader>
  </Form>
}
