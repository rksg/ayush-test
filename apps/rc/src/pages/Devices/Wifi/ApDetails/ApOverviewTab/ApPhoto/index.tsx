import { useState, useEffect } from 'react'

import { Upload, Image } from 'antd'

import { Card, Loader, showToast } from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import {
  useGetApPhotoQuery,
  useAddApPhotoMutation
} from '@acx-ui/rc/services'
import { useApContext, WifiRbacUrlsInfo } from '@acx-ui/rc/utils'
import { WifiScopes }                     from '@acx-ui/types'
import { hasPermission }                  from '@acx-ui/user'
import { getIntl, getOpsApi }             from '@acx-ui/utils'

import PlaceHolder              from '../../../../../../assets/images/ap-models-images/placeholder.svg'
import { useGetApCapabilities } from '../../../hooks'

import { ApPhotoDrawer } from './ApPhotoDrawer'
import {
  StyledSpace,
  RoundIconDiv,
  PhotoDiv,
  ArrowsOutIcon,
  PhotoIcon,
  DotsDiv
} from './styledComponents'

export function ApPhoto () {
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const hasUpdatePermission = hasPermission({
    scopes: [WifiScopes.UPDATE],
    rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.addApPhoto)]
  })
  const [imageUrl, setImageUrl] = useState('')
  const [defaultImageUrl, setDefaultImageUrl] = useState(PlaceHolder)
  const [tempUrl, setTempUrl] = useState('')
  const [visible, setVisible] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [activeImage, setActiveImage] = useState<boolean[]>([true, false])
  const [imageList, setImageList] = useState<string[]>([])
  const { serialNumber, venueId, model } = useApContext()
  const params = { venueId, serialNumber }

  const apCapabilitiesQuery = useGetApCapabilities({
    params,
    modelName: model,
    skip: !model,
    enableRbac: isUseRbacApi
  })

  const [addApPhoto] = useAddApPhotoMutation()
  const apPhoto = useGetApPhotoQuery({ params, enableRbac: isUseRbacApi })

  useEffect(() => {
    if (!apCapabilitiesQuery.isLoading) {
      setDefaultImageUrl(apCapabilitiesQuery.data?.pictureDownloadUrl ?? PlaceHolder)
      setActiveImage([false,true])

      if (!apPhoto.isLoading) {
        const { url: apPhotoUrl, imageUrl: apPhotoImageUrl } = apPhoto?.data || {}
        const apImageUrl = isUseRbacApi? apPhotoUrl : apPhotoImageUrl

        if (apImageUrl) {
          setActiveImage([true, false])
          setImageUrl(apImageUrl)
          setImageList([apImageUrl, defaultImageUrl])
        } else {
          setActiveImage([false, true])
          setImageUrl('')
          setImageList([defaultImageUrl])
        }
      }
    }
  }, [apPhoto, apCapabilitiesQuery, model, isUseRbacApi])

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
      payload: formData,
      enableRbac: isUseRbacApi
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
          {hasUpdatePermission && <Upload
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
          }
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
