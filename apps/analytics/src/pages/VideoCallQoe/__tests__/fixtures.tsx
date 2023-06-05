export const createTestResponse = {
  createCallQoeTest: {
    id: 85,
    name: 'Test 1.2',
    meetings: [
      {
        zoomMeetingId: '94882688780',
        joinUrl: 'https://zoom.us/j/94882688780?pwd=d2MxWW5PbDlvaGlPNVVXVFVJcGIxUT09'
      }
    ]
  }
}

export const deleteTestResponse = {
  deleteCallQoeTest: true
}

export const deleteTestFailedResponse = {
  deleteCallQoeTest: false
}

export const getAllCallQoeTests = {
  getAllCallQoeTests: [
    {
      id: 13,
      name: 'ACX_test',
      meetings: [
        {
          id: 13,
          zoomMeetingId: '94909091023',
          status: 'ENDED',
          invalidReason: null,
          joinUrl: 'https://zoom.us/j/94909091023?pwd=UU1tT0FBRHZvdkhEY2wxSTZwMEJwZz09',
          participantCount: 2,
          mos: 4.6,
          createdTime: '2023-04-06T09:55:41.000Z',
          startTime: '2023-04-06T09:56:21.000Z'
        }
      ]
    },
    {
      id: 74,
      name: 'Test call',
      meetings: [
        {
          id: 74,
          zoomMeetingId: '97992181330',
          status: 'INVALID',
          invalidReason: 'ZOOM_CALL_NO_PARTICIPANT_ON_WIFI',
          joinUrl: 'https://zoom.us/j/97992181330?pwd=VXZ4YWZlZkJRZlg1QmtwazJtcVhRdz09',
          participantCount: 0,
          mos: null,
          createdTime: '2023-04-12T09:56:58.000Z',
          startTime: null
        }
      ]
    },
    {
      id: 57,
      name: 'Asraf - Test1',
      meetings: [
        {
          id: 57,
          zoomMeetingId: '98908385463',
          status: 'ENDED',
          invalidReason: null,
          joinUrl: 'https://zoom.us/j/98908385463?pwd=bkErOUIxc0tPSVJVYWlJVWI5bWJtZz09',
          participantCount: 2,
          mos: 3.3,
          createdTime: '2023-04-11T04:39:28.000Z',
          startTime: '2023-04-11T04:40:20.000Z'
        }
      ]
    }
  ],
  noData: []
}

