export const mockedAp = {
  totalCount: 1,
  page: 1,
  data: [
    {
      serialNumber: 'AP001',
      venueName: 'Mock-Venue',
      apMac: '00:00:00:00:00:01'
    }
  ]
}

export const mockedApRfNeighbors = {
  detectedTime: '2022-12-16T06:22:23.337+0000',
  neighbors: [
    {
      deviceName: 'AP-282608',
      apMac: '05:B6:A1:AC:52:BA',
      status: '2_00_Operational',
      model: 'R720',
      venueName: 'test_hank',
      ip: '53.68.230.52',
      channel24G: '6 (20MHz)',
      channel5G: '161 (80MHz)',
      channel6G: null,
      snr24G: '15 dB',
      snr5G: '37 dB',
      snr6G: null
    },
    {
      deviceName: 'AP-909297',
      apMac: '27:F4:BC:C9:A0:B7',
      status: '2_00_Operational',
      model: 'R720',
      venueName: 'test_hank',
      ip: '55.74.62.230',
      channel24G: '6 (20MHz)',
      channel5G: '161 (80MHz)',
      channel6G: null,
      snr24G: '15 dB',
      snr5G: '37 dB',
      snr6G: null
    }
  ]
}
