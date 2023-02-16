import { useRef, useEffect } from 'react'

import { Col, Divider, Row, Space, Typography } from 'antd'
import { useIntl }                              from 'react-intl'

import { Descriptions, StepsForm }       from '@acx-ui/components'
import { CodeMirrorWidget }              from '@acx-ui/rc/components'
import { CliConfiguration, VenueDetail } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export function CliStepSummary (props: {
  data: CliConfiguration
}) {
  const { $t } = useIntl()
  const { data } = props

  const codeMirrorEl = useRef(null as unknown as {
    setValue: Function,
  })

  useEffect(() => {
    codeMirrorEl?.current?.setValue(data?.cli || '')
  }, [data])

  return <>
    <Row gutter={24}>
      <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>
    </Row>
    <Row>
      <Col span={6}>
        <Descriptions labelWidthPercent={100} layout='vertical'>
          <Descriptions.Item
            label={$t({ defaultMessage: 'Profile Name' })}
            children={data.name} />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Switch Models' })}
            children={data?.models?.map(m => //////////
              <Space key={m} style={{ display: 'flex' }}>{m}</Space>
            )}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Venues to apply' })}
            children={(data?.venues as unknown as VenueDetail[])?.map(v => /////
              <Space key={v.id} style={{ display: 'flex' }}>{(v?.name) || ''}</Space>
            )}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Override existing configuration' })}
            children={data?.overwrite
              ? $t({ defaultMessage: 'ON' })
              : $t({ defaultMessage: 'OFF' })
            } />
        </Descriptions>
      </Col>
      <Col span={1} style={{ maxWidth: '24px' }}>
        <Divider type='vertical' style={{ height: '100%' }} />
      </Col>
      <Col span={13}>
        <Typography.Text style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>
          {$t({ defaultMessage: 'CLI Confugurations' })}
        </Typography.Text>
        <UI.CodeMirrorContainer>
          <CodeMirrorWidget
            ref={codeMirrorEl}
            containerId='previewContainerId'
            type='cli'
            size={{
              height: '450px',
              width: '100%'
            }}
            data={{
              clis: '',
              configOptions: {
                readOnly: true
              }
            }}
          />
        </UI.CodeMirrorContainer>
      </Col>
    </Row>
  </>
}