export const callQoeTestDetailsFixtures1 = {
  getAllCallQoeTests: [
    {
      id: 86,
      name: 'Test 1',
      meetings: [
        {
          id: 86,
          zoomMeetingId: '93455065497',
          status: 'ENDED',
          invalidReason: null,
          joinUrl: 'https://zoom.us/j/93455065497?pwd=bkFNbndzbVpzZWtjcDhoRFoxTjJWQT09',
          participantCount: 2,
          mos: 4.6,
          createdTime: '2023-04-18T10:20:43.000Z',
          startTime: '2023-04-18T10:21:13.000Z',
          endTime: '2023-04-18T10:29:01.000Z',
          participants: [
            {
              id: 13,
              userName: 'Participant 1',
              hostname: '',
              networkType: 'Cellular',
              macAddress: null,
              device: 'Unknown',
              ipAddress: '106.216.236.123',
              joinTime: '2023-04-18T10:21:13.000Z',
              leaveTime: '2023-04-18T10:28:51.000Z',
              leaveReason: 'Participant 1 left the meeting.<br>Reason: left the meeting.',
              apDetails: null,
              wifiMetrics: null,
              callMetrics: [
                {
                  date_time: '2023-04-18T10:21:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-18T10:22:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 13
                    },
                    video: {
                      tx: 8,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 57
                    },
                    video: {
                      tx: 53,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 0
                    },
                    video: {
                      tx: 0,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: 23,
                    tx: 23
                  }
                },
                {
                  date_time: '2023-04-18T10:23:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 17
                    },
                    video: {
                      tx: 8,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 142
                    },
                    video: {
                      tx: 140,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 0.4
                    },
                    video: {
                      tx: 0.3,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: 26,
                    tx: 29
                  }
                },
                {
                  date_time: '2023-04-18T10:24:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 19
                    },
                    video: {
                      tx: 9,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 247
                    },
                    video: {
                      tx: 251,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 0
                    },
                    video: {
                      tx: 0,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: 26,
                    tx: 28
                  }
                },
                {
                  date_time: '2023-04-18T10:25:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 16
                    },
                    video: {
                      tx: 9,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 64
                    },
                    video: {
                      tx: 64,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 0
                    },
                    video: {
                      tx: 0,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: 29,
                    tx: 29
                  }
                },
                {
                  date_time: '2023-04-18T10:26:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 16
                    },
                    video: {
                      tx: 9,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 101
                    },
                    video: {
                      tx: 104,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 0
                    },
                    video: {
                      tx: 0,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: 26,
                    tx: 29
                  }
                },
                {
                  date_time: '2023-04-18T10:27:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 17
                    },
                    video: {
                      tx: 11,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 81
                    },
                    video: {
                      tx: 100,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 0
                    },
                    video: {
                      tx: 0,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: 28
                  }
                },
                {
                  date_time: '2023-04-18T10:28:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                }
              ]
            },
            {
              id: 14,
              userName: 'Participant 2 (Mac M1)',
              hostname: '',
              networkType: 'Wifi',
              macAddress: 'F0:81:73:20:84:39',
              device: 'Unknown',
              ipAddress: '49.207.200.111',
              joinTime: '2023-04-18T10:22:17.000Z',
              leaveTime: '2023-04-18T10:29:01.000Z',
              leaveReason: 'Participant 2 (Mac M1) left the meeting.<br>Reason: left the meeting.',
              apDetails: {
                system: null,
                domains: null,
                zone: 'Group_id_issue',
                apGroup: 'AP-group',
                apName: 'AP-Group-Issue',
                apMac: 'F0:3E:90:36:D3:00',
                apSerial: 'Unknown',
                ssid: 'CIOT',
                radio: '2.4'
              },
              wifiMetrics: {
                rss: -50,
                snr: 46,
                avgTxMCS: 81000,
                throughput: 46968
              },
              callMetrics: [
                {
                  date_time: '2023-04-18T10:22:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 14
                    },
                    video: {
                      tx: 9,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 51
                    },
                    video: {
                      tx: 66,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 0
                    },
                    video: {
                      tx: 0,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: 25,
                    tx: 24
                  }
                },
                {
                  date_time: '2023-04-18T10:23:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 15
                    },
                    video: {
                      tx: 6,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 141
                    },
                    video: {
                      tx: 151,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 0
                    },
                    video: {
                      tx: 0,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: 29,
                    tx: 26
                  }
                },
                {
                  date_time: '2023-04-18T10:24:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 40
                    },
                    video: {
                      tx: 12,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 425
                    },
                    video: {
                      tx: 423,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 1.8
                    },
                    video: {
                      tx: 1,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: 27,
                    tx: 26
                  }
                },
                {
                  date_time: '2023-04-18T10:25:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 15
                    },
                    video: {
                      tx: 6,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 63
                    },
                    video: {
                      tx: 74,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 0
                    },
                    video: {
                      tx: 0,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: 28,
                    tx: 26
                  }
                },
                {
                  date_time: '2023-04-18T10:26:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 14
                    },
                    video: {
                      tx: 6,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 93
                    },
                    video: {
                      tx: 103,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 0
                    },
                    video: {
                      tx: 0,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: 30,
                    tx: 26
                  }
                },
                {
                  date_time: '2023-04-18T10:27:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 14
                    },
                    video: {
                      tx: 6,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 82
                    },
                    video: {
                      tx: 79,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 0
                    },
                    video: {
                      tx: 0,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: 28,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-18T10:28:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 15
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 51
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 0
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-18T10:29:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

export const callQoeTestDetailsFixtures2 = {
  getAllCallQoeTests: [
    {
      id: 57,
      name: 'Test 2',
      meetings: [
        {
          id: 57,
          zoomMeetingId: '98908385463',
          status: 'ENDED',
          invalidReason: null,
          joinUrl: 'https://zoom.us/j/98908385463?pwd=bkErOUIxc0tPSVJVYWlJVWI5bWJtZz09',
          participantCount: 2,
          mos: 3,
          createdTime: '2023-04-11T04:39:28.000Z',
          startTime: '2023-04-11T04:40:20.000Z',
          endTime: '2023-04-11T04:44:06.000Z',
          participants: [
            {
              id: 9,
              userName: 'Test',
              hostname: '',
              networkType: 'Wifi',
              macAddress: 'A8:64:F1:1A:D0:33',
              device: 'Unknown',
              ipAddress: '134.242.238.1',
              joinTime: '2023-04-11T04:40:20.000Z',
              leaveTime: '2023-04-11T04:44:06.000Z',
              leaveReason: 'Test left the meeting.<br>Reason: left the meeting.',
              apDetails: {
                system: null,
                domains: null,
                zone: 'Sandeep',
                apGroup: 'Unknown',
                apName: 'Switch_client',
                apMac: 'C8:08:73:08:10:50',
                apSerial: '9876543210',
                ssid: 'Divya_unlimited',
                radio: '5'
              },
              wifiMetrics: {
                rss: -90,
                snr: 3,
                avgTxMCS: 2048,
                throughput: 999
              },
              callMetrics: [
                {
                  date_time: '2023-04-11T04:40:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-11T04:41:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: 38,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: 348,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: 0.4,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: 21
                  }
                },
                {
                  date_time: '2023-04-11T04:42:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: 2,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: 31,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: 0.1,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: 26
                  }
                },
                {
                  date_time: '2023-04-11T04:43:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: 11,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: 63,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: 1.1,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: 26
                  }
                },
                {
                  date_time: '2023-04-11T04:44:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                }
              ]
            },
            {
              id: 10,
              userName: 'User 2 (Mac M1)',
              hostname: '',
              networkType: 'Wifi',
              macAddress: 'F0:B3:EC:2A:A8:05',
              device: 'Unknown',
              ipAddress: '134.242.238.1',
              joinTime: '2023-04-11T04:41:28.000Z',
              leaveTime: '2023-04-11T04:43:39.000Z',
              leaveReason: 'User 2 (Mac M1) left the meeting.<br>Reason: left the meeting.',
              apDetails: {
                system: null,
                domains: null,
                zone: 'New_Venue_ACX-27668_3',
                apGroup: 'Unknown',
                apName: 'r320-11-154',
                apMac: 'B4:79:C8:12:8C:50',
                apSerial: '6789012345',
                ssid: 'CIOT',
                radio: '5'
              },
              wifiMetrics: {
                rss: -80,
                snr: 10,
                avgTxMCS: 12288,
                throughput: 1500
              },
              callMetrics: [
                {
                  date_time: '2023-04-11T04:41:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: 21,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-11T04:42:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 13
                    },
                    video: {
                      tx: 5,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 70
                    },
                    video: {
                      tx: 33,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 2.8
                    },
                    video: {
                      tx: 0,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: 26,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-11T04:43:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 19
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 90
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 0.6
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: 26,
                    tx: null
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

export const callQoeTestDetailsFixtures3 = {
  getAllCallQoeTests: [
    {
      id: 62,
      name: 'Test-Qoe',
      meetings: [
        {
          id: 62,
          zoomMeetingId: '93384956746',
          status: 'ENDED',
          invalidReason: null,
          joinUrl: 'https://zoom.us/j/93384956746?pwd=MnNxU1Y5c3pCaVQvOE1jUUoyTDBpZz09',
          participantCount: 2,
          mos: 5,
          createdTime: '2023-04-11T05:04:26.000Z',
          startTime: '2023-04-11T05:04:58.000Z',
          endTime: '2023-04-11T05:08:23.000Z',
          participants: [
            {
              id: 11,
              userName: 'Test',
              hostname: '',
              networkType: 'Wifi',
              macAddress: null,
              device: 'Unknown',
              ipAddress: '134.242.238.1',
              joinTime: '2023-04-11T05:04:58.000Z',
              leaveTime: '2023-04-11T05:08:23.000Z',
              leaveReason: 'Test left the meeting.<br>Reason: left the meeting.',
              apDetails: null,
              wifiMetrics: null,
              callMetrics: [
                {
                  date_time: '2023-04-11T05:05:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-11T05:06:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-11T05:07:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-11T05:08:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                }
              ]
            },
            {
              id: 12,
              userName: 'iPhone 13 mini',
              hostname: '',
              networkType: 'Cellular',
              macAddress: null,
              device: 'Unknown',
              ipAddress: '223.231.146.0',
              joinTime: '2023-04-11T05:05:35.000Z',
              leaveTime: '2023-04-11T05:08:08.000Z',
              leaveReason: 'iPhone 13 mini left the meeting.<br>Reason: left the meeting.',
              apDetails: null,
              wifiMetrics: null,
              callMetrics: [
                {
                  date_time: '2023-04-11T05:06:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-11T05:07:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: 16
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: 137
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: 0.9
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-11T05:08:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

export const callQoeTestDetailsFixtures4 = {
  getAllCallQoeTests: [
    {
      id: 62,
      name: 'Test-Qoe',
      meetings: [
        {
          id: 62,
          zoomMeetingId: '93384956746',
          status: 'ENDED',
          invalidReason: null,
          joinUrl: 'https://zoom.us/j/93384956746?pwd=MnNxU1Y5c3pCaVQvOE1jUUoyTDBpZz09',
          participantCount: 2,
          mos: 5,
          createdTime: '2023-04-11T05:04:26.000Z',
          startTime: '2023-04-11T05:04:58.000Z',
          endTime: '2023-04-11T05:08:23.000Z',
          participants: [
            {
              id: 11,
              userName: 'Test',
              hostname: '',
              networkType: 'Wifi',
              macAddress: null,
              device: 'Unknown',
              ipAddress: '134.242.238.1',
              joinTime: '2023-04-11T05:04:58.000Z',
              leaveTime: '2023-04-11T05:08:23.000Z',
              leaveReason: 'Test left the meeting.<br>Reason: left the meeting.',
              apDetails: null,
              wifiMetrics: null,
              callMetrics: [
                {
                  date_time: '2023-04-11T05:05:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-11T05:06:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-11T05:07:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-11T05:08:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                }
              ]
            },
            {
              id: 12,
              userName: 'iPhone 13 mini',
              hostname: '',
              networkType: 'Cellular',
              macAddress: null,
              device: 'Unknown',
              ipAddress: '223.231.146.0',
              joinTime: '2023-04-11T05:05:35.000Z',
              leaveTime: '2023-04-11T05:08:08.000Z',
              leaveReason: 'iPhone 13 mini left the meeting.<br>Reason: left the meeting.',
              apDetails: null,
              wifiMetrics: null,
              callMetrics: [
                {
                  date_time: '2023-04-11T05:06:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-11T05:07:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                },
                {
                  date_time: '2023-04-11T05:08:00Z',
                  jitter: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  latency: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  packet_loss: {
                    audio: {
                      rx: null,
                      tx: null
                    },
                    video: {
                      tx: null,
                      rx: null
                    }
                  },
                  video_frame_rate: {
                    rx: null,
                    tx: null
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

export const getAllCallQoeTestsWithNotStarted = {
  getAllCallQoeTests:
  [
    {
      id: 90,
      name: 'test 1.4',
      meetings: [
        {
          id: 90,
          zoomMeetingId: '94194732704',
          status: 'NOT_STARTED',
          invalidReason: null,
          joinUrl: 'https://zoom.us/j/94194732704?pwd=QmNPMC9qaVViMGZwTjErZmpJdGM5QT09',
          participantCount: null,
          mos: null,
          createdTime: '2023-04-19T10:29:00.000Z',
          startTime: null
        }
      ]
    }
  ]
}

export const searchClientsFixture = {
  search: {
    clients: [
      {
        hostname: 'IT',
        username: 'DPSK_User_8709',
        mac: 'A8:64:F1:1A:D0:33',
        ipAddress: '10.174.116.111'
      },
      {
        hostname: 'DESKTOP-K1PAM9U',
        username: 'd0c637d75280',
        mac: 'D0:C6:37:D7:52:80',
        ipAddress: '10.174.116.121'
      },
      {
        hostname: 'e0:d4:64:05:7d:4b',
        username: 'e0d464057d4b',
        mac: 'E0:D4:64:05:7D:4B',
        ipAddress: '10.174.116.216'
      }
    ]
  }
}