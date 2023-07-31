import { useCallback, useState, useEffect } from 'react'

import { Row, Col, Upload, Slider } from 'antd'
import Cropper                      from 'react-easy-crop'
import { useIntl }                  from 'react-intl'

import { Button, Drawer }     from '@acx-ui/components'
import {
  useGetApPhotoQuery,
  useAddApPhotoMutation,
  useDeleteApPhotoMutation,
  useApViewModelQuery,
  useGetApCapabilitiesQuery
} from '@acx-ui/rc/services'
import { generateHexKey, useApContext } from '@acx-ui/rc/utils'


import { getCroppedImg }                                from './cropImage'
import { AppContainer, FooterDiv, PlusIcon, MinusIcon } from './styledComponents'

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
  const params = useApContext()

  const apPhoto = useGetApPhotoQuery({ params })
  const [addApPhoto] = useAddApPhotoMutation()
  const [deleteApPhoto] = useDeleteApPhotoMutation()

  const { visible, setVisible, uploadFunc, tempUrl } = props
  const [imageUrl, setImageUrl] = useState('')
  const [imageName, setImageName] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [key, setKey] = useState('')

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<cropImageType>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })

  const apViewModelPayload = {
    entityType: 'aps',
    fields: ['name', 'venueName', 'deviceGroupName', 'description', 'lastSeenTime',
      'serialNumber', 'apMac', 'IP', 'extIp', 'model', 'fwVersion',
      'meshRole', 'hops', 'apUpRssi', 'deviceStatus', 'deviceStatusSeverity',
      'isMeshEnable', 'lastUpdTime', 'deviceModelType', 'apStatusData.APSystem.uptime',
      'venueId', 'uplink', 'apStatusData', 'apStatusData.cellularInfo', 'tags'],
    filters: { serialNumber: [params.serialNumber] }
  }
  const apViewModelQuery = useApViewModelQuery({ params, payload: apViewModelPayload })
  const wifiCapabilities = useGetApCapabilitiesQuery({ params })

  useEffect(() => {
    if (!apPhoto.isLoading && apPhoto?.data) {
      setImageUrl(apPhoto?.data.imageUrl)
      setImageName(apPhoto?.data.imageName)
      setKey(generateHexKey(10))
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
      <Col span={14} style={{ paddingTop: '2px' }}>
        <span>
          {$t({ defaultMessage: 'Drag to reposition' })}
        </span>
      </Col>
      <Col span={10}>
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
            style={{ paddingRight: '10px', fontSize: '12px' }}>
            {$t({ defaultMessage: 'Change Photo' })}
          </Button>
        </Upload>
        <Button type='link'
          key='view'
          onClick={() => {
            deleteApPhoto({ params })
            setVisible(false)
          }}
          data-testid='delete'
          style={{ fontSize: '12px' }}>
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
            <Button
              data-testid='image-zoom-out'
              type='link'
              size='middle'
              onClick={() => zoom > 1 && setZoom(zoom - 0.1)}
              icon={<MinusIcon />}
            />
            <Slider
              data-testid='zoomSlider'
              style={{ width: '180px' }}
              defaultValue={1}
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              tooltipVisible={false}
              onChange={(value: number) => {
                setZoom(value)
              }}
            />
            <Button
              data-testid='image-zoom-in'
              type='link'
              size='middle'
              onClick={() => zoom < 3 && setZoom(zoom + 0.1)}
              icon={<PlusIcon />}
            />
          </div>
          <div className='description' style={{ top: '550px' }}>
            {
              // eslint-disable-next-line max-len
              $t({ defaultMessage: 'The thumbnail will be displayed on the AP details view. The full photo can be viewed by double clicking the thumbnail.' })
            }
          </div>
        </AppContainer>
      </Col>
    </Row>
  </>

  const footer = [
    <Button
      key='saveBtn'
      onClick={onSave}
      type='primary'>
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
      key={key}
      title={$t({ defaultMessage: 'AP Photo' })}
      visible={visible}
      onClose={onClose}
      footer={<FooterDiv>{footer}</FooterDiv>}
      children={content}
      width={'400px'}
      closable={true}
    />
  )
}


