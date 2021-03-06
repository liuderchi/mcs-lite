import { Observable } from 'rxjs/Observable';
import * as R from 'ramda';
import { actions as uiActions } from './ui';
import { success, exist, accessTokenSelector$ } from '../utils/cycleHelper';

// ----------------------------------------------------------------------------
// 1. Constants
// ----------------------------------------------------------------------------

const FETCH_DEVICE_LIST = 'mcs-lite-mobile-web/devices/FETCH_DEVICE_LIST';
const FETCH_DEVICE_DETAIL = 'mcs-lite-mobile-web/devices/FETCH_DEVICE_DETAIL';
const SET_DEVICE_LIST = 'mcs-lite-mobile-web/devices/SET_DEVICE_LIST';
const SET_DEVICE_DETAIL = 'mcs-lite-mobile-web/devices/SET_DEVICE_DETAIL';
const SET_DATAPOINT = 'mcs-lite-mobile-web/devices/SET_DATAPOINT';
const CLEAR = 'mcs-lite-mobile-web/devices/CLEAR';

export const constants = {
  FETCH_DEVICE_LIST,
  FETCH_DEVICE_DETAIL,
  SET_DEVICE_LIST,
  SET_DEVICE_DETAIL,
  SET_DATAPOINT,
  CLEAR,
};

// ----------------------------------------------------------------------------
// 2. Action Creators (Sync)
// ----------------------------------------------------------------------------

const fetchDeviceList = () => ({ type: FETCH_DEVICE_LIST });
const fetchDeviceDetail = (deviceId, isForce) => ({
  type: FETCH_DEVICE_DETAIL,
  payload: { deviceId, isForce },
});
const setDeviceList = deviceList => ({
  type: SET_DEVICE_LIST,
  payload: deviceList,
});
const setDeviceDetail = deviceData => ({
  type: SET_DEVICE_DETAIL,
  payload: deviceData,
});
const setDatapoint = (deviceId, datapoint, isFromServer) => ({
  type: SET_DATAPOINT,
  payload: { deviceId, datapoint, isFromServer },
});
const clear = () => ({ type: CLEAR });

export const actions = {
  fetchDeviceList,
  fetchDeviceDetail,
  setDeviceList,
  setDeviceDetail,
  setDatapoint,
  clear,
};

// ----------------------------------------------------------------------------
// 3. Cycle (Side-effects)
// ----------------------------------------------------------------------------

function fetchDeviceListCycle(sources) {
  const accessToken$ = accessTokenSelector$(sources.STATE);

  const request$ = sources.ACTION.filter(
    action => action.type === FETCH_DEVICE_LIST,
  ).combineLatest(accessToken$, (action, accessToken) => ({
    url: '/api/devices',
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
    category: FETCH_DEVICE_LIST,
  }));

  const response$ = sources.HTTP.select(FETCH_DEVICE_LIST).switchMap(success);

  const action$ = Observable.from([
    request$.mapTo(uiActions.setLoading()),
    response$.pluck('body', 'data').map(setDeviceList),
    response$.mapTo(uiActions.setLoaded()),
  ]).mergeAll();

  return {
    ACTION: action$,
    HTTP: request$,
  };
}

function fetchDeviceDetailCycle(sources) {
  const accessToken$ = accessTokenSelector$(sources.STATE);

  const payload$ = sources.ACTION.filter(
    action => action.type === FETCH_DEVICE_DETAIL,
  ).pluck('payload');
  const deviceId$ = payload$.pluck('deviceId').distinctUntilChanged();
  const refetch$ = payload$
    .pluck('isForce')
    .filter(exist)
    .startWith(true);

  const request$ = Observable.combineLatest(
    deviceId$,
    accessToken$,
    refetch$,
    (deviceId, accessToken) => ({
      url: `/api/devices/${deviceId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
      category: FETCH_DEVICE_DETAIL,
    }),
  );

  const response$ = sources.HTTP.select(FETCH_DEVICE_DETAIL).switchMap(success);

  const action$ = Observable.from([
    request$.mapTo(uiActions.setLoading()),
    response$.pluck('body', 'data').map(setDeviceDetail),
    response$.mapTo(uiActions.setLoaded()),
  ]).mergeAll();

  return {
    ACTION: action$,
    HTTP: request$,
  };
}

export const cycles = {
  fetchDeviceListCycle,
  fetchDeviceDetailCycle,
};

// ----------------------------------------------------------------------------
// 4. Reducer as default (State shaper)
// ----------------------------------------------------------------------------

const initialState = {}; // Remind: indexBy deviceId

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_DEVICE_LIST:
      return action.payload.reduce(
        (acc, device) => ({
          ...acc,
          [device.deviceId]: {
            ...state[device.deviceId], // keep this device old info
            ...device, // list api
          },
        }),
        {},
      );

    case SET_DEVICE_DETAIL:
      return {
        ...state, // keep other devices
        [action.payload.deviceId]: {
          ...state[action.payload.deviceId], // keep this device old info
          ...action.payload, // detail api
        },
      };

    case SET_DATAPOINT: {
      // TODO: refactor these codes
      const { datachannelId, values } = action.payload.datapoint;
      const dataChannels = state[action.payload.deviceId].datachannels;
      const index = R.findIndex(R.propEq('datachannelId', datachannelId))(
        dataChannels,
      );
      const updateDatapoints = R.assoc('datapoints', { values });
      const nextDataChannels = R.adjust(updateDatapoints, index)(dataChannels);

      return {
        ...state,
        [action.payload.deviceId]: {
          ...state[action.payload.deviceId], // keep this device old info
          datachannels: nextDataChannels,
        },
      };
    }

    case CLEAR:
      return initialState;
    default:
      return state;
  }
}
