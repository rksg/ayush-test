import { Params } from 'react-router-dom'

import {
  PropertyUrlsInfo
} from '@acx-ui/rc/utils'
import { ApiInfo, createHttpRequest } from '@acx-ui/utils'


export async function loadResidentPortalLogo (params:Params) {
  return loadResidentPortalImage(PropertyUrlsInfo.getResidentPortalLogo, params)
}

export async function loadResidentPortalFavIcon (params:Params) {
  return loadResidentPortalImage(PropertyUrlsInfo.getResidentPortalFavicon, params)
}

async function loadResidentPortalImage (url: ApiInfo, params:Params) {
  const request = createHttpRequest(url, params)

  const response = await fetch(request.url,
    { headers: request.headers,
      credentials: request.credentials,
      method: request.method })

  let blob:(Blob | undefined) = undefined

  if(response.status >= 200 && response.status <= 299) {
    blob = await response.blob()
  }

  const reader = new FileReader()
  return new Promise<string>((resolve, reject) => {
    if(blob && blob.size > 0) {
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    }  else {
      reject()
    }
  })
}