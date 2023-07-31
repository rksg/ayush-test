import { useEffect, useState } from 'react'

import { Row, Col, Form, Input } from 'antd'
import TextArea                  from 'antd/lib/input/TextArea'
import _                         from 'lodash'
import { useIntl }               from 'react-intl'
import { useParams }             from 'react-router-dom'

import { Button, Loader, Tooltip }   from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { useGetTroubleshootingQuery,
  useLazyGetTroubleshootingCleanQuery,
  usePingMutation }                             from '@acx-ui/rc/services'
import { targetHostRegExp,
  TroubleshootingType,
  WifiTroubleshootingMessages } from '@acx-ui/rc/utils'

export function SwitchPingForm () {
  const { $t } = useIntl()
  const { tenantId, switchId } = useParams()
  const [pingForm] = Form.useForm()

  const [isValid, setIsValid] = useState(false)
  const [lasySyncTime, setLastSyncTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const troubleshootingParams = {
    tenantId,
    switchId,
    troubleshootingType: TroubleshootingType.PING
  }

  const [runMutation] = usePingMutation()
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

  }, [getTroubleshooting, getTroubleshooting.data])

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
    setIsValid(false)
    await getTroubleshootingClean({
      params: troubleshootingParams
    })
    refetchResult()
  }

  const onCopy = async () => {
    const response = pingForm.getFieldValue('result')
    navigator.clipboard.writeText(response)
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

  return <Form
    form={pingForm}
    layout='vertical'
    onChange={onChangeForm}
  >
    <Row gutter={20}>
      <Col span={8}>
        <Form.Item
          name='targetHost'
          label={<>
            {$t({ defaultMessage: 'Target host or IP address' })}
            <Tooltip.Question
              title={$t(WifiTroubleshootingMessages.Target_Host_IP_TOOLTIP)}
              placement='bottom'
            />
          </>}
          rules={[
            { required: true },
            { validator: (_, value) => targetHostRegExp(value) }
          ]}
          validateFirst
          // hasFeedback
          children={<Input disabled={isLoading}/>}
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
