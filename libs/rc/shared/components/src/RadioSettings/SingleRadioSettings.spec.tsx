/* eslint-disable testing-library/no-node-access */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { CapabilitiesApModel, FirmwareUrlsInfo } from '@acx-ui/rc/utils'
import { BrowserRouter as Router }               from '@acx-ui/react-router-dom'
import { Provider }                              from '@acx-ui/store'
import { cleanup, mockServer, render, screen }   from '@acx-ui/test-utils'

import { ApRadioTypeEnum,
  channelBandwidth24GOptions,
  channelBandwidth5GOptions,
  channelBandwidth6GOptions,
  split5GChannels,
  SupportRadioChannelsContext
} from './RadioSettingsContents'
import { SingleRadioSettings } from './SingleRadioSettings'

const validRadioChannels = {
  '2.4GChannels': {
    'auto': ['1','2','3','4','5','6','7','8','9','10','11'],
    '20MHz': ['1','2','3','4','5','6','7','8','9','10','11'],
    '40MHz': ['1','2','3','4', '5','6','7','8','9','10','11']
  },
  '5GChannels': {
    indoor: {
      'auto': ['36','40','44','48','52','56','60','64',
        '100','104','108','112','116','120','124','128',
        '132','136','140','144','149','153','157','161'
      ],
      '20MHz': ['36','40','44','48','52','56','60','64',
        '100','104','108','112','116','120','124','128',
        '132','136','140','144','149','153','157','161',
        '165'
      ],
      '40MHz': ['36','40','44','48',
        '52','56','60','64',
        '100','104','108','112',
        '116','120','124','128',
        '132','136','140','144',
        '149','153','157','161'
      ],
      '80MHz': ['36','40','44','48',
        '52','56','60','64',
        '100','104','108','112',
        '116','120','124','128',
        '132','136','140','144',
        '149','153','157','161'
      ],
      '160MHz': ['36','40','44','48','52','56','60','64',
        '100','104','108','112','116','120','124','128'
      ]
    },
    outdoor: {
      'auto': ['36','40','44','48','52','56','60','64',
        '100','104','108','112','116','120','124','128',
        '132','136','140','144','149','153','157','161'
      ],
      '20MHz': ['36','40','44','48','52','56','60','64',
        '100','104','108','112','116','120','124','128',
        '132','136','140','144','149','153','157','161','165'
      ],
      '40MHz': ['36','40','44','48',
        '52','56','60','64',
        '100','104','108','112',
        '116','120','124','128',
        '132','136','140','144',
        '149','153','157','161'
      ],
      '80MHz': ['36','40','44','48',
        '52','56','60','64',
        '100','104','108','112',
        '116','120','124','128',
        '132','136','140','144',
        '149','153','157','161'
      ],
      '160MHz': ['36','40','44','48','52','56','60','64',
        '100','104','108','112','116','120','124','128'
      ]
    },
    dfs: {
      'auto': ['52','56','60','64',
        '100','104','108','112',
        '116','120','124','128',
        '132','136','140','144'
      ],
      '20MHz': ['52','56','60','64',
        '100','104','108','112',
        '116','120','124','128',
        '132','136','140','144'
      ],
      '40MHz': ['52','56','60','64',
        '100','104','108','112',
        '116','120','124','128',
        '132','136','140','144'
      ],
      '80MHz': ['52','56','60','64',
        '100','104','108','112',
        '116','120','124','128',
        '132','136','140','144'
      ],
      '160MHz': ['52','56','60','64','100','104','108','112',
        '116','120','124','128','132','136','140','144'
      ]
    },
    indoorForOutdoorAp: {}
  },
  '5GLowerChannels': {
    indoor: {
      'auto': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '20MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '40MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '80MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '160MHz': ['36', '40', '44', '48', '52', '56', '60', '64']
    },
    outdoor: {
      'auto': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '20MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '40MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '80MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '160MHz': ['36', '40', '44', '48', '52', '56', '60', '64']
    },
    dfs: {
      'auto': ['52', '56', '60', '64'],
      '20MHz': ['52', '56', '60', '64'],
      '40MHz': ['52', '56', '60', '64'],
      '80MHz': ['52', '56', '60', '64'],
      '160MHz': ['52', '56', '60', '64']
    }
  },
  '5GUpperChannels': {
    indoor: {
      'auto': ['100','104','108','112',
        '116','120','124','128',
        '132','136','140','144',
        '149','153','157','161'
      ],
      '20MHz': ['100','104','108','112',
        '116','120','124','128',
        '132','136','140','144',
        '149','153','157','161',
        '165'
      ],
      '40MHz': ['100','104','108','112',
        '116','120','124','128',
        '132','136','140','144',
        '149','153','157','161'
      ],
      '80MHz': ['100','104','108','112',
        '116','120','124','128',
        '132','136','140','144',
        '149','153','157','161'
      ],
      '160MHz': ['100', '104', '108', '112', '116', '120', '124', '128']
    },
    outdoor: {
      'auto': ['100','104','108','112',
        '116','120','124','128',
        '132','136','140','144',
        '149','153','157','161'
      ],
      '20MHz': ['100','104','108','112',
        '116','120','124','128',
        '132','136','140','144',
        '149','153','157','161',
        '165'
      ],
      '40MHz': ['100','104','108','112',
        '116','120','124','128',
        '132','136','140','144',
        '149','153','157','161'
      ],
      '80MHz': ['100','104','108','112',
        '116','120','124','128',
        '132','136','140','144',
        '149','153','157','161'
      ],
      '160MHz': ['100', '104', '108', '112', '116', '120', '124', '128']
    },
    dfs: {
      'auto': ['100','104','108','112',
        '116','120','124','128',
        '132','136','140','144'
      ],
      '20MHz': ['100','104','108','112',
        '116','120','124','128',
        '132','136','140','144'
      ],
      '40MHz': ['100','104','108','112',
        '116','120','124','128',
        '132','136','140','144'
      ],
      '80MHz': ['100','104','108','112',
        '116','120','124','128',
        '132','136','140','144'
      ],
      '160MHz': ['100','104','108','112',
        '116','120','124','128',
        '132','136','140','144'
      ]
    }
  },
  '6GChannels': {
    'auto': ['1','5','9','13',
      '17','21','25','29',
      '33','37','41','45',
      '49','53','57','61',
      '65','69','73','77',
      '81','85','89','93',
      '97','101','105','109',
      '113','117','121','125',
      '129','133','137','141',
      '145','149','153','157',
      '161','165','169','173',
      '177','181','185','189',
      '193','197','201','205',
      '209','213','217','221'
    ],
    '20MHz': ['1','5','9','13',
      '17','21','25','29',
      '33','37','41','45',
      '49','53','57','61',
      '65','69','73','77',
      '81','85','89','93',
      '97','101','105','109',
      '113','117','121','125',
      '129','133','137','141',
      '145','149','153','157',
      '161','165','169','173',
      '177','181','185','189',
      '193','197','201','205',
      '209','213','217','221',
      '225','229','233'
    ],
    '40MHz': ['1','5','9','13',
      '17','21','25','29',
      '33','37','41','45',
      '49','53','57','61',
      '65','69','73','77',
      '81','85','89','93',
      '97','101','105','109',
      '113','117','121','125',
      '129','133','137','141',
      '145','149','153','157',
      '161','165','169','173',
      '177','181','185','189',
      '193','197','201','205',
      '209','213','217','221',
      '225','229'
    ],
    '80MHz': ['1','5','9','13',
      '17','21','25','29',
      '33','37','41','45',
      '49','53','57','61',
      '65','69','73','77',
      '81','85','89','93',
      '97','101','105','109',
      '113','117','121','125',
      '129','133','137','141',
      '145','149','153','157',
      '161','165','169','173',
      '177','181','185','189',
      '193','197','201','205',
      '209','213','217','221'
    ],
    '160MHz': ['1','5','9','13',
      '17','21','25','29',
      '33','37','41','45',
      '49','53','57','61',
      '65','69','73','77',
      '81','85','89','93',
      '97','101','105','109',
      '113','117','121','125',
      '129','133','137','141',
      '145','149','153','157',
      '161','165','169','173',
      '177','181','185','189',
      '193','197','201','205',
      '209','213','217','221'
    ]
  }
}

