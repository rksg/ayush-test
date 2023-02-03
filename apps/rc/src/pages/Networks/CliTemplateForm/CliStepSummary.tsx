import { useState, useRef, useEffect } from 'react'

import { Col, Divider, Row, Typography } from 'antd'
import _                                 from 'lodash'
import { useIntl }                       from 'react-intl'

import { Descriptions, StepsForm } from '@acx-ui/components'
import { CodeMirrorWidget }        from '@acx-ui/rc/components'

import * as UI from './styledComponents'

export enum VariableType {
  ADDRESS = 'ADDRESS',
  RANGE = 'RANGE',
  STRING = 'STRING'
}

export interface Variable {
  name: string
  type: string
  value: string
}

export function CliStepSummary (props: {
  formRef?: any,
  data: any
}) {
  const { $t } = useIntl()
  const { data } = props
  const [switchCount, setSwitchCount] = useState(0)

  const codeMirrorEl = useRef(null as unknown as {
    setValue: Function,
  })

  useEffect(() => {
    const cli = data?.cli || data?.data?.cli
    const switches = Object.values(data?.venueSwitches ?? {}).flat()?.length ?? 0
    cli && codeMirrorEl?.current?.setValue(cli)
    setSwitchCount(switches)
  }, [data])

  return <>
    <Row gutter={24}>
      <StepsForm.Title>{$t({ defaultMessage: 'Summary' })}</StepsForm.Title>
    </Row>
    <Row>
      <Col span={6}>
        <Descriptions labelWidthPercent={100} layout='vertical'>
          <Descriptions.Item
            label={$t({ defaultMessage: 'Template Name' })}
            children={data?.name} />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Switches to apply' })}
            children={switchCount
              // TODO: tooltip
            } />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Reboot switches after applying the config' })}
            children={data?.reload ? $t({ defaultMessage: 'ON' }) : $t({ defaultMessage: 'OFF' })} />
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
              clis: ' ',
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