import { Row, Col, Divider, Typography, Checkbox, Modal } from 'antd'
import { MessageDescriptor, defineMessage, useIntl }      from 'react-intl'

import { Button }                                                                                                                                                                                          from '@acx-ui/components'
import { useDeleteCaPrivateKeyMutation, useLazyDownloadCertificateAuthorityChainsQuery, useLazyDownloadCertificateAuthorityQuery, useLazyDownloadCertificateChainsQuery, useLazyDownloadCertificateQuery } from '@acx-ui/rc/services'
import { AcceptType, Certificate, CertificateAuthority, CertificateCategoryType }                                                                                                                          from '@acx-ui/rc/utils'


import { deleteDescription }                                         from '../contentsMap'
import { DescriptionRow, Description, ButtonWrapper, CollapseTitle } from '../styledComponents'


interface DownloadDrawerProps {
  type: CertificateCategoryType;
  data: CertificateAuthority | Certificate | null;
  setRawInfoDrawer: (title: string, data: string, open: boolean) => void;
  setUploadDrawerOpen: (open: boolean) => void;
}

export enum DownloadType {
  PUBLIC_KEY,
  CHAINS,
  PRIVATE_KEY,
  P12
}

export default function DownloadSection (props: DownloadDrawerProps) {
  const { type, data, setRawInfoDrawer, setUploadDrawerOpen } = props
  const { $t } = useIntl()
  const [downloadCA] = useLazyDownloadCertificateAuthorityQuery()
  const [downloadCAChains] = useLazyDownloadCertificateAuthorityChainsQuery()
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
    [DownloadType.PUBLIC_KEY]: defineMessage({
      defaultMessage: 'Public Key'
    }),
    [DownloadType.CHAINS]: defineMessage({
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
    const isCertificate = CertificateCategoryType.CERTIFICATE === type
    const downloadAction = isCertificate ? downloadCertificate : downloadCA
    const downloadChainsAction = isCertificate ? downloadCertificateChains : downloadCAChains
    const downloadTypes = [DownloadType.PUBLIC_KEY, DownloadType.PRIVATE_KEY, DownloadType.P12]
    const params = isCertificate ? {
      certificateId: data?.id,
      templateId: (data as Certificate).certificateTemplateId
    } : {
      caId: data?.id
    }

    if (downloadTypes.includes(downloadType)) {
      downloadAction({ params, customHeaders })
    } else if (downloadType === DownloadType.CHAINS) {
      downloadChainsAction({ params, customHeaders })
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

  const renderPrivateKeySection = (
    downloadType: DownloadType) => (
    <DescriptionRow>
      <Row>
        <Col span={12}>
          <Description>{$t(titleLabel[downloadType])}</Description>
        </Col>
        <Col span={12}>
          {data?.privateKeyBase64 &&
            <Row justify='end'>
              {renderViewButton($t(titleLabel[downloadType]),
                data?.privateKeyBase64)}
              {type === CertificateCategoryType.CERTIFICATE_AUTHORITY &&
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
      {data?.privateKeyBase64 && renderDownloadButton(AcceptType.PKCS8,
        () => handleDownloadClick(downloadType, AcceptType.PKCS8))}
      {type === CertificateCategoryType.CERTIFICATE_AUTHORITY && !data?.privateKeyBase64 &&
        <ButtonWrapper>
          <Button onClick={() => {
            setUploadDrawerOpen(true)
          }}>{$t({ defaultMessage: 'Upload' })}</Button>
        </ButtonWrapper>}
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
      {renderSection(DownloadType.PUBLIC_KEY,
        [AcceptType.PEM, AcceptType.DER], data?.publicKeyBase64)}
      {renderSection(DownloadType.CHAINS,
        [AcceptType.PEM, AcceptType.PKCS7], data?.chain)}
      {renderPrivateKeySection(DownloadType.PRIVATE_KEY)}
      {renderSection(DownloadType.P12, [AcceptType.PKCS12], data?.privateKeyBase64, false)}
    </>
  )
}

