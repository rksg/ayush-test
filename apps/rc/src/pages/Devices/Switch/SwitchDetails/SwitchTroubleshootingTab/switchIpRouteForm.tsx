import { useContext, useEffect, useState } from 'react'

import { Row, Col, Form } from 'antd'
import TextArea           from 'antd/lib/input/TextArea'
import _                  from 'lodash'
import { useIntl }        from 'react-intl'
import { useParams }      from 'react-router-dom'

import { Button, Loader }                from '@acx-ui/components'
import { useIsSplitOn, Features }        from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }     from '@acx-ui/formatter'
import {
  useGetTroubleshootingQuery,
  useIpRouteMutation,
  useLazyGetTroubleshootingCleanQuery
} from '@acx-ui/rc/services'
import {
  TroubleshootingType
} from '@acx-ui/rc/utils'

import { SwitchDetailsContext } from '..'

import { parseResult } from './switchPingForm'

export function SwitchIpRouteForm () {
  const { $t } = useIntl()
  const { tenantId, switchId } = useParams()
  const { switchDetailsContextData } = useContext(SwitchDetailsContext)
  const [form] = Form.useForm()

  const [lasySyncTime, setLastSyncTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const troubleshootingParams = {
    tenantId,
    switchId,
    troubleshootingType: TroubleshootingType.ROUTE_TABLE,
    venueId: switchDetailsContextData.switchDetailHeader?.venueId
  }

  const [runMutation] = useIpRouteMutation()
  const [getTroubleshootingClean] = useLazyGetTroubleshootingCleanQuery()
  const getTroubleshooting =
    useGetTroubleshootingQuery({
      params: troubleshootingParams,
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

      if (response.syncing) {
        refetchResult()
      }

      setLastSyncTime(response.latestResultResponseTime)
      form.setFieldValue('result', parseResult(response.result))
    }

  }, [getTroubleshooting])

  const onSubmit = async () => {
    setIsLoading(true)
    try {
      const result = await runMutation({
        params: {
          tenantId,
          switchId,
          venueId: switchDetailsContextData.switchDetailHeader?.venueId
        },
        payload: { troubleshootingType: 'route-table' },
        enableRbac: isSwitchRbacEnabled
      }).unwrap()
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
      params: troubleshootingParams,
      enableRbac: isSwitchRbacEnabled
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
