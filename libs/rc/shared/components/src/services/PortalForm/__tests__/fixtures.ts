/* eslint-disable max-len */
import { defaultComDisplay, Portal, PortalSaveData } from '@acx-ui/rc/utils'
import {
  ServiceType,
  getServiceRoutePath,
  ServiceOperation
} from '@acx-ui/rc/utils'

import { PortalDemoDefaultSize } from '../../PortalDemo/commonUtils'
import Photo                     from '../assets/images/portal-demo/PortalPhoto.svg'
import Powered                   from '../assets/images/portal-demo/PoweredLogo.svg'
import Logo                      from '../assets/images/portal-demo/RuckusCloud.svg'
export const portalResponse: Portal = {
  id: '1',
  serviceName: 'test111',
  network: [],
  content: {
    bgColor: 'var(--acx-primary-white)',
    bgImage: '',
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: 'var(--acx-primary-black)',
    welcomeSize: PortalDemoDefaultSize.welcomeSize,
    photo: Photo,
    photoRatio: PortalDemoDefaultSize.photoRatio,
    logo: Logo,
    logoRatio: PortalDemoDefaultSize.logoRatio,
    secondaryText: 'Lorem ipsum dolor sit amet, '+
      'consectetur adipiscing elit. Aenean euismod bibendum laoreet.',
    secondaryColor: 'var(--acx-primary-black)',
    secondarySize: PortalDemoDefaultSize.secondarySize,
    buttonColor: 'var(--acx-accents-orange-50)',
    poweredBgColor: 'var(--acx-primary-white)',
    poweredColor: 'var(--acx-primary-black)',
    poweredSize: PortalDemoDefaultSize.poweredSize,
    poweredImg: Powered,
    poweredImgRatio: PortalDemoDefaultSize.poweredImgRatio,
    termsCondition: '',
    componentDisplay: defaultComDisplay ,
    displayLangCode: 'en',
    wifi4EUNetworkId: '',
    alternativeLang: {
      cs: false,
      zh_TW: false,
      fi: false,
      fr: false,
      de: false,
      el: false,
      hu: false,
      it: false
    }
  }
}

export const portalTemaplteResponse: PortalSaveData = {
  id: '1',
  name: 'test111',
  content: {
    bgColor: 'var(--acx-primary-white)',
    bgImage: '',
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: 'var(--acx-primary-black)',
    welcomeSize: PortalDemoDefaultSize.welcomeSize,
    photo: Photo,
    photoRatio: PortalDemoDefaultSize.photoRatio,
    logo: Logo,
    logoRatio: PortalDemoDefaultSize.logoRatio,
    secondaryText: 'Lorem ipsum dolor sit amet, '+
      'consectetur adipiscing elit. Aenean euismod bibendum laoreet.',
    secondaryColor: 'var(--acx-primary-black)',
    secondarySize: PortalDemoDefaultSize.secondarySize,
    buttonColor: 'var(--acx-accents-orange-50)',
    poweredBgColor: 'var(--acx-primary-white)',
    poweredColor: 'var(--acx-primary-black)',
    poweredSize: PortalDemoDefaultSize.poweredSize,
    poweredImg: Powered,
    poweredImgRatio: PortalDemoDefaultSize.poweredImgRatio,
    termsCondition: '',
    componentDisplay: defaultComDisplay ,
    displayLangCode: 'en',
    wifi4EUNetworkId: '',
    alternativeLang: {
      cs: false,
      zh_TW: false,
      fi: false,
      fr: false,
      de: false,
      el: false,
      hu: false,
      it: false
    }
  }
}


export const createPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.CREATE })
export const editPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.EDIT })