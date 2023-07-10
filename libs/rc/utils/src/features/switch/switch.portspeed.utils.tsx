import _ from 'lodash'

import { SwitchPortViewModel } from '../../types'

interface MODELS_PORTSPEED {
  start?: string,
  end?: string,
  capacity: string[]
}

/* eslint-disable max-len */
const ICX_MODELS_PORTSPEED: Record<string, MODELS_PORTSPEED | MODELS_PORTSPEED[]> = {
  'DEFAULT': {
    capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL',
      'ONE_HUNDRED_M_HALF', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE', 'TWO_POINT_FIVE_G_FULL',
      'TWO_POINT_FIVE_G_FULL_MASTER', 'TWO_POINT_FIVE_G_FULL_SLAVE', 'FIVE_G_FULL', 'FIVE_G_FULL_MASTER',
      'FIVE_G_FULL_SLAVE', 'TEN_G_FULL', 'TEN_G_FULL_MASTER', 'TEN_G_FULL_SLAVE', 'TWENTY_FIVE_G_FULL',
      'FORTY_G_FULL', 'ONE_HUNDRED_G_FULL', 'OPTIC']
  },

  'ICX7750-48C': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE', 'TEN_G_FULL',
        'TEN_G_FULL_MASTER', 'TEN_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/6',
      capacity: ['NONE', 'FORTY_G_FULL']
    }, {
      start: '1/3/1', end: '1/3/6',
      capacity: ['NONE', 'FORTY_G_FULL']
    }
  ],

  'ICX7750-48F': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }, {
      start: '1/2/1', end: '1/2/6',
      capacity: ['NONE', 'FORTY_G_FULL']
    }, {
      start: '1/3/1', end: '1/3/6',
      capacity: ['NONE', 'FORTY_G_FULL']
    }
  ],

  'ICX7750-26Q': [
    {
      start: '1/1/1', end: '1/1/20',
      capacity: ['NONE', 'FORTY_G_FULL']
    }, {
      start: '1/2/1', end: '1/2/6',
      capacity: ['NONE', 'FORTY_G_FULL']
    },
    {
      start: '1/3/1', end: '1/3/6',
      capacity: ['NONE', 'FORTY_G_FULL']
    }
  ],

  'ICX7250-24L': [
    {
      start: '1/1/1', end: '1/1/24',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'ONE_HUNDRED_M_FULL',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE', 'FORTY_G_FULL']
    }, {
      start: '1/2/1', end: '1/2/4',
      capacity: ['NONE', 'ONE_G_FULL']
    }
  ],

  'ICX7250-24': [
    {
      start: '1/1/1', end: '1/1/24',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER',
        'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/8',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }
  ],

  'ICX7250-24P': [
    {
      start: '1/1/1', end: '1/1/24',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER',
        'ONE_G_FULL_SLAVE']
    },
    {
      start: '1/2/1', end: '1/2/8',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }
  ],

  'ICX7250-48': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER',
        'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/8',
      capacity: ['NONE', 'AUTO', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }
  ],

  'ICX7250-48P': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER',
        'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/8',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }
  ],
  'ICX7450-24': [
    {
      start: '1/1/1', end: '1/1/24',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }
  ],

  'ICX7450-24P': [
    {
      start: '1/1/1', end: '1/1/24',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }
  ],

  'ICX7450-48': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }
  ],

  'ICX7400-1X40GQ': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'FORTY_G_FULL']
    }
  ],

  'ICX7400-4X10GF': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'FORTY_G_FULL', 'OPTIC']
    }
  ],

  'ICX7400-4X10GC': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'FORTY_G_FULL']
    }
  ],

  'ICX7400-4X1GF': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'FORTY_G_FULL']
    }
  ],

  'ICX7450-32P': [{
    start: '1/1/1', end: '1/1/24',
    capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
      'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
  }, {
    start: '1/1/25', end: '1/1/32',
    capacity: ['NONE', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE',
      'TWO_POINT_FIVE_G_FULL', 'TWO_POINT_FIVE_G_FULL_MASTER', 'TWO_POINT_FIVE_G_FULL_SLAVE']
  }],

  'ICX7550-24': [{
    start: '1/1/1', end: '1/1/24',
    capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
      'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
  }, {
    start: '1/2/1', end: '1/2/2',
    capacity: ['NONE', 'FORTY_G_FULL']
  }],

  'ICX7550-24P': [{
    start: '1/1/1', end: '1/1/24',
    capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
      'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
  }, {
    start: '1/2/1', end: '1/2/2',
    capacity: ['NONE', 'FORTY_G_FULL']
  }],

  'ICX7550-48': [{
    start: '1/1/1', end: '1/1/48',
    capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
      'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
  }, {
    start: '1/2/1', end: '1/2/2',
    capacity: ['NONE', 'FORTY_G_FULL']
  }],

  'ICX7550-48P': [{
    start: '1/1/1', end: '1/1/48',
    capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
      'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
  }, {
    start: '1/2/1', end: '1/2/2',
    capacity: ['NONE', 'FORTY_G_FULL']
  }],

  'ICX7550-24ZP': [{
    start: '1/1/1', end: '1/1/12',
    capacity: ['NONE', 'AUTO', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE', 'TWO_POINT_FIVE_G_FULL',
      'TWO_POINT_FIVE_G_FULL_MASTER', 'TWO_POINT_FIVE_G_FULL_SLAVE']
  }, {
    start: '1/1/13', end: '1/1/24',
    capacity: ['NONE', 'AUTO', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE', 'TWO_POINT_FIVE_G_FULL',
      'TWO_POINT_FIVE_G_FULL_MASTER', 'TWO_POINT_FIVE_G_FULL_SLAVE', 'FIVE_G_FULL', 'FIVE_G_FULL_MASTER', 'FIVE_G_FULL_SLAVE',
      'TEN_G_FULL', 'TEN_G_FULL_MASTER', 'TEN_G_FULL_SLAVE']
  }, {
    start: '1/2/1', end: '1/2/2',
    capacity: ['NONE', 'FORTY_G_FULL', 'ONE_HUNDRED_G_FULL']
  }],

  'ICX7550-48ZP': [{
    start: '1/1/1', end: '1/1/36',
    capacity: ['NONE', 'AUTO', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE', 'TWO_POINT_FIVE_G_FULL',
      'TWO_POINT_FIVE_G_FULL_MASTER', 'TWO_POINT_FIVE_G_FULL_SLAVE']
  }, {
    start: '1/1/37', end: '1/1/48',
    capacity: ['NONE', 'AUTO', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE', 'TWO_POINT_FIVE_G_FULL',
      'TWO_POINT_FIVE_G_FULL_MASTER', 'TWO_POINT_FIVE_G_FULL_SLAVE', 'FIVE_G_FULL', 'FIVE_G_FULL_MASTER', 'FIVE_G_FULL_SLAVE',
      'TEN_G_FULL', 'TEN_G_FULL_MASTER', 'TEN_G_FULL_SLAVE']
  }, {
    start: '1/2/1', end: '1/2/2',
    capacity: ['NONE', 'FORTY_G_FULL', 'ONE_HUNDRED_G_FULL']
  }],

  'ICX7550-24F': [{
    start: '1/1/1', end: '1/1/24',
    capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
  }, {
    start: '1/2/1', end: '1/2/2',
    capacity: ['NONE', 'FORTY_G_FULL', 'ONE_HUNDRED_G_FULL']
  }],

  'ICX7550-48F': [{
    start: '1/1/1', end: '1/1/36',
    capacity: ['NONE', 'ONE_G_FULL']
  }, {
    start: '1/1/37', end: '1/1/48',
    capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
  }, {
    start: '1/2/1', end: '1/2/2',
    capacity: ['NONE', 'FORTY_G_FULL', 'ONE_HUNDRED_G_FULL']
  }],

  'ICX7150-C12P': [{
    start: '1/1/1', end: '1/1/12',
    capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
      'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
  }, {
    start: '1/2/1', end: '1/2/2',
    capacity: [
      'NONE', 'AUTO', 'TEN_M_FULL', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE'
    ]
  }, {
    start: '1/3/1', end: '1/3/2',
    capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
  }],

  'ICX7150-24': [
    {
      start: '1/1/1', end: '1/1/24',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/2',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER',
        'ONE_G_FULL_SLAVE']
    }, {
      start: '1/3/1', end: '1/3/4',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }
  ],

  'ICX7150-24P': [
    {
      start: '1/1/1', end: '1/1/24',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/2',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER',
        'ONE_G_FULL_SLAVE']
    }, {
      start: '1/3/1', end: '1/3/4',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }
  ],

  'ICX7150-48': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/2',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER',
        'ONE_G_FULL_SLAVE']
    }, {
      start: '1/3/1', end: '1/3/4',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }
  ],

  'ICX7150-48P': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/2',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER',
        'ONE_G_FULL_SLAVE']
    }, {
      start: '1/3/1', end: '1/3/4',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }
  ],

  'ICX7150-48PF': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/2',
      capacity: ['AUTO', 'TEN_M_FULL', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER',
        'ONE_G_FULL_SLAVE']
    }, {
      start: '1/3/1', end: '1/3/4',
      capacity: ['ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }
  ],

  'ICX7150-48ZP': [
    {
      start: '1/1/1', end: '1/1/16',
      capacity: ['NONE', 'AUTO', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER',
        'ONE_G_FULL_SLAVE', 'TWO_POINT_FIVE_G_FULL', 'TWO_POINT_FIVE_G_FULL_MASTER',
        'TWO_POINT_FIVE_G_FULL_SLAVE']
    }, {
      start: '1/1/17', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/8',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }
  ],

  'ICX7150-C08P': [
    {
      start: '1/1/1', end: '1/1/8',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/8',
      capacity: ['NONE', 'ONE_G_FULL']
    }
  ],

  'ICX7150-C08PT': [
    {
      start: '1/1/1', end: '1/1/8',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/8',
      capacity: ['NONE', 'ONE_G_FULL']
    }
  ],

  'ICX7150-C10ZP': [
    {
      start: '1/1/1', end: '1/1/8',
      capacity: ['NONE', 'AUTO', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE',
        'TWO_POINT_FIVE_G_FULL', 'TWO_POINT_FIVE_G_FULL_MASTER', 'TWO_POINT_FIVE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/2',
      capacity: ['NONE', 'AUTO', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE',
        'TWO_POINT_FIVE_G_FULL', 'TWO_POINT_FIVE_G_FULL_MASTER', 'TWO_POINT_FIVE_G_FULL_SLAVE', 'FIVE_G_FULL',
        'FIVE_G_FULL_MASTER', 'FIVE_G_FULL_SLAVE', 'TEN_G_FULL', 'TEN_G_FULL_MASTER', 'TEN_G_FULL_SLAVE']
    }, {
      start: '1/3/1', end: '1/3/4',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }
  ],

  'ICX7150-24F': [
    {
      start: '1/1/1', end: '1/1/24',
      capacity: ['NONE', 'ONE_G_FULL']
    }, {
      start: '1/2/1', end: '1/2/2',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER',
        'ONE_G_FULL_SLAVE']
    }, {
      start: '1/3/1', end: '1/3/4',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }
  ],

  'ICX7650-48ZP': [
    {
      start: '1/1/1', end: '1/1/24',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/1/25', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE',
        'TWO_POINT_FIVE_G_FULL', 'TWO_POINT_FIVE_G_FULL_MASTER', 'TWO_POINT_FIVE_G_FULL_SLAVE', 'FIVE_G_FULL',
        'FIVE_G_FULL_MASTER', 'FIVE_G_FULL_SLAVE', 'TEN_G_FULL', 'TEN_G_FULL_MASTER', 'TEN_G_FULL_SLAVE']
    }
  ],

  'ICX7600-1X100GQ': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'ONE_HUNDRED_G_FULL']
    }
  ],

  'ICX7600-2X40GQ': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'FORTY_G_FULL']
    }
  ],

  'ICX7600-4X10GF': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }
  ],

  'ICX7650-48F': [
    {
      start: '1/1/1', end: '1/1/24',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'TWENTY_FIVE_G_FULL']
    }, {
      start: '1/1/25', end: '1/1/48',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }
  ],

  'ICX7600-48P': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }
  ],

  'ICX7650-48P': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }
  ],

  'ICX7850-48F': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'TWENTY_FIVE_G_FULL']
    }, {
      start: '1/2/1', end: '1/2/8',
      capacity: ['NONE', 'FORTY_G_FULL', 'ONE_HUNDRED_G_FULL']
    }
  ],

  'ICX7850-48FS': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'OPTIC']
    }, {
      start: '1/2/1', end: '1/2/8',
      capacity: ['NONE', 'FORTY_G_FULL', 'ONE_HUNDRED_G_FULL']
    }
  ],

  'ICX7850-32Q': [
    {
      start: '1/1/1', end: '1/1/12',
      capacity: ['NONE', 'FORTY_G_FULL', 'ONE_HUNDRED_G_FULL']
    }, {
      start: '1/2/1', end: '1/2/12',
      capacity: ['NONE', 'FORTY_G_FULL', 'ONE_HUNDRED_G_FULL']
    }, {
      start: '1/3/1', end: '1/3/8',
      capacity: ['NONE', 'FORTY_G_FULL', 'ONE_HUNDRED_G_FULL']
    }
  ],

  'ICX7850-48C': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'ONE_G_FULL', 'ONE_G_FULL_MASTER',
        'ONE_G_FULL_SLAVE', 'TEN_G_FULL']
    }
  ],

  'ICX8200-24': [
    {
      start: '1/1/1', end: '1/1/24',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL',
        'ONE_HUNDRED_M_HALF', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/4',
      capacity: ['NONE', 'TEN_G_FULL', 'TWENTY_FIVE_G_FULL', 'ONE_G_FULL']
    }
  ],
  'ICX8200-24P': [
    {
      start: '1/1/1', end: '1/1/24',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL',
        'ONE_HUNDRED_M_HALF', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/4',
      capacity: ['NONE', 'TEN_G_FULL', 'TWENTY_FIVE_G_FULL', 'ONE_G_FULL']
    }
  ],


  'ICX8200-48': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL',
        'ONE_HUNDRED_M_HALF', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/4',
      capacity: ['NONE', 'TEN_G_FULL', 'TWENTY_FIVE_G_FULL', 'ONE_G_FULL']
    }
  ],
  'ICX8200-48P': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL',
        'ONE_HUNDRED_M_HALF', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/4',
      capacity: ['NONE', 'TEN_G_FULL', 'TWENTY_FIVE_G_FULL', 'ONE_G_FULL']
    }
  ],
  'ICX8200-48PF': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL',
        'ONE_HUNDRED_M_HALF', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/4',
      capacity: ['NONE', 'TEN_G_FULL', 'TWENTY_FIVE_G_FULL', 'ONE_G_FULL']
    }
  ],
  'ICX8200-48PF2': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL',
        'ONE_HUNDRED_M_HALF', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/4',
      capacity: ['NONE', 'TEN_G_FULL', 'TWENTY_FIVE_G_FULL', 'ONE_G_FULL']
    }
  ],

  // 'ICX8200-C08P': [
  //   {
  //     start: '1/1/1', end: '1/1/8',
  //     capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL',
  //       'ONE_HUNDRED_M_HALF', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
  //   }, {
  //     start: '1/2/1', end: '1/2/2',
  //     capacity: ['NONE', 'ONE_G_FULL']
  //   }
  // ],

  'ICX8200-C08PF': [
    {
      start: '1/1/1', end: '1/1/8',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL',
        'ONE_HUNDRED_M_HALF', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/2',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL']
    }
  ],

  'ICX8200-24ZP': [
    {
      start: '1/1/1', end: '1/1/24',
      capacity: ['NONE', 'AUTO', 'ONE_HUNDRED_M_FULL',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE',
        'TWO_POINT_FIVE_G_FULL', 'TWO_POINT_FIVE_G_FULL_MASTER', 'TWO_POINT_FIVE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/4',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'TWENTY_FIVE_G_FULL']
    }
  ],

  'ICX8200-48ZP2': [
    {
      start: '1/1/1', end: '1/1/32',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL',
        'ONE_HUNDRED_M_HALF', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
    }, {
      start: '1/1/33', end: '1/1/48',
      capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE',
        'TWO_POINT_FIVE_G_FULL', 'TWO_POINT_FIVE_G_FULL_MASTER', 'TWO_POINT_FIVE_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/4',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'TWENTY_FIVE_G_FULL']
    }
  ],

  'ICX8200-24FX': [
    {
      start: '1/1/1', end: '1/1/16',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL']
    }, {
      start: '1/2/1', end: '1/2/8',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'TWENTY_FIVE_G_FULL']
    }
  ],

  'ICX8200-24F': [
    {
      start: '1/1/1', end: '1/1/24',
      capacity: ['NONE', 'ONE_G_FULL']
    }, {
      start: '1/2/1', end: '1/2/4',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'TWENTY_FIVE_G_FULL']
    }
  ],

  'ICX8200-48F ': [
    {
      start: '1/1/1', end: '1/1/48',
      capacity: ['NONE', 'ONE_G_FULL']
    }, {
      start: '1/2/1', end: '1/2/4',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'TWENTY_FIVE_G_FULL']
    }
  ],

  'ICX8200-C08ZP': [
    {
      start: '1/1/1', end: '1/1/4',
      capacity: ['NONE', 'AUTO', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE',
        'TWO_POINT_FIVE_G_FULL', 'TWO_POINT_FIVE_G_FULL_MASTER', 'TWO_POINT_FIVE_G_FULL_SLAVE']
    }, {
      start: '1/1/5', end: '1/1/8',
      capacity: ['NONE', 'AUTO', 'ONE_HUNDRED_M_FULL', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE',
        'TWO_POINT_FIVE_G_FULL', 'TWO_POINT_FIVE_G_FULL_MASTER', 'TWO_POINT_FIVE_G_FULL_SLAVE',
        'FIVE_G_FULL', 'FIVE_G_FULL_MASTER', 'FIVE_G_FULL_SLAVE', 'TEN_G_FULL', 'TEN_G_FULL_MASTER',
        'TEN_G_FULL_SLAVE']
    }, {
      start: '1/2/1', end: '1/2/2',
      capacity: ['NONE', 'ONE_G_FULL', 'TEN_G_FULL', 'TWENTY_FIVE_G_FULL']
    }
  ]

  // 'ICX8200-C08PT': [
  //   {
  //     start: '1/1/1', end: '1/1/8',
  //     capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL',
  //       'ONE_HUNDRED_M_HALF', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
  //   }, {
  //     start: '1/2/1', end: '1/2/2',
  //     capacity: ['NONE', 'ONE_G_FULL']
  //   }
  // ],

  // 'ICX8200-C08PDC': [
  //   {
  //     start: '1/1/1', end: '1/1/8',
  //     capacity: ['NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL',
  //       'ONE_HUNDRED_M_HALF', 'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE']
  //   }, {
  //     start: '1/2/1', end: '1/2/2',
  //     capacity: ['NONE', 'ONE_G_FULL']
  //   }
  // ]
}
/* eslint-enable */