const valid6gSeparationRadioChannels = {
  '6GChannels': {
    'auto': [
      '1',
      '5',
      '9',
      '13',
      '17',
      '21',
      '25',
      '29',
      '33',
      '37',
      '41',
      '45',
      '49',
      '53',
      '57',
      '61',
      '65',
      '69',
      '73',
      '77',
      '81',
      '85',
      '89',
      '93',
      '97',
      '101',
      '105',
      '109',
      '113',
      '117',
      '121',
      '125',
      '129',
      '133',
      '137',
      '141',
      '145',
      '149',
      '153',
      '157',
      '161',
      '165',
      '169',
      '173',
      '177',
      '181',
      '185',
      '189',
      '193',
      '197',
      '201',
      '205',
      '209',
      '213',
      '217',
      '221'
    ],
    '20MHz': [
      '1',
      '5',
      '9',
      '13',
      '17',
      '21',
      '25',
      '29',
      '33',
      '37',
      '41',
      '45',
      '49',
      '53',
      '57',
      '61',
      '65',
      '69',
      '73',
      '77',
      '81',
      '85',
      '89',
      '93',
      '97',
      '101',
      '105',
      '109',
      '113',
      '117',
      '121',
      '125',
      '129',
      '133',
      '137',
      '141',
      '145',
      '149',
      '153',
      '157',
      '161',
      '165',
      '169',
      '173',
      '177',
      '181',
      '185',
      '189',
      '193',
      '197',
      '201',
      '205',
      '209',
      '213',
      '217',
      '221',
      '225',
      '229',
      '233'
    ],
    '40MHz': [
      '1',
      '5',
      '9',
      '13',
      '17',
      '21',
      '25',
      '29',
      '33',
      '37',
      '41',
      '45',
      '49',
      '53',
      '57',
      '61',
      '65',
      '69',
      '73',
      '77',
      '81',
      '85',
      '89',
      '93',
      '97',
      '101',
      '105',
      '109',
      '113',
      '117',
      '121',
      '125',
      '129',
      '133',
      '137',
      '141',
      '145',
      '149',
      '153',
      '157',
      '161',
      '165',
      '169',
      '173',
      '177',
      '181',
      '185',
      '189',
      '193',
      '197',
      '201',
      '205',
      '209',
      '213',
      '217',
      '221',
      '225',
      '229'
    ],
    '80MHz': [
      '1',
      '5',
      '9',
      '13',
      '17',
      '21',
      '25',
      '29',
      '33',
      '37',
      '41',
      '45',
      '49',
      '53',
      '57',
      '61',
      '65',
      '69',
      '73',
      '77',
      '81',
      '85',
      '89',
      '93',
      '97',
      '101',
      '105',
      '109',
      '113',
      '117',
      '121',
      '125',
      '129',
      '133',
      '137',
      '141',
      '145',
      '149',
      '153',
      '157',
      '161',
      '165',
      '169',
      '173',
      '177',
      '181',
      '185',
      '189',
      '193',
      '197',
      '201',
      '205',
      '209',
      '213',
      '217',
      '221'
    ],
    '160MHz': [
      '1',
      '5',
      '9',
      '13',
      '17',
      '21',
      '25',
      '29',
      '33',
      '37',
      '41',
      '45',
      '49',
      '53',
      '57',
      '61',
      '65',
      '69',
      '73',
      '77',
      '81',
      '85',
      '89',
      '93',
      '97',
      '101',
      '105',
      '109',
      '113',
      '117',
      '121',
      '125',
      '129',
      '133',
      '137',
      '141',
      '145',
      '149',
      '153',
      '157',
      '161',
      '165',
      '169',
      '173',
      '177',
      '181',
      '185',
      '189',
      '193',
      '197',
      '201',
      '205',
      '209',
      '213',
      '217',
      '221'
    ],
    '320MHz': [
      '1',
      '5',
      '9',
      '13',
      '17',
      '21',
      '25',
      '29',
      '33',
      '37',
      '41',
      '45',
      '49',
      '53',
      '57',
      '61',
      '65',
      '69',
      '73',
      '77',
      '81',
      '85',
      '89',
      '93',
      '97',
      '101',
      '105',
      '109',
      '113',
      '117',
      '121',
      '125',
      '129',
      '133',
      '137',
      '141',
      '145',
      '149',
      '153',
      '157',
      '161',
      '165',
      '169',
      '173',
      '177',
      '181',
      '185',
      '189',
      '193',
      '197',
      '201',
      '205',
      '209',
      '213',
      '217',
      '221'
    ],
    'indoor': {
      'auto': [
        '1',
        '5',
        '9',
        '13',
        '17',
        '21',
        '25',
        '29',
        '33',
        '37',
        '41',
        '45',
        '49',
        '53',
        '57',
        '61',
        '65',
        '69',
        '73',
        '77',
        '81',
        '85',
        '89',
        '93',
        '97',
        '101',
        '105',
        '109',
        '113',
        '117',
        '121',
        '125',
        '129',
        '133',
        '137',
        '141',
        '145',
        '149',
        '153',
        '157',
        '161',
        '165',
        '169',
        '173',
        '177',
        '181',
        '185',
        '189',
        '193',
        '197',
        '201',
        '205',
        '209',
        '213',
        '217',
        '221'
      ],
      '20MHz': [
        '1',
        '5',
        '9',
        '13',
        '17',
        '21',
        '25',
        '29',
        '33',
        '37',
        '41',
        '45',
        '49',
        '53',
        '57',
        '61',
        '65',
        '69',
        '73',
        '77',
        '81',
        '85',
        '89',
        '93',
        '97',
        '101',
        '105',
        '109',
        '113',
        '117',
        '121',
        '125',
        '129',
        '133',
        '137',
        '141',
        '145',
        '149',
        '153',
        '157',
        '161',
        '165',
        '169',
        '173',
        '177',
        '181',
        '185',
        '189',
        '193',
        '197',
        '201',
        '205',
        '209',
        '213',
        '217',
        '221',
        '225',
        '229',
        '233'
      ],
      '40MHz': [
        '1',
        '5',
        '9',
        '13',
        '17',
        '21',
        '25',
        '29',
        '33',
        '37',
        '41',
        '45',
        '49',
        '53',
        '57',
        '61',
        '65',
        '69',
        '73',
        '77',
        '81',
        '85',
        '89',
        '93',
        '97',
        '101',
        '105',
        '109',
        '113',
        '117',
        '121',
        '125',
        '129',
        '133',
        '137',
        '141',
        '145',
        '149',
        '153',
        '157',
        '161',
        '165',
        '169',
        '173',
        '177',
        '181',
        '185',
        '189',
        '193',
        '197',
        '201',
        '205',
        '209',
        '213',
        '217',
        '221',
        '225',
        '229'
      ],
      '80MHz': [
        '1',
        '5',
        '9',
        '13',
        '17',
        '21',
        '25',
        '29',
        '33',
        '37',
        '41',
        '45',
        '49',
        '53',
        '57',
        '61',
        '65',
        '69',
        '73',
        '77',
        '81',
        '85',
        '89',
        '93',
        '97',
        '101',
        '105',
        '109',
        '113',
        '117',
        '121',
        '125',
        '129',
        '133',
        '137',
        '141',
        '145',
        '149',
        '153',
        '157',
        '161',
        '165',
        '169',
        '173',
        '177',
        '181',
        '185',
        '189',
        '193',
        '197',
        '201',
        '205',
        '209',
        '213',
        '217',
        '221'
      ],
      '160MHz': [
        '1',
        '5',
        '9',
        '13',
        '17',
        '21',
        '25',
        '29',
        '33',
        '37',
        '41',
        '45',
        '49',
        '53',
        '57',
        '61',
        '65',
        '69',
        '73',
        '77',
        '81',
        '85',
        '89',
        '93',
        '97',
        '101',
        '105',
        '109',
        '113',
        '117',
        '121',
        '125',
        '129',
        '133',
        '137',
        '141',
        '145',
        '149',
        '153',
        '157',
        '161',
        '165',
        '169',
        '173',
        '177',
        '181',
        '185',
        '189',
        '193',
        '197',
        '201',
        '205',
        '209',
        '213',
        '217',
        '221'
      ],
      '320MHz': [
        '1',
        '5',
        '9',
        '13',
        '17',
        '21',
        '25',
        '29',
        '33',
        '37',
        '41',
        '45',
        '49',
        '53',
        '57',
        '61',
        '65',
        '69',
        '73',
        '77',
        '81',
        '85',
        '89',
        '93',
        '97',
        '101',
        '105',
        '109',
        '113',
        '117',
        '121',
        '125',
        '129',
        '133',
        '137',
        '141',
        '145',
        '149',
        '153',
        '157',
        '161',
        '165',
        '169',
        '173',
        '177',
        '181',
        '185',
        '189',
        '193',
        '197',
        '201',
        '205',
        '209',
        '213',
        '217',
        '221'
      ]
    },
    'outdoor': {
      'auto': [
        '1',
        '5',
        '9',
        '13',
        '17',
        '21',
        '25',
        '29',
        '33',
        '37',
        '41',
        '45',
        '49',
        '53',
        '57',
        '61',
        '65',
        '69',
        '73',
        '77',
        '81',
        '85',
        '89',
        '93',
        '129',
        '133',
        '137',
        '141',
        '145',
        '149',
        '153',
        '157'
      ],
      '20MHz': [
        '1',
        '5',
        '9',
        '13',
        '17',
        '21',
        '25',
        '29',
        '33',
        '37',
        '41',
        '45',
        '49',
        '53',
        '57',
        '61',
        '65',
        '69',
        '73',
        '77',
        '81',
        '85',
        '89',
        '93',
        '117',
        '121',
        '125',
        '129',
        '133',
        '137',
        '141',
        '145',
        '149',
        '153',
        '157',
        '161',
        '165',
        '169',
        '173',
        '177',
        '181'
      ],
      '40MHz': [
        '1',
        '5',
        '9',
        '13',
        '17',
        '21',
        '25',
        '29',
        '33',
        '37',
        '41',
        '45',
        '49',
        '53',
        '57',
        '61',
        '65',
        '69',
        '73',
        '77',
        '81',
        '85',
        '89',
        '93',
        '121',
        '125',
        '129',
        '133',
        '137',
        '141',
        '145',
        '149',
        '153',
        '157',
        '161',
        '165',
        '169',
        '173',
        '177',
        '181'
      ],
      '80MHz': [
        '1',
        '5',
        '9',
        '13',
        '17',
        '21',
        '25',
        '29',
        '33',
        '37',
        '41',
        '45',
        '49',
        '53',
        '57',
        '61',
        '65',
        '69',
        '73',
        '77',
        '81',
        '85',
        '89',
        '93',
        '129',
        '133',
        '137',
        '141',
        '145',
        '149',
        '153',
        '157',
        '161',
        '165',
        '169',
        '173'
      ],
      '160MHz': [
        '1',
        '5',
        '9',
        '13',
        '17',
        '21',
        '25',
        '29',
        '33',
        '37',
        '41',
        '45',
        '49',
        '53',
        '57',
        '61',
        '65',
        '69',
        '73',
        '77',
        '81',
        '85',
        '89',
        '93',
        '129',
        '133',
        '137',
        '141',
        '145',
        '149',
        '153',
        '157'
      ],
      '320MHz': [
        '1',
        '5',
        '9',
        '13',
        '17',
        '21',
        '25',
        '29',
        '33',
        '37',
        '41',
        '45',
        '49',
        '53',
        '57',
        '61',
        '65',
        '69',
        '73',
        '77',
        '81',
        '85',
        '89',
        '93'
      ]
    }
  }
}

