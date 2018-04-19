import { filter, isEqual } from 'lodash';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { findTemplate } from '../../templates';
import { fetchResultsByAPI, invalidateAllResults } from '../../actions/result';
import { invalidateAllFilters } from '../../actions/filter';
import { selectAPIs } from '../../actions/api';
import { updatePath } from '../../actions/path';
import { clearFiltering, updateFiltering, updateQuery, replaceQuery } from '../../actions/query';
import { fetchTypeaheadsByAPI, invalidateAllTypeaheads } from '../../actions/typeaheads';

import Content from './content';
import Filter from './filter';
import Form from './form';
import QueryExpansionList from './query_expansion_list';
import QueryPrompt from './query_prompt';

class Index extends React.Component {
  componentDidMount() {
    const { location, params, onRouted, onLoaded, router } = this.props;
    onLoaded({ apiName: params.api, query: location.query });
    router.listen(onRouted.bind(undefined, onLoaded));
  }
  render() {
    const {
      enabledAPIs, filters, onClearFilter, onExpand, onFilter,
      onPaging, onSelect, onSubmit, query, results, selectedAPIs, typeaheads
    } = this.props;

    return (
      <div id="search" className="mi-search">
        <div className="mi-search__form-container">
          <Form onSubmit={ onSubmit } query={ query } typeaheads={ typeaheads } selectedAPIs={ selectedAPIs }/>
          <div className="mi-search__form-hint-container">
            <QueryExpansionList onClick={ onExpand } queryExpansions={ results.query_expansion } />
            <QueryPrompt query={ query } selectedAPIs={ selectedAPIs } />
          </div>
        </div>

        <div className="mi-search__main-container">
          <Filter
            filters={ filters }
            onChange={ onFilter } onClear={ onClearFilter }
            query={ query }
          />
          <div className="mi-search__content-container">
            <Content
              findTemplate={ findTemplate }
              onPaging={ onPaging } onSelect={ onSelect }
              query={ query } results={ results } selectedAPIs={ selectedAPIs }
              window={ window }
            />
          </div>
        </div>
      </div>
    );
  }
}

Index.propTypes = {
  enabledAPIs: PropTypes.array.isRequired,
  filters: PropTypes.object,
  location: PropTypes.object,
  notifications: PropTypes.array,
  onClearFilter: PropTypes.func.isRequired,
  onExpand: PropTypes.func.isRequired,
  onFilter: PropTypes.func.isRequired,
  onLoaded: PropTypes.func.isRequired,
  onPaging: PropTypes.func.isRequired,
  onRouted: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  query: PropTypes.object,
  queryExpansions: PropTypes.object,
  results: PropTypes.object,
  router: PropTypes.object,
  selectedAPIs: PropTypes.array.isRequired,
  window: PropTypes.object
};

function mapStateToProps(state, { router }) {
  const { filtersByAggregation, query, resultsByAPI, selectedAPIs, window, typeaheadsByAPI } = state;
  return {
    filters: filtersByAggregation,
    findTemplate,
    query,
    results: resultsByAPI,
    router,
    selectedAPIs,
    window,
    typeaheads: typeaheadsByAPI
  };
}

function mapDispatchToProps(
  dispatch, { enabledAPIs, onSubmit, query: currentQuery }
) {
  return {
    onClearFilter: (e) => {
      e.preventDefault();
      dispatch(clearFiltering(e.target.dataset.filters));
      dispatch(invalidateAllResults());
      dispatch(invalidateAllFilters());
      dispatch(fetchResultsByAPI());
      dispatch(updatePath());
    },
    onExpand: (query) => {
      dispatch(updateQuery({ q: query, type: 'world_regions'  }));
      dispatch(invalidateAllResults());
      dispatch(invalidateAllFilters());
      dispatch(fetchResultsByAPI());
      dispatch(updatePath());
    },
    onFilter: ({ name, values }) => {
      dispatch(updateFiltering(name, values));
      dispatch(invalidateAllResults());
      dispatch(fetchResultsByAPI());
      dispatch(updatePath());
    },
    onLoaded: ({ apiName, query }) => {
      const apis = apiName ? filter(enabledAPIs, { uniqueId: apiName }) : enabledAPIs;
      dispatch(replaceQuery(query));
      dispatch(selectAPIs(apis));
      dispatch(invalidateAllFilters());
      dispatch(invalidateAllResults());
      dispatch(invalidateAllTypeaheads());
      dispatch(fetchResultsByAPI());
      dispatch(fetchTypeaheadsByAPI());
    },
    onPaging: (e) => {
      e.preventDefault();
      dispatch(updateQuery({ offset: e.target.dataset.offset }));
      dispatch(invalidateAllResults());
      dispatch(fetchResultsByAPI());
      dispatch(updatePath());
    },
    onRouted: (handle, location) => {
      if (location.action !== 'POP') return;
      const apiName = location.pathname.split('/')[2] || undefined;
      const query = Object.assign({}, location.query);
      if(query.q && query.type && query.type === 'hts_numbers'){
        query.q =`${query.q.substring(0,4)}.${query.q.substring(4,6)}.${query.q.substring(6,8)}.${query.q.substring(8,10)}`;
      }
      handle({ apiName, query: query });
    },
    onSelect: (api, e) => {
      e.preventDefault();
      dispatch(selectAPIs(api));
      dispatch(invalidateAllFilters());
      dispatch(fetchResultsByAPI());
      dispatch(updatePath());
    },
    onSubmit: (query) => {
      if (!isEqual(query, currentQuery)) onSubmit(query);
    }
  };
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(Index));
