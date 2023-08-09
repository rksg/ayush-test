import { useState, useEffect } from 'react'

import { Upload, Image } from 'antd'

import { Card, Loader, showToast } from '@acx-ui/components'
import {
  useGetApPhotoQuery,
  useAddApPhotoMutation,
  useApViewModelQuery,
  useGetApCapabilitiesQuery
} from '@acx-ui/rc/services'
import { useApContext } from '@acx-ui/rc/utils'
import { getIntl }      from '@acx-ui/utils'

import PlaceHolder from '../../../../../../assets/images/ap-models-images/placeholder.svg'

import { ApPhotoDrawer }                                                          from './ApPhotoDrawer'
import { StyledSpace, RoundIconDiv, PhotoDiv, ArrowsOutIcon, PhotoIcon, DotsDiv } from './styledComponents'

export function ApPhoto () {
  const [imageUrl, setImageUrl] = useState('')
  const [defaultImageUrl, setDefaultImageUrl] = useState(PlaceHolder)
  const [tempUrl, setTempUrl] = useState('')
  const [visible, setVisible] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [activeImage, setActiveImage] = useState<boolean[]>([true, false])
  const [imageList, setImageList] = useState<string[]>([])
  const params = useApContext()

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
  const apCapabilitiesQuery = useGetApCapabilitiesQuery({ params })
  const currentAP = apViewModelQuery.data
  const apCapabilities = apCapabilitiesQuery.data

  const [addApPhoto] = useAddApPhotoMutation()
  const apPhoto = useGetApPhotoQuery({ params })

  useEffect(() => {
    if(apCapabilities){
      const allModelsCapabilities = apCapabilities?.apModels
      const filteredModelCapabilities = allModelsCapabilities?.filter((modelCapabilities:
        { model: string })=> modelCapabilities.model === apViewModelQuery.data?.model)
      if(filteredModelCapabilities[0]){
        setDefaultImageUrl(filteredModelCapabilities[0].pictureDownloadUrl)
      }else{
        setDefaultImageUrl(PlaceHolder)
      }
      setActiveImage([false,true])
    }
    if (!apPhoto.isLoading) {
      if(apPhoto?.data?.imageUrl){
        setActiveImage([true, false])
        setImageUrl(apPhoto?.data.imageUrl)
        setImageList([apPhoto?.data.imageUrl, defaultImageUrl])
      }else{
        setActiveImage([false, true])
        setImageUrl('')
        setImageList([defaultImageUrl])
      }
    }
  }, [apPhoto, currentAP, apCapabilities])

  const { $t } = getIntl()
  const beforeUpload = async function (file: File) {
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp']
    const validImage = acceptedImageTypes.includes(file.type)
    if (!validImage) {
      const content = $t({ defaultMessage: 'Invalid Image type!' })
      openToastAndResetFile(content)
      return
    }
    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isLt10M) {
      const content = $t({ defaultMessage: 'Image file size cannot exceed 10 MB' })
      openToastAndResetFile(content)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setTempUrl((window.URL || window.webkitURL).createObjectURL(file))
      setImageUrl(reader.result as string)
    }
    const formData = new FormData()
    formData.append('file', file, file.name)

    await addApPhoto({
      params: { ...params },
      payload: formData
    })

    return false
  }

  const openToastAndResetFile = function (content: string) {
    showToast({
      type: 'error',
      content
    })
    setImageUrl('')
    setTempUrl('')
  }

  return (
    <Loader states={[apPhoto, apCapabilitiesQuery]}>
      <Card>
        <StyledSpace>
          <RoundIconDiv>
            <ArrowsOutIcon onClick={() => setVisible(true)} data-testid='gallery'/>
          </RoundIconDiv>
          <Upload
            name='apPhoto'
            listType='picture'
            showUploadList={false}
            action={tempUrl}
            beforeUpload={beforeUpload}
            accept='image/*'
            style={{
              height: '180px'
            }}
          >
            <RoundIconDiv>
              <PhotoIcon />
            </RoundIconDiv>
          </Upload>
        </StyledSpace>
        <PhotoDiv>
          {imageUrl !== '' && activeImage[0] &&
            <Image
              preview={{ visible: false, mask: null }}
              src={imageUrl}
              style={{ cursor: 'pointer' }}
              onDoubleClick={() => setDrawerVisible(true)}
              data-testid='image1'
            />
          }
          {defaultImageUrl !== '' && activeImage[1] &&
            <Image
              preview={{ visible: false, mask: null }}
              src={defaultImageUrl}
              style={{ cursor: 'pointer' }}
              data-testid='image2'
            />
          }
          {imageUrl && defaultImageUrl &&
            <DotsDiv>
              {imageUrl !== '' &&
                <div
                  className={`dot ${activeImage[0] ? 'active-dot' : ''}`}
                  onClick={() => setActiveImage([true, false])}
                  data-testid='dot1'>
                </div>
              }
              {defaultImageUrl !== '' &&
                <div
                  className={`dot ${activeImage[1] ? 'active-dot' : ''}`}
                  onClick={() => setActiveImage([false, true])}
                  data-testid='dot2'>
                </div>
              }
            </DotsDiv>
          }
          <div style={{ display: 'none' }}>
            <Image.PreviewGroup
              preview={{
                visible,
                current: imageUrl !== '' ? (activeImage[0] ? 0 : 1) : 0,
                onVisibleChange: (vis) => { setVisible(vis) }
              }}
            >
              {imageList.map((item, index) => <Image src={item} key={index} />)}
            </Image.PreviewGroup>
          </div>
        </PhotoDiv>
      </Card>
      <ApPhotoDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        tempUrl={tempUrl}
        uploadFunc={beforeUpload}
      />
    </Loader>
  )

}
