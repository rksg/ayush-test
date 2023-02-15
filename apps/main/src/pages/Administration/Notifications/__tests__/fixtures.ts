import {
  // NotificationRecipientUIModel,
  NotificationEndpoint
} from '@acx-ui/rc/utils'

export const fakeNotificationList = [
  {
    id: 'afd39af2f9854963a61c38700089bc40',
    description: 'testUser 1',
    endpoints: [{
      type: 'EMAIL',
      id: '478127f284b84a6286aef6324613e3f4',
      createdDate: '2023-02-06T02:11:51.841+00:00',
      updatedDate: '2023-02-06T02:11:51.841+00:00',
      destination: 'test_user@gmail.com',
      active: true,
      status: 'OK'
    }] as NotificationEndpoint[],
    email: 'test_user@gmail.com',
    emailEnabled: true,
    mobile: '',
    mobileEnabled: false
  },
  {
    id: 'afd39af2f9854963a61c38700089bc30',
    description: 'testUser 2',
    endpoints: [{
      type: 'SMS',
      id: '478127f284b84a6286aef6324613e3f5',
      createdDate: '2023-02-06T02:11:51.841+00:00',
      updatedDate: '2023-02-06T02:11:51.841+00:00',
      destination: '+886987654321',
      active: true,
      status: 'OK'
    }] as NotificationEndpoint[],
    email: '',
    emailEnabled: false,
    mobile: '+886987654321',
    mobileEnabled: true
  },
  {
    id: 'afd39af2f9854963a61c38700089bc20',
    description: 'testUser 3',
    endpoints: [{
      type: 'EMAIL',
      id: '478127f284b84a6286aef6324613e3f6',
      createdDate: '2023-02-06T02:11:51.841+00:00',
      updatedDate: '2023-02-06T02:11:51.841+00:00',
      destination: 'test_user3@gmail.com',
      active: false,
      status: 'OK'
    }] as NotificationEndpoint[],
    email: 'test_user3@gmail.com',
    emailEnabled: false,
    mobile: '',
    mobileEnabled: false
  }
]