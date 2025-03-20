import { Row, Col, Divider, Typography, Checkbox, Modal, Form, Input } from 'antd'
import { MessageDescriptor, defineMessage, useIntl }                   from 'react-intl'

import { Button, ModalRef }                from '@acx-ui/components'
import {
  useDeleteCaPrivateKeyMutation,
  useLazyDownloadCertificateAuthorityChainsQuery,
  useLazyDownloadCertificateAuthorityQuery,
  useLazyDownloadCertificateChainsQuery, useLazyDownloadCertificateInP12Query,
  useLazyDownloadCertificateQuery,
  useLazyDownloadPrivateKeyCertificateQuery,
  useLazyDownloadServerCertificateChainsQuery,
  useLazyDownloadServerCertificateQuery
} from '@acx-ui/rc/services'
import { Certificate, CertificateAuthority, CertificateCategoryType, CertificateAcceptType, PolicyOperation, PolicyType, hasPolicyPermission } from '@acx-ui/rc/utils'
import { getIntl, validationMessages }                                                                                                         from '@acx-ui/utils'

import { deleteDescription }                                         from '../contentsMap'
import { ButtonWrapper, CollapseTitle, Description, DescriptionRow } from '../styledComponents'


interface DownloadDrawerProps {
  type: CertificateCategoryType;
  data: CertificateAuthority | Certificate | null;
  setRawInfoDrawer: (title: string, data: string, open: boolean) => void;
  setUploadDrawerOpen: (open: boolean) => void;
}

enum SectionType {
  PUBLIC_KEY,
  CHAINS,
  PRIVATE_KEY,
  P12
}

enum CertDownloadType {
  PEM,
  DER,
  PKCS7,
  PKCS8,
  PKCS12,
  PKCS12_CHAIN,
  PKCS1
}