const bandwidthRadioOptions = {
  [ApRadioTypeEnum.Radio24G]: channelBandwidth24GOptions,
  [ApRadioTypeEnum.Radio5G]: channelBandwidth5GOptions,
  [ApRadioTypeEnum.Radio6G]: channelBandwidth6GOptions,
  [ApRadioTypeEnum.RadioLower5G]: channelBandwidth5GOptions,
  [ApRadioTypeEnum.RadioUpper5G]: channelBandwidth5GOptions
}

const supportRadioChannels = {
  [ApRadioTypeEnum.Radio24G]: validRadioChannels['2.4GChannels'],
  [ApRadioTypeEnum.Radio5G]: validRadioChannels['5GChannels'],
  [ApRadioTypeEnum.Radio6G]: validRadioChannels['6GChannels'],
  [ApRadioTypeEnum.RadioLower5G]: validRadioChannels['5GLowerChannels'],
  [ApRadioTypeEnum.RadioUpper5G]: validRadioChannels['5GUpperChannels']
}

const support6gSeparationChannels = {
  [ApRadioTypeEnum.Radio24G]: validRadioChannels['2.4GChannels'],
  [ApRadioTypeEnum.Radio5G]: validRadioChannels['5GChannels'],
  [ApRadioTypeEnum.Radio6G]: valid6gSeparationRadioChannels['6GChannels'],
  [ApRadioTypeEnum.RadioLower5G]: validRadioChannels['5GLowerChannels'],
  [ApRadioTypeEnum.RadioUpper5G]: validRadioChannels['5GUpperChannels']
}

