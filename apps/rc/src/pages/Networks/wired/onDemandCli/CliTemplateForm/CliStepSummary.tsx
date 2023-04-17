import { useContext, useState, useRef, useEffect } from 'react'

import { Col, Divider, Row, Typography } from 'antd'
import { useIntl }                       from 'react-intl'

import { Descriptions, StepsForm, Tooltip } from '@acx-ui/components'
import { CodeMirrorWidget }                 from '@acx-ui/rc/components'
import { CliConfiguration }                 from '@acx-ui/rc/utils'

import CliTemplateFormContext from './CliTemplateFormContext'
import * as UI                from './styledComponents'

export function CliStepSummary (props: {
  data: CliConfiguration
}) {
  const { $t } = useIntl()
  const { data } = props
  const [switchCount, setSwitchCount] = useState(0)
  const [switchTooltip, setSwitchTooltip] = useState('')
  const { applySwitches } = useContext(CliTemplateFormContext)

  const codeMirrorEl = useRef(null as unknown as {
    setValue: Function,
  })

  useEffect(() => {
    const cli = data?.cli
    const switches = Object.values(applySwitches ?? {}).flat()?.length ?? 0
    const switcheTooltip = Object.values(applySwitches ?? {}).flat()
      .map(s => `${s.name}(${s.venueName})`).join(', ')

    cli && codeMirrorEl?.current?.setValue(cli)
    setSwitchCount(switches)
    setSwitchTooltip(switcheTooltip)
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
            children={
              <Tooltip // TODO: tooltip format
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