import { Col, Radio, Row, Space }    from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

export function VenueOrApGroupSettingsHeader (props: {
  apGroupId?: string,
  isUseVenueSettings: boolean,
  handleVenueSetting: () => void,
  disabled?: boolean
}) {
  const { $t } = useIntl()
  const { apGroupId, isUseVenueSettings, handleVenueSetting } = props

  return (
    <Row gutter={20}>
      <Col span={12}>
        <Space style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '14px',
          paddingBottom: '20px' }}
        >
          {
            <Radio.Group
              data-testid='ap-radiosettings'
              value={isUseVenueSettings}
              onChange={handleVenueSetting}
            >
              <Space direction='vertical'>
                <Radio value={true}>
                  <FormattedMessage
                    defaultMessage={'Use inherited settings from' +
                      ' <venueOrApGroupName></venueOrApGroupName>'}
                    values={{
                      venueOrApGroupName: () => {
                        return apGroupId ? 'AP Group' : '<VenueSingular></VenueSingular>'
                      }
                    }}
                  />
                </Radio>
                <Radio value={false}>
                  {$t({ defaultMessage: 'Customize settings' })}
                </Radio>
              </Space>
            </Radio.Group>
          }
        </Space>
      </Col>
    </Row>
  )
}

