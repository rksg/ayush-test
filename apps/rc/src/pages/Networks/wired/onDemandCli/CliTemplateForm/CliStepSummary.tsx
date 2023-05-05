import { useState, useRef, useEffect } from 'react'

import { Col, Divider, Row, Typography } from 'antd'
import { useIntl }                       from 'react-intl'

import { Descriptions, StepsFormNew, Tooltip, useStepFormContext } from '@acx-ui/components'
import { CodeMirrorWidget }                                        from '@acx-ui/rc/components'
import { CliConfiguration }                                        from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export function CliStepSummary () {
  const { $t } = useIntl()
  const { form } = useStepFormContext()
  const [switchCount, setSwitchCount] = useState(0)
  const [switchTooltip, setSwitchTooltip] = useState('')

  const data = (form?.getFieldsValue(true) as CliConfiguration)
  const codeMirrorEl = useRef(null as unknown as {
    setValue: Function,
  })

  useEffect(() => {
    const switches = Object.values(data.applySwitch ?? {}).flat()?.length ?? 0
    const switcheTooltip = Object.values(data.applySwitch ?? {}).flat()
      .map(s => `${s?.name}(${s?.venueName})`).join(', ')

    setSwitchCount(switches)
    setSwitchTooltip(switcheTooltip)
  }, [])

  return <>
    <Row gutter={24}>
      <StepsFormNew.Title children={$t({ defaultMessage: 'Summary' })} />
    </Row>
    <Row>
      <Col span={6}>
        <Descriptions labelWidthPercent={100} layout='vertical'>
          <Descriptions.Item
            label={$t({ defaultMessage: 'Template Name' })}
            children={data?.name} />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Switches to apply' })}
            children={
              <Tooltip
                title={switchTooltip}
                placement='bottom'
              >
                {switchCount}
              </Tooltip>
            } />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Reboot switches after applying the config' })}
            children={data?.reload
              ? $t({ defaultMessage: 'ON' })
              : $t({ defaultMessage: 'OFF' })
            } />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Apply the CLI template after adding it' })}
            children={data?.applyNow
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
              clis: data?.cli || '',
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
