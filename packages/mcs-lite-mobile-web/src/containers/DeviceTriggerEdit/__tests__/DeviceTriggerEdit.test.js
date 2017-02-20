import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import DeviceTriggerEdit from '../DeviceTriggerEdit';

it('should return messages', () => {
  expect(require('../messages').default).toMatchSnapshot();
});

it('should renders <DeviceTriggerEdit> correctly', () => {
  const fetchMock = jest.fn();
  const wrapper = shallow(
    <DeviceTriggerEdit
      getMessages={() => {}}
      deviceId="deviceId"
      device={{
        deviceId: 'deviceId',
        deviceName: 'deviceName',
        createUserId: 'createUserId',
        deviceDescription: 'deviceDescription',
        deviceKey: 'deviceKey',
      }}
      isLoading={false}
      fetchDeviceDetail={fetchMock}
    />,
  );

  expect(toJson(wrapper)).toMatchSnapshot();
  expect(fetchMock).toHaveBeenCalledWith('deviceId');
});