const mockedApModelFamilies = [
  {
    name: 'WIFI_6E',
    displayName: 'Wi-Fi 6e',
    apModels: ['R560',' R760']
  },
  {
    name: 'WIFI_7',
    displayName: 'Wi-Fi 7',
    apModels: ['R770', 'R670', 'T670', 'T670SN', 'H670']
  }
]

jest.mock('./RadioSettingsContents', () => ({
  ...jest.requireActual('./RadioSettingsContents'),
  txPowerAdjustmentOptions: [
    { label: 'Auto', value: 'Auto' },
    { label: 'Full', value: 'MAX' },
    { label: 'txPowerOption', value: 'txPowerOption' }
  ],
  txPowerAdjustment6GOptions: [
    { label: 'Full', value: 'MAX' },
    { label: 'txPowerOption', value: 'txPowerOption' },
    { label: 'txPower6gOption', value: 'txPower6gOption' }
  ],
  txPowerAdjustmentExtendedOptions: [{ label: 'txPowerExtendedOption',
    value: 'txPowerExtendedOption' }]
}))

const resetToDefaultSpy = jest.fn()
describe('SignaleRadioSettings component', () => {
  beforeEach(() => {
    resetToDefaultSpy.mockClear()
    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getApModelFamilies.url,
        (_, res, ctx) => res(ctx.json(mockedApModelFamilies)))
    )
  })
  afterEach(() => cleanup())

  it('should render Venue Radio 24G singleRadioSettings', async () => {
    const radioType = ApRadioTypeEnum.Radio24G
    const { asFragment } = render (
      <Provider>
        <Router>
          <Form>
            <SupportRadioChannelsContext.Provider value={{
              bandwidthRadioOptions,
              supportRadioChannels
            }}>
              <SingleRadioSettings
                radioType={radioType}
                onResetDefaultValue={resetToDefaultSpy}
              />
            </SupportRadioChannelsContext.Provider>
          </Form>
        </Router>
      </Provider>
    )

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')
    await userEvent.click(channelSelect)
    await userEvent.click((await screen.findByTitle('ChannelFly')))

    const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)
    expect((await screen.findByTitle('40 MHz'))).toBeDefined()
    await userEvent.click((await screen.findByTitle('40 MHz')))

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findByTitle('Full')))

    const resetDefaultBtn = await screen.findByRole('button',
      { name: /Reset to Default Settings/i })
    expect(resetDefaultBtn).not.toEqual(null)
    expect(resetToDefaultSpy).not.toHaveBeenCalled()
    await userEvent.click(resetDefaultBtn)
    expect(resetToDefaultSpy).toHaveBeenCalled()

    const channelSelecter = asFragment().querySelector('#radioParams24G_allowedChannels')
    expect(channelSelecter).toEqual(expect.anything())
  })

  it('should render Venue Radio 5G singleRadioSettings', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const radioType = ApRadioTypeEnum.Radio5G

    const { asFragment } = render (
      <Provider>
        <Router>
          <Form>
            <SupportRadioChannelsContext.Provider value={{
              bandwidthRadioOptions,
              supportRadioChannels
            }}>
              <SingleRadioSettings
                radioType={radioType}
                onResetDefaultValue={resetToDefaultSpy}
              />
            </SupportRadioChannelsContext.Provider>
          </Form>
        </Router>
      </Provider>
    )

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')
    await userEvent.click(channelSelect)
    await userEvent.click((await screen.findByTitle('ChannelFly')))

    const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)
    expect((await screen.findByTitle('80 MHz'))).toBeDefined()
    await userEvent.click((await screen.findByTitle('80 MHz')))

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findByTitle('Full')))

    const resetDefaultBtn = await screen.findByRole('button',
      { name: /Reset to Default Settings/i })
    expect(resetDefaultBtn).not.toEqual(null)
    expect(resetToDefaultSpy).not.toHaveBeenCalled()
    await userEvent.click(resetDefaultBtn)
    expect(resetToDefaultSpy).toHaveBeenCalled()

    const indoorChannelsId = '#radioParams50G_allowedIndoorChannels'
    const outdoorChannelsId = '#radioParams50G_allowedOutdoorChannels'

    const indoorChannelSelecter = asFragment().querySelector(indoorChannelsId)
    expect(indoorChannelSelecter).toEqual(expect.anything())

    const outdoorChannelSelecter = asFragment().querySelector(outdoorChannelsId)
    expect(outdoorChannelSelecter).toEqual(expect.anything())
  })

  it('should render Venue Radio 6G singleRadioSettings', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.ACX_UI_VENUE_CHANNEL_SELECTION_MANUAL)
    const radioType = ApRadioTypeEnum.Radio6G

    const { asFragment } = render (
      <Provider>
        <Router>
          <Form>
            <SupportRadioChannelsContext.Provider value={{
              bandwidthRadioOptions,
              supportRadioChannels
            }}>
              <SingleRadioSettings
                radioType={radioType}
                onResetDefaultValue={resetToDefaultSpy}
              />
            </SupportRadioChannelsContext.Provider>
          </Form>
        </Router>
      </Provider>
    )

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).toHaveAttribute('disabled')

    const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)
    expect((await screen.findByTitle('40 MHz'))).toBeDefined()
    await userEvent.click((await screen.findByTitle('40 MHz')))

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findByTitle('Full')))

    const resetDefaultBtn = await screen.findByRole('button',
      { name: /Reset to Default Settings/i })
    expect(resetDefaultBtn).not.toEqual(null)
    expect(resetToDefaultSpy).not.toHaveBeenCalled()
    await userEvent.click(resetDefaultBtn)
    expect(resetToDefaultSpy).toHaveBeenCalled()

    const channelSelecter = asFragment().querySelector('#radioParams6G_allowedChannels')
    expect(channelSelecter).toEqual(expect.anything())

  })

  it('should render Venue Radio 6G indoor outdoor separation singleRadioSettings', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.ACX_UI_VENUE_CHANNEL_SELECTION_MANUAL)
    const radioType = ApRadioTypeEnum.Radio6G

    const { asFragment } = render (
      <Provider>
        <Router>
          <Form>
            <SupportRadioChannelsContext.Provider value={{
              bandwidthRadioOptions,
              supportRadioChannels: support6gSeparationChannels
            }}>
              <SingleRadioSettings
                radioType={radioType}
                onResetDefaultValue={resetToDefaultSpy}
              />
            </SupportRadioChannelsContext.Provider>
          </Form>
        </Router>
      </Provider>
    )

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).toHaveAttribute('disabled')

    const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)
    expect((await screen.findByTitle('40 MHz'))).toBeDefined()
    await userEvent.click((await screen.findByTitle('40 MHz')))

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findByTitle('Full')))

    const resetDefaultBtn = await screen.findByRole('button',
      { name: /Reset to Default Settings/i })
    expect(resetDefaultBtn).not.toEqual(null)
    expect(resetToDefaultSpy).not.toHaveBeenCalled()
    await userEvent.click(resetDefaultBtn)
    expect(resetToDefaultSpy).toHaveBeenCalled()

    const channelIndoorSelecter = asFragment().querySelector('#radioParams6G_allowedIndoorChannels')
    expect(channelIndoorSelecter).toEqual(expect.anything())

    const channelOutdoorSelecter = asFragment()
      .querySelector('#radioParams6G_allowedOutdoorChannels')
    expect(channelOutdoorSelecter).toEqual(expect.anything())
  })

  it('should render AP Radio 24G singleRadioSettings', async () => {
    const radioType = ApRadioTypeEnum.Radio24G

    const { asFragment } = render (
      <Provider>
        <Router>
          <Form>
            <SupportRadioChannelsContext.Provider value={{
              bandwidthRadioOptions,
              supportRadioChannels
            }}>
              <SingleRadioSettings
                context='ap'
                radioType={radioType}
                isUseVenueSettings={false}
              />
            </SupportRadioChannelsContext.Provider>
          </Form>
        </Router>
      </Provider>
    )

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')
    await userEvent.click(channelSelect)
    expect(await screen.findByTitle('Manual channel selection')).toBeDefined()
    await userEvent.click((await screen.findByTitle('Manual channel selection')))

    const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)

    await userEvent.click((await screen.findByRole('option', { name: 'Auto' })))

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findByTitle('Full')))

    const channelSelecter = asFragment().querySelector('#apRadioParams24G_allowedChannels')
    expect(channelSelecter).toEqual(expect.anything())
  })

  it('should render AP Radio 6G singleRadioSettings', async () => {
    const radioType = ApRadioTypeEnum.Radio6G

    const { asFragment } = render (
      <Provider>
        <Router>
          <Form>
            <SupportRadioChannelsContext.Provider value={{
              bandwidthRadioOptions,
              supportRadioChannels
            }}>
              <SingleRadioSettings
                context='ap'
                radioType={radioType}
                isUseVenueSettings={false}
              />
            </SupportRadioChannelsContext.Provider>
          </Form>
        </Router>
      </Provider>
    )

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')
    await userEvent.click(channelSelect)
    expect(await screen.findByTitle('Manual channel selection')).toBeDefined()
    await userEvent.click((await screen.findByTitle('Manual channel selection')))

    const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)
    await userEvent.click((await screen.findByRole('option', { name: 'Auto' })))

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findByTitle('Full')))

    const channelSelecter = asFragment().querySelector('#apRadioParams6G_allowedChannels')
    expect(channelSelecter).toEqual(expect.anything())
  })

  it ('test the split5GChannels function', () => {
    const channels = validRadioChannels['5GChannels'].indoor['160MHz']
    const { lower5GChannels, upper5GChannels } = split5GChannels(channels)

    expect(lower5GChannels).toEqual(['36','40','44','48','52','56','60','64'])
    expect(upper5GChannels).toEqual(['100','104','108','112','116','120','124','128'])
  })

  it ('should show not support info when no bandwidthOptions', async () => {
    const radioType = ApRadioTypeEnum.Radio6G
    const bandwidthRadioOptions = {
      [ApRadioTypeEnum.Radio24G]: channelBandwidth24GOptions,
      [ApRadioTypeEnum.Radio5G]: channelBandwidth5GOptions,
      [ApRadioTypeEnum.Radio6G]: [],
      [ApRadioTypeEnum.RadioLower5G]: channelBandwidth5GOptions,
      [ApRadioTypeEnum.RadioUpper5G]: channelBandwidth5GOptions
    }

    render (
      <Provider>
        <Router>
          <Form>
            <SupportRadioChannelsContext.Provider value={{
              bandwidthRadioOptions,
              supportRadioChannels
            }}>
              <SingleRadioSettings
                radioType={radioType}
              />
            </SupportRadioChannelsContext.Provider>
          </Form>
        </Router>
      </Provider>
    )

    const noSupportInfoDiv = await screen
      .findByText('This band is not supported for APs in current country')
    expect(noSupportInfoDiv).toEqual(expect.anything())
  })

  // eslint-disable-next-line max-len
  it('should show tx power extended options when AP version is larger than 7.1.1', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.AP_TX_POWER_TOGGLE)
    const radioType = ApRadioTypeEnum.Radio24G

    render (
      <Provider>
        <Router>
          <Form>
            <SupportRadioChannelsContext.Provider value={{
              bandwidthRadioOptions,
              supportRadioChannels
            }}>
              <SingleRadioSettings
                context='ap'
                radioType={radioType}
                isUseVenueSettings={false}
                firmwareProps={{ firmware: '7.1.1.103.2' }}
              />
            </SupportRadioChannelsContext.Provider>
          </Form>
        </Router>
      </Provider>
    )

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    expect(screen.getByTitle('txPowerOption')).not.toBeNull()
    expect(screen.queryByTitle('txPower6gOption')).toBeNull()
    expect(screen.getByTitle('txPowerExtendedOption')).not.toBeNull()
  })

  it('should not show tx power extended options when AP version is small than 7.1', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.AP_TX_POWER_TOGGLE)
    const radioType = ApRadioTypeEnum.Radio24G

    render (
      <Provider>
        <Router>
          <Form>
            <SupportRadioChannelsContext.Provider value={{
              bandwidthRadioOptions,
              supportRadioChannels
            }}>
              <SingleRadioSettings
                context='ap'
                radioType={radioType}
                isUseVenueSettings={false}
                firmwareProps={{ firmware: '7.0.0.103.2' }}
              />
            </SupportRadioChannelsContext.Provider>
          </Form>
        </Router>
      </Provider>
    )

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    expect(screen.getByTitle('txPowerOption')).not.toBeNull()
    expect(screen.queryByTitle('txPower6gOption')).toBeNull()
    expect(screen.queryByTitle('txPowerExtendedOption')).toBeNull()
  })

  it('No tx power extended options when supportAggressiveTxPower is false at AP', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const radioType = ApRadioTypeEnum.Radio24G

    render (
      <Provider>
        <Router>
          <Form>
            <SupportRadioChannelsContext.Provider value={{
              bandwidthRadioOptions,
              supportRadioChannels
            }}>
              <SingleRadioSettings
                context='ap'
                radioType={radioType}
                isUseVenueSettings={false}
                firmwareProps={{ firmware: '7.1.1.103.2' }}
                apCapabilities={
                  { supportTriRadio: false,
                    supportAutoCellSizing: true,
                    supportAggressiveTxPower: false
                  } as CapabilitiesApModel}
              />
            </SupportRadioChannelsContext.Provider>
          </Form>
        </Router>
      </Provider>
    )

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    expect(screen.getByTitle('Auto')).not.toBeNull()
    expect(screen.getByTitle('txPowerOption')).not.toBeNull()
    expect(screen.queryByTitle('txPower6gOption')).toBeNull()
    expect(screen.queryByTitle('txPowerExtendedOption')).toBeNull()
  })

  it('No tx power auto options when supportAutoCellSizing is false at AP', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const radioType = ApRadioTypeEnum.Radio24G

    render (
      <Provider>
        <Router>
          <Form>
            <SupportRadioChannelsContext.Provider value={{
              bandwidthRadioOptions,
              supportRadioChannels
            }}>
              <SingleRadioSettings
                context='ap'
                radioType={radioType}
                isUseVenueSettings={false}
                firmwareProps={{ firmware: '7.1.1.103.2' }}
                apCapabilities={
                  { supportTriRadio: false,
                    supportAutoCellSizing: false
                  } as CapabilitiesApModel}
              />
            </SupportRadioChannelsContext.Provider>
          </Form>
        </Router>
      </Provider>
    )

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    expect(screen.queryByTitle('Auto')).toBeNull()
  })
})
