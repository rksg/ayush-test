



import { Row, Col, Divider, Typography, Checkbox, Modal } from 'antd'
import { MessageDescriptor, defineMessage, useIntl }      from 'react-intl'

import { Button }                                                                                                                                                                                          from '@acx-ui/components'
import { useDeleteCaPrivateKeyMutation, useLazyDownloadCertificateAuthorityChainsQuery, useLazyDownloadCertificateAuthorityQuery, useLazyDownloadCertificateChainsQuery, useLazyDownloadCertificateQuery } from '@acx-ui/rc/services'
import { Certificate, CertificateAuthority, CertificateCategoryType }                                                                                                                                      from '@acx-ui/rc/utils'


import { deleteDescription }                                         from '../contentsMap'
import { DescriptionRow, Description, ButtonWrapper, CollapseTitle } from '../styledComponents'


interface DownloadDrawerProps {
  type: CertificateCategoryType;
  data: CertificateAuthority | Certificate | null;
  setRawInfoDrawer: (title: string, data: string, open: boolean) => void;
  setUploadDrawerOpen: (open: boolean) => void;
}

export enum DownloadType {
  AUTHORITY,
  AUTHORITY_CHAINS,
  CERTIFICATE,
  CERTIFICATE_CHAINS,
  PRIVATE_KEY,
  P12
}

export enum AcceptType {
  PEM = 'application/x-pem-file',
  DER = 'application/x-x509-ca-cert',
  PKCS7 = 'application/x-pkcs7-certificates',
  PKCS8 = 'application/pkcs8',
  PKCS12 = 'application/x-pkcs12'
}

