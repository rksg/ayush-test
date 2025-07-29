import { Row, Col, Form, Typography } from 'antd'
import { useIntl }                    from 'react-intl'

import { PasswordInput }                          from '@acx-ui/components'
import { getEspProposalText, getIkeProposalText } from '@acx-ui/edge/components'
import { IpsecViewData }                          from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export const IpsecProfileView = (props: {
  selectedIpsecProfile: IpsecViewData | undefined
}) => {
  const { $t } = useIntl()
  const {
    selectedIpsecProfile
  } = props

  return <UI.StyledIpsecProfileViewWrapper>
    <Row gutter={[0, 12]}>
      {selectedIpsecProfile
        ? <>
          <Col span={24}>
            <Form.Item
              label={$t({ defaultMessage: 'Pre-Shared Key' })}
              style={{ marginBottom: 0 }}
            >
              <PasswordInput
                readOnly
                style={{ paddingLeft: 0 }}
                bordered={false}
                value={selectedIpsecProfile.preSharedKey}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={$t({ defaultMessage: 'IKE Proposal' })}
              style={{ marginBottom: 0 }}
            >
              <div style={{ padding: '4px 0' }}>
                {getIkeProposalText(selectedIpsecProfile)}
              </div>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={$t({ defaultMessage: 'ESP Proposal' })}
              style={{ marginBottom: 0 }}
            >
              <div style={{ padding: '4px 0' }}>
                {getEspProposalText(selectedIpsecProfile)}
              </div>
            </Form.Item>
          </Col>
        </>
        : <Col span={24}>
          <Typography.Text
            style={{ color: 'var(--acx-neutrals-50)' }}
            children={
              $t({ defaultMessage: 'Details of selected IPSec profile will appear here' })
            } />
        </Col>
      }
    </Row>
  </UI.StyledIpsecProfileViewWrapper>
}