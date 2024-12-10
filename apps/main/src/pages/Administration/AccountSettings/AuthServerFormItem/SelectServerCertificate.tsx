
import { Col, Select, Form, Row } from 'antd'
import { useIntl }                from 'react-intl'

import { SpaceWrapper }             from '@acx-ui/rc/components'
import { ServerCertificate }        from '@acx-ui/rc/utils'
import { hasCrossVenuesPermission } from '@acx-ui/user'

import { MessageMapping } from '../MessageMapping'

import * as UI from './styledComponents'

export interface CertificateSelectorProps {
    serverSertificates?: ServerCertificate[];
    setSelected: (certificateId: string) => void
    selected?: string
}

const SelectServerCertificate = (props: CertificateSelectorProps) => {
  const { $t } = useIntl()
  const { serverSertificates, setSelected, selected } = props

  const certificateData = serverSertificates?.map((item) => ({
    label: `${item.name} - ${item.id}`,
    value: item.id
  }))

  const handleChange = (certificate: string) => {
    setSelected(certificate ?? '')
  }

  return (
    <Form layout='vertical'>
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item
            name='serverCertificate'
            label={$t({ defaultMessage: 'Configure a Server Certificate' })}
            initialValue={selected}
          >
            <Select style={{ width: '400px' }}
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
          <SpaceWrapper className='indent' justifycontent='flex-start'>
            <UI.DrawerParagraph>
              {$t(MessageMapping.configure_a_server_certificate, { br: <br/> })}
            </UI.DrawerParagraph>
          </SpaceWrapper>

        </Col>
      </Row>
    </Form>
  )
}

export default SelectServerCertificate
