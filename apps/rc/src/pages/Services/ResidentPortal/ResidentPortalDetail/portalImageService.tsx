import {
  ApiInfo,
  createHttpRequest,
  PropertyUrlsInfo
} from '@acx-ui/rc/utils'
import { Params } from 'react-router-dom'

export async function loadResidentPortalLogo<Promise>(params:Params) {
  return loadResidentPortalImage(PropertyUrlsInfo.getResidentPortalLogo, params)
}

export async function loadResidentPortalFavIcon<Promise>(params:Params) {
  return loadResidentPortalImage(PropertyUrlsInfo.getResidentPortalFavicon, params)
}

async function loadResidentPortalImage<Promise>(url: ApiInfo, params:Params) {
  const request = createHttpRequest(url, params)

  const response = await fetch(request.url, 
    {headers: request.headers, 
    credentials: request.credentials, 
    method: request.method})
  
  const blob = await response.blob()

  const reader = new FileReader()
  return new Promise<string>((resolve, reject) => {
    if(blob) {
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    }  else {
      reject()
    }
  })
}