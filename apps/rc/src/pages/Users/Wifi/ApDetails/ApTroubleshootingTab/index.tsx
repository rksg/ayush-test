import { useState } from 'react'

import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { NetworkFilter, Button } from '@acx-ui/components'
import {
  ArrowExpand
} from '@acx-ui/icons'
import {  useParams } from '@acx-ui/react-router-dom'

import { ClientTroubleShootingConfig } from './config'
import * as UI                         from './styledComponents'
export function ApTroubleshootingTab () {
  const { userId: clientId } = useParams()
  const [ historyContentToggle, setHistoryContentToggle ] = useState(true)
  const { $t } = useIntl()

  const onApply = () => {}
  return (
    <Row gutter={[16, 16]}>
      <Col span={historyContentToggle ? 18 : 21}>
        <Row gutter={[16, 16]}>
          <Col span={12} />
          {ClientTroubleShootingConfig.selection.map((config) => (
            <Col span={4}>
              <NetworkFilter
                multiple
                defaultValue={config.defaultValue}
                placeholder={config.placeHolder}
                options={config.options}
                onApply={onApply}
              />
            </Col>
          ))}
          <Col span={18}>
            <Row>
              <Col span={24}>Widget 1</Col>
            </Row>
            <Row>
              <Col span={24}>Widget 2</Col>
            </Row>
            <Row>
              <Col span={24}>Widget 3</Col>
            </Row>
            <Row>
              <Col span={24}>Widget 4</Col>
            </Row>
          </Col>
        </Row>
      </Col>
      {historyContentToggle ? (
        <Col span={6}>
          <UI.History>
            <UI.HistoryContent>
              <UI.HistoryContentTitle>
                {$t({ defaultMessage: 'History' })}
              </UI.HistoryContentTitle>
              <UI.HistoryIcon>
                <ArrowExpand
                  style={{
                    transform: 'rotate(180deg)',
                    cursor: 'pointer',
                    lineHeight: '20px'
                  }}
                  onClick={() => {
                    setHistoryContentToggle(!historyContentToggle)
                  }}
                />
              </UI.HistoryIcon>
            </UI.HistoryContent>
          </UI.History>
        </Col>
      ) : (
        <Col span={3}>
          <Row style={{ justifyContent: 'end' }}>
            <Col>
              <Button
                type='primary'
                style={{ width: '96px' }}
                onClick={() => {
                  setHistoryContentToggle(!historyContentToggle)
                }}>
                {$t({ defaultMessage: 'History' })}
              </Button>
            </Col>
          </Row>
        </Col>
      )}
    </Row>
  )
}