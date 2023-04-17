export const mockedDpskList = {
  content: [
    {
      id: '123456789a',
      name: 'DPSK Service 1',
      passphraseLength: 18,
      passphraseFormat: 'MOST_SECURED',
      expirationType: null
    },
    {
      id: '123456789b',
      name: 'DPSK Service 2',
      passphraseLength: 22,
      passphraseFormat: 'KEYBOARD_FRIENDLY',
      expirationType: 'SPECIFIED_DATE',
      expirationDate: '2022-12-07'
    },
    {
      id: '123456789c',
      name: 'DPSK Service 3',
      passphraseLength: 24,
      passphraseFormat: 'KEYBOARD_FRIENDLY',
      expirationType: 'HOURS_AFTER_TIME',
      expirationOffset: 2,
      networkIds: ['123', '456']
    }
  ],
  totalElements: 3,
  totalPages: 1,
  pageable: {
    pageNumber: 0,
    pageSize: 10
  },
  sort: []
}

export const mockedDpskListWithPersona = {
  content: [
    {
      id: '123456789a',
      name: 'DPSK Service 1',
      passphraseLength: 18,
      passphraseFormat: 'MOST_SECURED',
      expirationType: null,
      identityId: '123456789'
    }
  ],
  totalElements: 1,
  totalPages: 1,
  pageable: {
    pageNumber: 0,
    pageSize: 10
  },
  sort: []
}
