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
      id: 58,
      name: 'Test 3',
      meetings: [
        {
          id: 58,
          zoomMeetingId: '98908385413',
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
              id: 11,
              userName: 'Test-part-1',
              hostname: '',
              networkType: 'Wifi',
              macAddress: 'A8:64:F1:1A:D0:33',
              device: 'Unknown',
              ipAddress: '134.242.238.1',
              joinTime: '2023-04-11T04:40:20.000Z',
              leaveTime: '2023-04-11T04:44:06.000Z',
              leaveReason: 'Test-part-1 left the meeting.<br>Reason: left the meeting.',
              apDetails: {
                system: null,
                domains: null,
                zone: 'Sandeep',
                apGroup: 'Unknown',
                apName: 'Switch_client',
                apMac: 'C8:08:73:08:10:50',
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
                  date_time: '2023-04-11T04:42:00Z',
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
                  date_time: '2023-04-11T04:43:00Z',
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
              id: 12,
              userName: 'User 2',
              hostname: '',
              networkType: 'Wifi',
              macAddress: 'F0:B3:EC:2A:A8:05',
              device: 'Unknown',
              ipAddress: '134.242.238.1',
              joinTime: '2023-04-11T04:41:28.000Z',
              leaveTime: '2023-04-11T04:43:39.000Z',
              leaveReason: 'User 2 left the meeting.<br>Reason: left the meeting.',
              apDetails: {
                system: null,
                domains: null,
                zone: 'New_Venue_ACX-27668_3',
                apGroup: 'Unknown',
                apName: 'r320-11-154',
                apMac: 'B4:79:C8:12:8C:50',
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
                    rx: null,
                    tx: null
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
                  date_time: '2023-04-11T04:43:00Z',
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
      id: 59,
      name: 'Test 4',
      meetings: [
        {
          id: 59,
          zoomMeetingId: '98908385413',
          status: 'ENDED',
          invalidReason: null,
          joinUrl: 'https://zoom.us/j/98908385463?pwd=bkErOUIxc0tPSVJVYWlJVWI5bWJtZz09',
          participantCount: 2,
          mos: null,
          createdTime: '2023-04-11T04:39:28.000Z',
          startTime: '2023-04-11T04:40:20.000Z',
          endTime: '2023-04-11T04:44:06.000Z',
          participants: [
            {
              id: 11,
              userName: 'Participant1',
              hostname: '',
              networkType: 'Wifi',
              macAddress: 'A8:64:F1:1A:D0:33',
              device: 'Unknown',
              ipAddress: '134.242.238.1',
              joinTime: '2023-04-11T04:40:20.000Z',
              leaveTime: '2023-04-11T04:44:06.000Z',
              leaveReason: 'Participant1 left the meeting.<br>Reason: left the meeting.',
              apDetails: {
                system: null,
                domains: null,
                zone: 'Sandeep',
                apGroup: 'Unknown',
                apName: 'Switch_client',
                apMac: 'C8:08:73:08:10:50',
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
                  date_time: '2023-04-11T04:42:00Z',
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
                  date_time: '2023-04-11T04:43:00Z',
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
              id: 12,
              userName: 'Participant2',
              hostname: '',
              networkType: 'Wifi',
              macAddress: 'F0:B3:EC:2A:A8:05',
              device: 'Unknown',
              ipAddress: '134.242.238.1',
              joinTime: '2023-04-11T04:41:28.000Z',
              leaveTime: '2023-04-11T04:43:39.000Z',
              leaveReason: 'Participant2 left the meeting.<br>Reason: left the meeting.',
              apDetails: {
                system: null,
                domains: null,
                zone: 'New_Venue_ACX-27668_3',
                apGroup: 'Unknown',
                apName: 'r320-11-154',
                apMac: 'B4:79:C8:12:8C:50',
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
                    rx: null,
                    tx: null
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
                  date_time: '2023-04-11T04:43:00Z',
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