export default function DownloadSection (props: DownloadDrawerProps) {
  const { type, data, setRawInfoDrawer, setUploadDrawerOpen } = props
  const { $t } = useIntl()
  const [downloadCA] = useLazyDownloadCertificateAuthorityQuery()
  const [downloadCAChains] = useLazyDownloadCertificateAuthorityChainsQuery()
  const [downloadCertificate] = useLazyDownloadCertificateQuery()
  const [downloadCertificateChains] = useLazyDownloadCertificateChainsQuery()
  const [downloadServerCertificate] = useLazyDownloadServerCertificateQuery()
  const [downloadServerCertificateChains] = useLazyDownloadServerCertificateChainsQuery()
  const [deletePrivateKeys] = useDeleteCaPrivateKeyMutation()
  const [downloadPrivateKeyCertificate] = useLazyDownloadPrivateKeyCertificateQuery()
  const [downloadCertificateInP12] = useLazyDownloadCertificateInP12Query()
  const { Text } = Typography

  const downloadButtonLabel: Record<CertDownloadType, MessageDescriptor> = {
    [CertDownloadType.PEM]: defineMessage({
      defaultMessage: 'Download PEM'
    }),
    [CertDownloadType.DER]: defineMessage({
      defaultMessage: 'Download DER'
    }),
    [CertDownloadType.PKCS7]: defineMessage({
      defaultMessage: 'Download PKCS7'
    }),
    [CertDownloadType.PKCS8]: defineMessage({
      defaultMessage: 'Download'
    }),
    [CertDownloadType.PKCS12]: defineMessage({
      defaultMessage: 'Download Without Chain'
    }),
    [CertDownloadType.PKCS12_CHAIN]: defineMessage({
      defaultMessage: 'Download With Chain'
    }),
    [CertDownloadType.PKCS1]: defineMessage({
      defaultMessage: 'Download'
    })
  }

  const titleLabel: Record<SectionType, MessageDescriptor> = {
    [SectionType.PUBLIC_KEY]: defineMessage({
      defaultMessage: 'Public Key'
    }),
    [SectionType.CHAINS]: defineMessage({
      defaultMessage: 'Chain'
    }),
    [SectionType.PRIVATE_KEY]: defineMessage({
      defaultMessage: 'Private Key'
    }),
    [SectionType.P12]: defineMessage({
      defaultMessage: 'P12 Format'
    })
  }

  const certificateAcceptValue: Record<CertDownloadType, CertificateAcceptType> = {
    [CertDownloadType.PEM]: CertificateAcceptType.PEM,
    [CertDownloadType.DER]: CertificateAcceptType.DER,
    [CertDownloadType.PKCS7]: CertificateAcceptType.PKCS7,
    [CertDownloadType.PKCS8]: CertificateAcceptType.PKCS8,
    [CertDownloadType.PKCS12]: CertificateAcceptType.PKCS12,
    [CertDownloadType.PKCS12_CHAIN]: CertificateAcceptType.PKCS12,
    [CertDownloadType.PKCS1]: CertificateAcceptType.PKCS1
  }

  const handleDownloadClick = (
    downloadType: SectionType,
    format: CertDownloadType
  ) => {
    if (downloadType === SectionType.PRIVATE_KEY || downloadType === SectionType.P12) {
      const modalRef = Modal.confirm({})
      modalRef.update({
        title: downloadType === SectionType.PRIVATE_KEY ?
          $t({ defaultMessage: 'Download Private Key' }) :
          $t({ defaultMessage: 'Download P12 File' }),
        okText: downloadType === SectionType.PRIVATE_KEY ?
          $t({ defaultMessage: 'Download Private Key' }) :
          $t({ defaultMessage: 'Download P12' }),
        cancelText: $t({ defaultMessage: 'Cancel' }),
        maskClosable: false,
        keyboard: false,
        content:
          <PasswordForm
            modal={modalRef}
            onFinish={(value) => doDownload(format, downloadType, value)} />,
        icon: <> </>
      })
    } else {
      doDownload(format, downloadType)
    }
  }

  function getParams (format: CertDownloadType,
    certificateType: CertificateCategoryType, password: string) {
    switch(certificateType) {
      case CertificateCategoryType.CERTIFICATE:
        return {
          certificateId: data?.id,
          templateId: (data as Certificate).certificateTemplateId,
          includeChain: (format === CertDownloadType.PKCS12_CHAIN).toString(),
          password
        }

      case CertificateCategoryType.SERVER_CERTIFICATES:
        return {
          certId: data?.id,
          includeChain: (format === CertDownloadType.PKCS12_CHAIN).toString(),
          password
        }

      default: return {
        caId: data?.id,
        includeChain: (format === CertDownloadType.PKCS12_CHAIN).toString(),
        password
      }
    }
  }

  function getDownloadAction (certType: CertificateCategoryType) {
    switch (certType) {
      case CertificateCategoryType.CERTIFICATE:
        return downloadCertificate

      case CertificateCategoryType.SERVER_CERTIFICATES:
        return downloadServerCertificate

      default:
        return downloadCA
    }
  }

  function getDownloadChainsAction (certType: CertificateCategoryType) {
    switch (certType) {
      case CertificateCategoryType.CERTIFICATE:
        return downloadCertificateChains

      case CertificateCategoryType.SERVER_CERTIFICATES:
        return downloadServerCertificateChains

      default:
        return downloadCAChains
    }
  }

  function getDownloadPrivateKeyAction (certType: CertificateCategoryType) {
    if(certType === CertificateCategoryType.CERTIFICATE) {
      return downloadPrivateKeyCertificate
    }
    return downloadCA
  }

  function getDownloadP12Action (certType: CertificateCategoryType) {
    if(certType === CertificateCategoryType.CERTIFICATE) {
      return downloadCertificateInP12
    }
    return downloadCA
  }

  const doDownload = (format: CertDownloadType, downloadType: SectionType, password = '') => {
    const customHeaders = { Accept: certificateAcceptValue[format] }
    const downloadAction = getDownloadAction(type)
    const downloadChainsAction = getDownloadChainsAction(type)
    const downloadPrivateKeyAction = getDownloadPrivateKeyAction(type)
    const downloadP12Action = getDownloadP12Action(type)
    const params = getParams(format, type, password)

    if (downloadType === SectionType.PUBLIC_KEY) {
      downloadAction({ params, customHeaders })
    } else if (downloadType === SectionType.PRIVATE_KEY) {
      downloadPrivateKeyAction({ params, customHeaders, payload: { password } })
    } else if (downloadType === SectionType.P12) {
      downloadP12Action({ params, customHeaders,
        // eslint-disable-next-line max-len
        payload: { password, includeChain: (format === CertDownloadType.PKCS12_CHAIN).toString() } })
    } else if (downloadType === SectionType.CHAINS) {
      downloadChainsAction({ params, customHeaders })
    }
  }

  const renderDownloadButton = (type: CertDownloadType, onClick: () => void) => (
    <Row style={{ marginBottom: '8px' }} key={type}>
      <ButtonWrapper>
        <Button
          style={{
            minWidth: '142px',
            height: '28px'
          }}
          type='default'
          onClick={onClick}>
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
    downloadType: SectionType,
    acceptTypes: CertDownloadType[],
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
    downloadType: SectionType) => (
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
                // eslint-disable-next-line max-len
                hasPolicyPermission({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.DELETE }) &&
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
      {data?.privateKeyBase64 && renderDownloadButton(CertDownloadType.PKCS1,
        () => handleDownloadClick(downloadType, CertDownloadType.PKCS1))}
      {type === CertificateCategoryType.CERTIFICATE_AUTHORITY && !data?.privateKeyBase64 && (
        hasPolicyPermission({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.CREATE }) ? (
          <ButtonWrapper>
            <Button onClick={() => setUploadDrawerOpen(true)}>
              {$t({ defaultMessage: 'Upload' })}
            </Button>
          </ButtonWrapper>
        ) : (
          <Description>{$t({ defaultMessage: 'N/A' })}</Description>
        )
      )}
      {type === CertificateCategoryType.CERTIFICATE && !data?.privateKeyBase64
        && <Description>{$t({ defaultMessage: 'N/A' })}</Description>}
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

  const isServerCertificate = type === CertificateCategoryType.SERVER_CERTIFICATES

  return (
    <>
      {renderSection(SectionType.PUBLIC_KEY,
        isServerCertificate ? [CertDownloadType.PEM]
          : [CertDownloadType.PEM, CertDownloadType.DER], data?.publicKeyBase64)}
      {renderSection(SectionType.CHAINS,
        isServerCertificate ? [CertDownloadType.PEM]
          : [CertDownloadType.PEM, CertDownloadType.PKCS7], data?.chain)}
      {!isServerCertificate && renderPrivateKeySection(SectionType.PRIVATE_KEY)}
      {!isServerCertificate && renderSection(SectionType.P12,
        [CertDownloadType.PKCS12, CertDownloadType.PKCS12_CHAIN],
        data?.privateKeyBase64, false)}
    </>
  )
}

const PasswordForm = (props: {
  modal: ModalRef,
  onFinish: (password: string) => void
}) => {
  const { $t } = getIntl()
  const [form] = Form.useForm()
  const { modal, onFinish } = props
  modal.update({
    onOk: () => {
      onFinish(form.getFieldValue('password'))
    }
  })
  return (
    <>
      <div>
        {$t({ defaultMessage: 'Please enter a password to encrypt the file.' })}
      </div>
      <Form layout='vertical' form={form}>
        <Form.Item
          name='password'
          label={$t({ defaultMessage: 'Password' })}
          rules={[
            { max: 64, message: $t(validationMessages.maxStr) }
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form></>)
}
