import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { dismissNotification } from '../actions/notification';
import { fetchResultsByAPI, invalidateAllResults } from '../actions/result';
import { replaceQuery } from '../actions/query';
import { updatePath } from '../actions/path';
import { updateWindow } from '../actions/window';
import { invalidateAllFilters } from '../actions/filter';
import { getEnabledAPIs } from '../selectors';
import Notification from '../components/notification';

class App extends React.Component {
  componentWillMount() {
    this.props.onResize({ currentTarget: window });
  }
  componentDidMount() {
    const { onResize } = this.props;
    window.addEventListener('resize', onResize);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.props.onResize);
  }
  render() {
    const {
      children, enabledAPIs, notifications, onDismissNotification, onSubmit
    } = this.props;

    return (
      <div>
        <Notification notifications={ notifications } onDismiss={ onDismissNotification } />
        { React.cloneElement(children, { enabledAPIs, onSubmit }) }
      </div>
    );
  }
}
App.propTypes = {
  children: PropTypes.object.isRequired,
  enabledAPIs: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
  notifications: PropTypes.array,
  onDismissNotification: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  const { notifications, query } = state;
  const enabledAPIs = getEnabledAPIs(state);
  return {
    enabledAPIs,
    notifications,
    query,
    selectedAPIs: enabledAPIs,
    window: {}
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onDismissNotification: (e) => {
      e.preventDefault();
      dispatch(dismissNotification(e.target.dataset.id));
    },
    onResize: (e) => {
      const { innerWidth, innerHeight } = e.currentTarget;
      dispatch(updateWindow({ innerWidth, innerHeight }));
    },
    onSubmit: (query) => {
      if(query.countries){
        query.type = 'countries';
        query.q = query.countries;
        delete query.countries;
      }
      if(query.product_short_names){
        query.type = 'products';
        query.q = query.product_short_names;
        delete query.product_short_names;
      }
      if(query.case_numbers){
        query.type = 'case_numbers';
        query.q = query.case_numbers;
        delete query.case_numbers;
      }
      if(query.hts_numbers){
        query.type = 'hts_numbers';
        query.q = query.hts_numbers;
        delete query.hts_numbers;
      }
      dispatch(replaceQuery(query));
      dispatch(invalidateAllResults());
      dispatch(invalidateAllFilters());
      dispatch(fetchResultsByAPI());
      dispatch(updatePath());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
