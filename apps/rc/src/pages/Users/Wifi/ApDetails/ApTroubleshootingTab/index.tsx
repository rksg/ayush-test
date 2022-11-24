import { useState } from 'react'

import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { NetworkFilter, Button } from '@acx-ui/components'
import {  useParams }            from '@acx-ui/react-router-dom'

import { ClientTroubleShootingConfig } from './config'
import { History }                     from './History'
import { TimeLine }                    from './TimeLine'

export function ApTroubleshootingTab () {
  // Todo use clientId to get timeline and history
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userId: clientId } = useParams()
  const [ historyContentToggle, setHistoryContentToggle ] = useState(true)
  const { $t } = useIntl()

  // Todo onApply should trigger new api call and update search params
  const onApply = (selectionType : string) => { return selectionType}
  return (
    <Row gutter={[16, 16]}>
      <Col span={historyContentToggle ? 18 : 24}>
        <Row gutter={[16, 16]}>
          <Col span={historyContentToggle ? 12 : 8} />
          {
            ClientTroubleShootingConfig.selection.map((config) => (
              <Col span={4}>
                <NetworkFilter
                  multiple
                  defaultValue={config.defaultValue}
                  placeholder={config.placeHolder}
                  options={config.options}
                  onApply={() => onApply(config.selectionType)}
                />
              </Col>
            ))}
          {!historyContentToggle &&
          <Col span={4}>
            <Row style={{ justifyContent: 'end' }}>
              <Button
                type='primary'
                style={{ width: '96px' }}
                onClick={() => {
                  setHistoryContentToggle(!historyContentToggle)
                }}>
                {$t({ defaultMessage: 'History' })}
              </Button>
            </Row>
          </Col>
          }
          <Col span={24}>
            <TimeLine/>
          </Col>
        </Row>
      </Col>
      {historyContentToggle && (
        <Col span={6}>
          <History setHistoryContentToggle={setHistoryContentToggle} historyContentToggle/>
        </Col>
      )}
    </Row>
  )
}
