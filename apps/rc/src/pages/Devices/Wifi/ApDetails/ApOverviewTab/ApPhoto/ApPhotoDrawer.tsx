import { useCallback, useState, useEffect } from 'react'

import { Row, Col, Upload } from 'antd'
import Cropper              from 'react-easy-crop'
import { useIntl }          from 'react-intl'

import { Button, Drawer } from '@acx-ui/components'
import {
  useGetApPhotoQuery,
  useAddApPhotoMutation,
  useDeleteApPhotoMutation,
  useWifiCapabilitiesQuery,
  useApViewModelQuery
} from '@acx-ui/rc/services'
import { WifiEntityEnum } from '@acx-ui/rc/utils'
import { useParams }      from '@acx-ui/react-router-dom'

import { getCroppedImg }           from './cropImage'
import { AppContainer, FooterDiv } from './styledComponents'

interface ApPhotoDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void,
  tempUrl: string
  uploadFunc: (file: File) => void
}

interface cropImageType {
  x: number
  y: number
  width: number
  height: number
}

export const ApPhotoDrawer = (props: ApPhotoDrawerProps) => {
  const { $t } = useIntl()
  const params = useParams()

  const apPhoto = useGetApPhotoQuery({ params })
  const [addApPhoto] = useAddApPhotoMutation()
  const [deleteApPhoto] = useDeleteApPhotoMutation()

  const { visible, setVisible, uploadFunc, tempUrl } = props
  const [imageUrl, setImageUrl] = useState('')
  const [imageName, setImageName] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<cropImageType>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })

  const apViewModelPayload = {
    entityType: WifiEntityEnum.apsTree,
    fields: ['name', 'venueName', 'deviceGroupName', 'description', 'lastSeenTime',
      'serialNumber', 'apMac', 'IP', 'extIp', 'model', 'fwVersion',
      'meshRole', 'hops', 'apUpRssi', 'deviceStatus', 'deviceStatusSeverity',
      'isMeshEnable', 'lastUpdTime', 'deviceModelType', 'apStatusData.APSystem.uptime',
      'venueId', 'uplink', 'apStatusData', 'apStatusData.cellularInfo', 'tags'],
    filters: { serialNumber: [params.serialNumber] }
  }
  const apViewModelQuery = useApViewModelQuery({ params, payload: apViewModelPayload })
  const wifiCapabilities = useWifiCapabilitiesQuery({ params })

  useEffect(() => {
    if (!apPhoto.isLoading && apPhoto?.data) {
      setImageUrl(apPhoto?.data.imageUrl)
      setImageName(apPhoto?.data.imageName)
    }
  }, [apPhoto, wifiCapabilities, apViewModelQuery])
  const onCropComplete = useCallback(
    (croppedArea: cropImageType, croppedAreaPixels: cropImageType) => {
      setCroppedAreaPixels(croppedAreaPixels)}, [])

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(
        imageUrl,
        croppedAreaPixels
      ) as string
      let blob = await fetch(croppedImage).then(r => r.blob())
      const formData = new FormData()
      formData.append('file', blob, imageName)

      await addApPhoto({
        params: { ...params },
        payload: formData
      })

      setZoom(1)
    } catch (e) {
      return e
    }
  }, [croppedAreaPixels])

  const onClose = () => {
    setVisible(false)
  }

  const onSave = () => {
    showCroppedImage()
  }

  const content = <>
    <Row>
      <Col span={12}>
        <span style={{ marginTop: '10px', display: 'inline-flex' }}>
          {$t({ defaultMessage: 'Drag to reposition' })}
        </span>
      </Col>
      <Col span={12}>
        <Upload
          name='apPhoto'
          listType='picture'
          showUploadList={false}
          action={tempUrl}
          beforeUpload={uploadFunc}
          accept='image/*'
        >
          <Button type='link'
            key='view'
            onClick={() => {}}
            style={{ paddingRight: '10px' }}>
            {$t({ defaultMessage: 'Change Photo' })}
          </Button>
        </Upload>
        <Button type='link'
          key='view'
          onClick={() => {
            deleteApPhoto({ params })
            setVisible(false)
          }}
          data-testid='delete'>
          {$t({ defaultMessage: 'Remove' })}
        </Button>
      </Col>
    </Row>
    <Row>
      <Col span={24} style={{ height: '100%', minHeight: '700px' }}>
        <AppContainer>
          <div className='crop-container'>
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              cropSize={{ width: 240, height: 180 }}
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className='controls'>
            <span>-</span>
            <input
              type='range'
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby='Zoom'
              onChange={(e) => {
                setZoom(parseFloat(e.target.value))
              }}
              className='zoom-range'
              data-testid='zoomSlider'
            />
            <span>+</span>
          </div>
        </AppContainer>
      </Col>
    </Row>
  </>

  const footer = [
    <Button
      key='saveBtn'
      onClick={onSave}
      type={'secondary'}>
      {$t({ defaultMessage: 'Apply' })}
    </Button>,
    <Button
      key='cancelBtn'
      onClick={onClose}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  ]

  return (
    <Drawer
      title={$t({ defaultMessage: 'AP Photo' })}
      visible={visible}
      onClose={onClose}
      footer={<FooterDiv>{footer}</FooterDiv>}
      children={content}
      width={'400px'}
      maskClosable={true}
      closable={true}
    />
  )
}


