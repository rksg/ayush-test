import { useState } from 'react'

import { Col, Divider, Row, Typography } from 'antd'
import { useIntl }                       from 'react-intl'

import { Button }                                                             from '@acx-ui/components'
import { enrollmentTypeLabel, existingCertLabel, onboardSettingsDescription } from '@acx-ui/rc/components'
import { CertificateTemplate }                                                from '@acx-ui/rc/utils'
import { noDataDisplay }                                                      from '@acx-ui/utils'

import { Description, DescriptionRow, Section } from '../styledComponents'

import ChromebookInstructionDrawer from './ChromebookInstructionDrawer'

export default function ChromebookTab ({ data }: { data: CertificateTemplate | undefined }) {
  const { $t } = useIntl()
  const { Text } = Typography
  const [ isInstructionOpen, setIsInstructionOpen ] = useState(false)

  const chromebookInfo = [
    {
      title: $t({ defaultMessage: 'Enrollment Type' }),
      content: data?.chromebook?.enrollmentType ?
        // eslint-disable-next-line max-len
        $t(enrollmentTypeLabel[data.chromebook.enrollmentType as keyof typeof enrollmentTypeLabel])
        : noDataDisplay
    },
    {
      title: $t({ defaultMessage: 'Existing Certificates' }),
      content: data?.chromebook?.certRemovalType ?
        // eslint-disable-next-line max-len
        $t(existingCertLabel[data.chromebook.certRemovalType as keyof typeof existingCertLabel])
        : noDataDisplay
    },
    {
      title: $t({ defaultMessage: 'API Key' }),
      content: data?.chromebook?.apiKey
    }
  ]

  const chromebookServiceAccountInfo = [
    {
      title: $t({ defaultMessage: 'Type' }),
      content: data?.chromebook?.type
    },
    {
      title: $t({ defaultMessage: 'Service Account' }),
      content: data?.chromebook?.projectId
    },
    {
      title: $t({ defaultMessage: 'Email address' }),
      content: data?.chromebook?.clientEmail
    },
    {
      title: $t({ defaultMessage: 'Key ID' }),
      content: data?.chromebook?.privateKeyId
    }
  ]

  const openInstructions = () => {
    setIsInstructionOpen(true)
  }

  const closeInstructions = () => {
    setIsInstructionOpen(false)
  }

  return (
    <>
      <Section>
        <Row justify='space-between'>
          <Col>
            <DescriptionRow>
              <Description>{$t({ defaultMessage: 'Status' })}</Description>
              {data?.chromebook?.enabled ?
                $t({ defaultMessage: 'Enabled' }) : $t({ defaultMessage: 'Disabled' })}
            </DescriptionRow>
            {data?.chromebook?.enabled && chromebookInfo.map((item, index) => (
              <DescriptionRow key={index}>
                <Description>{item.title}</Description>
                {item.content || noDataDisplay}
              </DescriptionRow>
            ))}
          </Col>
          {data?.chromebook?.enabled &&
          <Col>
            <Button
              type={'link'}
              onClick={openInstructions}
            >
              {$t({ defaultMessage: 'Show setup instructions' })}
            </Button>
          </Col>}
        </Row>
      </Section>
      {data?.chromebook?.enabled &&
        <Section>
          <Text strong>{$t({ defaultMessage: 'Google Service Account' })}</Text>
          <Divider style={{ marginTop: 6 }} />
          <Description>{$t(onboardSettingsDescription.KEY_LENGTH)}</Description>
          {chromebookServiceAccountInfo.map((item, index) => (
            <DescriptionRow key={index}>
              <Description>{item.title}</Description>
              {item.content || noDataDisplay}
            </DescriptionRow>
          ))}
        </Section>
      }

      {(isInstructionOpen && data)
      && <ChromebookInstructionDrawer
        data={data}
        onClose={closeInstructions}
      />}
    </>
  )
}
