import assign from 'object-assign';
import { get, isEmpty, map } from 'lodash';
import fetch from 'isomorphic-fetch';
import invariant from 'invariant';
import { batchActions } from 'redux-batched-actions';

import {
  formatAggregations, formatEndpoint, formatMetadata, formatParams, permitParams
} from '../utils/action-helper';
import { computeFiltersByAggregation } from './filter';
import { notify } from './notification';

export const REQUEST_TYPEAHEADS = 'REQUEST_TYPEAHEADS';
export const RECEIVE_TYPEAHEADS = 'RECEIVE_TYPEAHEADS';
export const FAILURE_TYPEAHEADS = 'FAILURE_TYPEAHEADS';
export const INVALIDATE_TYPEAHEADS = 'INVALIDATE_TYPEAHEADS';

export function requestTypeaheads(uniqueId) {
  return {
    type: REQUEST_TYPEAHEADS,
    meta: uniqueId
  };
}

export function receiveTypeaheads(uniqueId, response) {
  return {
    type: RECEIVE_TYPEAHEADS,
    meta: uniqueId,
    payload: response
  };
}

export function failureTypeahead(uniqueId, e) {
  return {
    type: FAILURE_TYPEAHEADS,
    error: true,
    meta: uniqueId,
    payload: e
  };
}

export function invalidateTypeaheads(uniqueId) {
  return {
    type: INVALIDATE_TYPEAHEADS,
    meta: uniqueId
  };
}

function postprocess(api, _json) {
  const json = api.transformResponse ? api.transformResponse(_json) : _json;
  let typeaheads = {};
  for (let key in json.aggregations){
    if(api.typeaheads.includes(key)){
      let values = map(json.aggregations[key], (entry) => { return entry.key });
      typeaheads[key] = values.sort();
    }
  }
  return typeaheads;
}

function fetchTypeaheads(api) {
  return (dispatch, getState) => {
    dispatch(requestTypeaheads(api.uniqueId));
    const params = {size: 1};
    return fetch(formatEndpoint(api.endpoint, params))
      .then(response => {
        invariant(response.status === 200, response.statusText);
        return response.json();
      })
      .then(json => {
        const data = postprocess(api, json);
        dispatch(receiveTypeaheads(api.uniqueId, data));
        return data;
      })
      .catch(e => {
        dispatch(notify({ text: `${api.uniqueId}: ${e.message}`, status: 'error' }));
        return dispatch(failureTypeahead(api.uniqueId, e));
      });
  };
}

export function fetchTypeaheadsByAPI() {
  return (dispatch, getState) => {
    const { selectedAPIs } = getState();
    
    return Promise.all(
      map(selectedAPIs, (api) => {
        if(api.typeaheads){
          dispatch(fetchTypeaheads(api))
        }
      })
    );
  };
}

export function invalidateAllTypeaheads() {
  return (dispatch, getState) => {
    const { typeaheadsByAPI: typeaheads } = getState();
    return dispatch(
      batchActions(map(typeaheads, (typeahead, uniqueId) => invalidateTypeaheads(uniqueId)))
    );
  };
}

