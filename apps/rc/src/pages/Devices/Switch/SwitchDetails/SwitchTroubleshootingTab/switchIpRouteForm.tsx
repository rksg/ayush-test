import { useEffect, useState } from 'react'

import { Row, Col, Form } from 'antd'
import TextArea           from 'antd/lib/input/TextArea'
import _                  from 'lodash'
import { useIntl }        from 'react-intl'
import { useParams }      from 'react-router-dom'

import { Button, Loader }               from '@acx-ui/components'
import { DateFormatEnum, formatter }    from '@acx-ui/formatter'
import {
  useGetTroubleshootingQuery,
  useIpRouteMutation,
  useLazyGetTroubleshootingCleanQuery
} from '@acx-ui/rc/services'
import {
  TroubleshootingType
} from '@acx-ui/rc/utils'

export function SwitchIpRouteForm () {
  const { $t } = useIntl()
  const { tenantId, switchId } = useParams()
  const [form] = Form.useForm()

  const [lasySyncTime, setLastSyncTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const troubleshootingParams = {
    tenantId,
    switchId,
    troubleshootingType: TroubleshootingType.ROUTE_TABLE
  }

  const [runMutation] = useIpRouteMutation()
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
    return response === 'EMPTY_RESULT' ? $t({ defaultMessage: 'No data to display.' }) : response
  }

  useEffect(() => {
    if (getTroubleshooting.data?.response) {
      const response = getTroubleshooting.data.response
      setIsLoading(response.syncing)

      if (response.syncing) {
        refetchResult()
      }

      setLastSyncTime(response.latestResultResponseTime)
      form.setFieldValue('result', parseResult(response.result))
    }

  }, [getTroubleshooting.data])

  const onSubmit = async () => {
    setIsLoading(true)
    try {
      const result = await runMutation({ params: { tenantId, switchId },
        payload: { troubleshootingType: 'route-table' } }).unwrap()
      if (result) {
        refetchResult()
      }
    } catch (error) {
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

  return <Form
    form={form}
    layout='vertical'
  >
    <Row gutter={20}>
      <Col span={8}>
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
            disabled={isLoading}
            onClick={onSubmit}>
            {$t({ defaultMessage: 'Show Route' })}
          </Button>
        </Form.Item>
      </Col>
    </Row>
    <Loader states={[{
      isLoading: false,
      isFetching: isLoading
    }]}>
      <Form.Item
        style={{ marginBottom: '5px' }}
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
