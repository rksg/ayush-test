import { Row, Col, Divider, Typography, Checkbox, Modal } from 'antd'
import { MessageDescriptor, defineMessage, useIntl }      from 'react-intl'

import { Button }                                                                                  from '@acx-ui/components'
import { useDeleteCaPrivateKeyMutation }                                                           from '@acx-ui/rc/services'
import { CertificateAuthority, CertificateUrls, PolicyOperation, PolicyType, hasPolicyPermission } from '@acx-ui/rc/utils'
import { hasAllowedOperations }                                                                    from '@acx-ui/user'
import { getOpsApi }                                                                               from '@acx-ui/utils'

import { deleteDescription }                                         from '../contentsMap'
import { ButtonWrapper, CollapseTitle, Description, DescriptionRow } from '../styledComponents'


interface ViewUploadDrawerProps {
  data: CertificateAuthority | null;
  setRawInfoDrawer: (title: string, data: string, open: boolean) => void;
  setUploadDrawerOpen: (open: boolean) => void;
}

enum SectionType {
  PUBLIC_KEY,
  CHAINS,
  PRIVATE_KEY
}

export default function ViewUploadSection (props: ViewUploadDrawerProps) {
  const { data, setRawInfoDrawer, setUploadDrawerOpen } = props
  const { $t } = useIntl()
  const [deletePrivateKeys] = useDeleteCaPrivateKeyMutation()
  const { Text } = Typography

  const titleLabel: Record<SectionType, MessageDescriptor> = {
    [SectionType.PUBLIC_KEY]: defineMessage({
      defaultMessage: 'Public Key'
    }),
    [SectionType.CHAINS]: defineMessage({
      defaultMessage: 'Chain'
    }),
    [SectionType.PRIVATE_KEY]: defineMessage({
      defaultMessage: 'Private Key'
    })
  }
  const renderViewButton = (title: string, displayedData: string) => (
    <Button
      onClick={() => {
        setRawInfoDrawer(title, displayedData, true)
      }}
    >
      {$t({ defaultMessage: 'View' })}
    </Button>
  )

  const renderSection = (
    sectionType: SectionType,
    detailData: string | null | undefined
  ) => (
    <DescriptionRow>
      <Row>
        <Col span={12}>
          <Description>{$t(titleLabel[sectionType])}</Description>
        </Col>
      </Row>
      {detailData &&
      <ButtonWrapper>
        {renderViewButton($t(titleLabel[sectionType]), detailData)}
      </ButtonWrapper>}
    </DescriptionRow>
  )

  const renderPrivateKeySection = (
    sectionType: SectionType) => (
    <DescriptionRow>
      <Row>
        <Col span={12}>
          <Description>{$t(titleLabel[sectionType])}</Description>
        </Col>
        <Col span={12}>
          {data?.privateKeyBase64 &&
            <Row justify='end'>
              {// eslint-disable-next-line max-len
                hasPolicyPermission({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.DELETE }) &&
                hasAllowedOperations([getOpsApi(CertificateUrls.deleteCAPrivateKey)]) &&
                <><Divider type='vertical' />
                  <Button type='link'
                    size='small'
                    onClick={() => { showDeleteModal() }}
                  >
                    {$t({ defaultMessage: 'Delete' })}
                  </Button></>}
            </Row>
          }
        </Col>
      </Row>
      {!data?.privateKeyBase64 ?
        (hasPolicyPermission({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.CREATE }) &&
          hasAllowedOperations([getOpsApi(CertificateUrls.uploadCAPrivateKey)])?
          (<ButtonWrapper>
            <Button onClick={() => setUploadDrawerOpen(true)}>
              {$t({ defaultMessage: 'Upload' })}
            </Button>
          </ButtonWrapper>) : (<Description>{$t({ defaultMessage: 'N/A' })}</Description>))
        : (<ButtonWrapper>
          {renderViewButton($t(titleLabel[sectionType]), data?.privateKeyBase64)}
        </ButtonWrapper>)
      }
    </DescriptionRow>
  )


  const showDeleteModal = () => {
    const modal = Modal.confirm({
      title: $t({ defaultMessage: 'Delete Private Key ?' }),
      okText: $t({ defaultMessage: 'Delete' }),
      cancelText: $t({ defaultMessage: 'Cancel' }),
      maskClosable: false,
      keyboard: false,
      content: <>
        <Row style={{ marginBottom: 10 }}>
          <Col>
            <Text> {$t(deleteDescription.PRIVATE_KEY_1)} </Text>
          </Col>
        </Row>
        <Row style={{ marginBottom: 10 }}>
          <Col>
            <Text type='danger' strong> {$t({ defaultMessage: 'IMPORTANT' })}: </Text>
            <Text> {$t(deleteDescription.PRIVATE_KEY_2)} </Text>
          </Col>
        </Row>
        <Row>
          <Checkbox onChange={(e) =>
            modal.update({ okButtonProps: { disabled: !e.target.checked } })} >
            <CollapseTitle>{$t(deleteDescription.PRIVATE_KEY_3)}</CollapseTitle>
          </Checkbox>
        </Row>
      </>,
      icon: <> </>,
      okButtonProps: { disabled: true },
      onOk: () => {
        deletePrivateKeys({
          params: { caId: data!.id }
        }).catch(() => { })
      }
    })
  }

  return (
    <>
      {renderSection(SectionType.PUBLIC_KEY, data?.publicKeyBase64)}
      {renderSection(SectionType.CHAINS, data?.chain)}
      {renderPrivateKeySection(SectionType.PRIVATE_KEY)}
    </>
  )
}