export default function DownloadSection (props: DownloadDrawerProps) {
  const { type, data, setRawInfoDrawer, setUploadDrawerOpen } = props
  const { $t } = useIntl()
  const [downloadCertificateAuthority] = useLazyDownloadCertificateAuthorityQuery()
  const [downloadCertificateAuthorityChains] = useLazyDownloadCertificateAuthorityChainsQuery()
  const [downloadCertificate] = useLazyDownloadCertificateQuery()
  const [downloadCertificateChains] = useLazyDownloadCertificateChainsQuery()
  const [deletePrivateKeys] = useDeleteCaPrivateKeyMutation()
  const { Text } = Typography

  const downloadButtonLabel: Record<AcceptType, MessageDescriptor> = {
    [AcceptType.PEM]: defineMessage({
      defaultMessage: 'Download PEM'
    }),
    [AcceptType.DER]: defineMessage({
      defaultMessage: 'Download DER'
    }),
    [AcceptType.PKCS7]: defineMessage({
      defaultMessage: 'Download PKCS7'
    }),
    [AcceptType.PKCS8]: defineMessage({
      defaultMessage: 'Download'
    }),
    [AcceptType.PKCS12]: defineMessage({
      defaultMessage: 'Download'
    })
  }

  const titleLabel: Record<DownloadType, MessageDescriptor> = {
    [DownloadType.AUTHORITY]: defineMessage({
      defaultMessage: 'Public Key'
    }),
    [DownloadType.AUTHORITY_CHAINS]: defineMessage({
      defaultMessage: 'Chain'
    }),
    [DownloadType.CERTIFICATE]: defineMessage({
      defaultMessage: 'Public Key'
    }),
    [DownloadType.CERTIFICATE_CHAINS]: defineMessage({
      defaultMessage: 'Chain'
    }),
    [DownloadType.PRIVATE_KEY]: defineMessage({
      defaultMessage: 'Private Key'
    }),
    [DownloadType.P12]: defineMessage({
      defaultMessage: 'P12 Format'
    })
  }

  const handleDownloadClick = (
    downloadType: DownloadType,
    format: AcceptType
  ) => {
    const customHeaders = { Accept: format }

    switch (downloadType) {
      case DownloadType.AUTHORITY:
      case DownloadType.PRIVATE_KEY:
      case DownloadType.P12:
        downloadCertificateAuthority({ params: { caId: data?.id }, customHeaders })
        break
      case DownloadType.AUTHORITY_CHAINS:
        downloadCertificateAuthorityChains({ params: { caId: data?.id }, customHeaders })
        break
      case DownloadType.CERTIFICATE:
        downloadCertificate({
          params: {
            certificateId: data?.id,
            templateId: (data as Certificate).certificateTemplateId
          }, customHeaders
        })
        break
      case DownloadType.CERTIFICATE_CHAINS:
        downloadCertificateChains({
          params: {
            certificateId: data?.id,
            templateId: (data as Certificate).certificateTemplateId
          }, customHeaders
        })
        break
    }
  }

  const renderDownloadButton = (type: AcceptType, onClick: () => void) => (
    <Row style={{ marginBottom: '8px' }} key={type}>
      <ButtonWrapper>
        <Button type='default' onClick={onClick}>
          {$t(downloadButtonLabel[type])}
        </Button>
      </ButtonWrapper>
    </Row>
  )

  const renderViewButton = (title: string, displayedData: string) => (
    <Button
      type='link'
      size='small'
      onClick={() => {
        setRawInfoDrawer(title, displayedData, true)
      }}
    >
      {$t({ defaultMessage: 'View' })} {title}
    </Button>
  )

  const renderSection = (
    downloadType: DownloadType,
    acceptTypes: AcceptType[],
    detailData: string | null | undefined,
    shouldDisplayDetailData = true
  ) => (
    <DescriptionRow>
      <Row>
        <Col span={12}>
          <Description>{$t(titleLabel[downloadType])}</Description>
        </Col>
        {detailData && shouldDisplayDetailData &&
          <Col span={12}>
            <Row justify='end'>
              {renderViewButton($t(titleLabel[downloadType]), detailData)}
            </Row>
          </Col>}
      </Row>
      {detailData && acceptTypes.map(acceptType =>
        renderDownloadButton(acceptType, () => handleDownloadClick(downloadType, acceptType))
      )}
      {!detailData && <Description>{$t({ defaultMessage: 'N/A' })}</Description>}
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
      {type === CertificateCategoryType.CERTIFICATE_AUTHORITY &&
        <>
          {renderSection(DownloadType.AUTHORITY,
            [AcceptType.PEM, AcceptType.DER], data?.publicKeyBase64)}
          {renderSection(DownloadType.AUTHORITY_CHAINS,
            [AcceptType.PEM, AcceptType.PKCS7], data?.chain)}
          {
            <DescriptionRow>
              <Row>
                <Col span={12}>
                  <Description>{$t(titleLabel[DownloadType.PRIVATE_KEY])}</Description>
                </Col>
                <Col span={12}>
                  {data?.privateKeyBase64 &&
                    <Row justify='end'>
                      {renderViewButton($t(titleLabel[DownloadType.PRIVATE_KEY]),
                        data?.privateKeyBase64)}
                      <Divider type='vertical' />
                      <Button type='link'
                        size='small'
                        onClick={() => { showDeleteModal() }}
                      >
                        {$t({ defaultMessage: 'Delete' })}
                      </Button>
                    </Row>
                  }
                </Col>
              </Row>
              {data?.privateKeyBase64 && renderDownloadButton(AcceptType.PKCS8,
                () => handleDownloadClick(DownloadType.PRIVATE_KEY, AcceptType.PKCS8))}
              {!data?.privateKeyBase64 &&
                <ButtonWrapper>
                  <Button onClick={() => {
                    setUploadDrawerOpen(true)
                  }}>{$t({ defaultMessage: 'Upload' })}</Button>
                </ButtonWrapper>}
            </DescriptionRow>
          }
          {renderSection(DownloadType.P12, [AcceptType.PKCS12], data?.privateKeyBase64, false)}
        </>
      }
      {type === CertificateCategoryType.CERTIFICATE &&
        <>
          {renderSection(DownloadType.CERTIFICATE,
            [AcceptType.PEM, AcceptType.DER], data?.publicKeyBase64)}
          {renderSection(DownloadType.CERTIFICATE_CHAINS,
            [AcceptType.PEM, AcceptType.PKCS7], data?.chain)}
        </>
      }
    </>
  )
}