export const getPortSpeedOptions = (model: string, port: string,
  selectedPort: SwitchPortViewModel) => {
  const mediaType = selectedPort.mediaType
  const switchCapacityList = ICX_MODELS_PORTSPEED[model] as MODELS_PORTSPEED[]
  let portSpeedOptions = getDefaultPortSpeedOption()
  if (!_.isEmpty(switchCapacityList)) {
    switchCapacityList.forEach((switchCapacity: MODELS_PORTSPEED) => {
      if (_isAmongPortRange(port, switchCapacity?.start || '', switchCapacity?.end || '')) {
        portSpeedOptions = switchCapacity.capacity
      }
    })
  }

  if ((model === 'ICX8200-24F' || model === 'ICX8200-48F') && //ACX-28061
    port.startsWith('1/1/') &&
    mediaType === 'MEDIA_TYPE_1000BASE_TX' &&
    !portSpeedOptions.includes('ONE_HUNDRED_M_FULL')) {
    portSpeedOptions.push('ONE_HUNDRED_M_FULL')
  }

  return portSpeedOptions
}

export const getDefaultPortSpeedOption = () => {
  return (ICX_MODELS_PORTSPEED['DEFAULT'] as MODELS_PORTSPEED).capacity
}

export const _isAmongPortRange = (port: string, startPort: string, endPort: string) => {
  const portValue = convertPortToNumber(port)
  const startPortValue = convertPortToNumber(startPort)
  const endPortValue = convertPortToNumber(endPort)

  return (portValue >= startPortValue && portValue <= endPortValue)
}

function convertPortToNumber (port: string) {
  const portArray = port.split('/')
  const unitId = 1 //The UnitID should be ignored to get the port speed options.
  return (unitId * 10000) + Number(portArray[1]) * 100 + Number(portArray[2])
}
