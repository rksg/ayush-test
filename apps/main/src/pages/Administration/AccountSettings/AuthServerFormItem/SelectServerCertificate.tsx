
import { Col, Select, Form, Row, Typography } from 'antd'
import { useIntl }                            from 'react-intl'

import { SpaceWrapper }             from '@acx-ui/rc/components'
import { ServerCertificate }        from '@acx-ui/rc/utils'
import { hasCrossVenuesPermission } from '@acx-ui/user'

import { MessageMapping } from '../MessageMapping'

export interface CertificateSelectorProps {
    serverSertificates?: ServerCertificate[];
    setSelected: (certificateId: string) => void
}


const SelectServerCertificate = (props: CertificateSelectorProps) => {
  const { $t } = useIntl()
  const { serverSertificates, setSelected } = props

  const certificateData = serverSertificates?.map((item) => ({
    label: `${item.name} - ${item.id}`,
    value: item.id
  }))

  const handleChange = (certificate: string) => {
    setSelected(certificate)
  }

  return (
    <Row gutter={24}>
      <Col span={24}>
        <Form.Item
          name='serverCertificate'
          label={$t({ defaultMessage: 'Configure a Server Certificate' })}
        >
          <Select style={{ width: '400px' }}
            //   value={currentMapRegion}
            onChange={handleChange}
            allowClear={true}
            showSearch
            optionFilterProp='children'
            disabled={!hasCrossVenuesPermission()}
          >
            {certificateData?.map(({ label, value }) =>
              (<Select.Option value={value} key={value} children={label}/>)
            )}
          </Select>
        </Form.Item>
        <SpaceWrapper full className='indent' justifycontent='flex-start'>
          <Typography.Paragraph className='greyText'>
            {$t(MessageMapping.configure_a_server_certificate, { br: <br/> })}
          </Typography.Paragraph>
        </SpaceWrapper>

      </Col>
    </Row>
  )
}

export default SelectServerCertificate
