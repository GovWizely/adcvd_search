import assign from 'object-assign';
import * as taxonomy from '../utils/taxonomy';
import { defineAPI } from './utils';
import { trade } from './config';

function transformParams(params) {
  if (!params.countries) return params;

  return assign({}, params, {
    countries: taxonomy.countryToAbbr(params.countries) || params.countries
  });
}

function transformResponse(response) {
  if (!response.aggregations || !response.aggregations.countries) return response;

  const countries = [];
  for (const country of response.aggregations.countries) {
    countries.push({ key: taxonomy.abbrToCountry(country.key) });
  }
  return assign(
    {}, response, {
      aggregations: assign({}, response.aggregations, { countries })
    }
  );
}

function queryExpansionTransformResponse(response) {
  return { results: response.query_expansion.world_regions };
}

function transformAdcvdResponse(response) {
  return response;
}

function transformAdcvdParams(params) {
  params[params.type] = params.q;
  delete params.q;

  if (params.products) {
    params.product_short_names = params.products;
    delete params.products;
  }

  if(params.hts_numbers) {
    params.hts_numbers_raw = params.hts_numbers.replace(/\.{1}/g, '');
    delete params.hts_numbers;
  }
  return params;
}

function endpoint(path) {
  const { host, key } = trade;
  return `${host}/${path}?api_key=${key}`;
}

function defineTradeAPI(key, attributes = {}) {
  const tradeAPI = {
    aggregations: {
      countries: { type: 'array' },
      industries: { type: 'tree' }
    },
    endpoint: endpoint(`${key}/search`),
    metadata: ['total', 'offset', 'sources_used', 'search_performed_at'],
    permittedParams: ['q', 'countries', 'industries', 'start_date', 'end_date', 'size', 'offset'],
    requiredParams: ['q'],
    transformParams,
    transformResponse
  };
  return defineAPI(key, assign({}, tradeAPI, attributes));
}

module.exports = assign(
  {},
  defineTradeAPI('query_expansion', {
    aggregations: {},
    async: true,
    bucket: { enable: false },
    card: { enable: false },
    endpoint: endpoint('ita_taxonomies/query_expansion'),
    permittedParams: ['q'],
    result: { enable: false },
    transformResponse: queryExpansionTransformResponse
  }),
  defineTradeAPI('adcvd_orders', {
    aggregations: {
      countries: { type: 'array', displayName: 'Countries' },
      products: { type: 'array', displayName: 'Products' }
    },
    typeaheads: ['countries', 'products', 'case_numbers', 'hts_numbers', 'commodities'],
    displayName: 'ADCVD Cases',
    endpoint: endpoint('v1/adcvd_orders/search'),
    permittedParams: ['countries', 'product_short_names', 'offset', 'hts_numbers_raw', 'case_numbers', 'world_regions', 'commodities'],
    transformResponse: transformAdcvdResponse,
    transformParams: transformAdcvdParams
  })
);
