import { Action, createAction, props } from '@ngrx/store';
import { IRequest } from '@models/requests';

export enum ActionTypes {
  GET_REQUESTS = '[Requests] Get Requests',
  GET_REQUESTS_SUCCESS = '[Requests] Get Requests Success',
  GET_REQUESTS_FAILURE = '[Requests] Get Requests Failure',

  GET_REQUEST = '[Request] Get Request',
  GET_REQUEST_SUCCESS = '[Request] Get Request Success',
  GET_REQUEST_FAILURE = '[Request] Get Request Failure',

  SAVE_REQUEST = '[Request] Save Request',
  SAVE_REQUEST_SUCCESS = '[Request] Save Request Success',
  SAVE_REQUEST_FAILURE = '[Request] Save Request Failure'
}

export const getRequestsAction = createAction(ActionTypes.GET_REQUESTS);
export const getRequestsFailureAction = createAction(
  ActionTypes.GET_REQUESTS_FAILURE,
  props<{ error: any }>()
);
export const getRequestsSuccessAction = createAction(
  ActionTypes.GET_REQUESTS_SUCCESS,
  props<{ payload: IRequest[] }>()
);

export const getRequestAction = createAction(
  ActionTypes.GET_REQUEST,
  props<{ id: number }>()
);
export const getRequestFailureAction = createAction(
  ActionTypes.GET_REQUEST_FAILURE,
  props<{ error: any }>()
);
export const getRequestSuccessAction = createAction(
  ActionTypes.GET_REQUEST_SUCCESS,
  props<{ payload: IRequest }>()
);

export const saveRequestAction = createAction(
  ActionTypes.SAVE_REQUEST,
  props<IRequest>()
);
export const saveRequestFailureAction = createAction(
  ActionTypes.SAVE_REQUEST_FAILURE,
  props<{ error: any }>()
);
export const saveRequestSuccessAction = createAction(
  ActionTypes.SAVE_REQUEST_SUCCESS,
  props<{ payload: IRequest }>()
);
