import React from 'react';
import { reduxForm, getValues } from 'redux-form';
import Select from 'react-select';
import { isEmpty, filter, map } from 'lodash';
import { connect } from 'react-redux';
import { fetchTypeaheadsByAPI, invalidateAllTypeaheads } from '../actions/typeaheads';
import { selectAPIs } from '../actions/api';

const SelectField = ({field, options}) => {
  return(
    <Select 
      {...field}
      className="mi-form__select"
      options={options}
      onBlur={(option) => field.onBlur(option.value)}
    />
  )
}

class IndexForm extends React.Component{
  constructor(props){
    super(props);
    this.state = { 
      typeaheads: {}
    }
  }

  componentWillMount(){
    this.props.onIndexLoaded();
  }

  componentDidUpdate(){
    if(!isEmpty(this.props.typeaheads.adcvd_orders.typeaheads) && isEmpty(this.state.typeaheads)){
      const apis = filter(this.props.enabledAPIs, api => api.result.enable);
      const api = apis[0];
      const typeaheads = this.props.typeaheads[api.pathname].typeaheads;
      const new_state = { };

      for (let key in typeaheads){
        let new_ts = {};
        new_state[key] = map(typeaheads[key], (entry) => {return {label: entry, value: entry} });
      }
      this.setState({typeaheads: new_state});
    }
  }

  render(){
    const { fields, focused, handleSubmit } = this.props;
    const inputProps = {
      className: "mi-form__field",
      autoFocus: focused,
      type: "text",
      placeholder: "Keyword",
      'aria-label': "Enter keyword",
      ...fields.q
    };
    return(
      <form className="mi-form" onSubmit={ handleSubmit }>
        <h3> Choose a value for one of the following fields, and press Search to begin: </h3>
        <div className="mi-form__search-row">
          <label htmlFor="countries">Country</label>
          <SelectField field={fields.countries} options={this.state.typeaheads.countries} />
        </div>

        <div className="mi-form__search-row">
          <label htmlFor="products">Product</label>
          <SelectField field={fields.product_short_names} options={this.state.typeaheads.products} />
        </div>
        
        <div className="mi-form__search-row">
          <label htmlFor="case_numbers">Case Number</label>
          <SelectField field={fields.case_numbers} options={this.state.typeaheads.case_numbers} />
        </div>

        <div className="mi-form__search-row">
          <label htmlFor="hts_numbers">HTS Numbers</label>
          <SelectField field={fields.hts_numbers} options={this.state.typeaheads.hts_numbers} />
        </div>

        <div className="mi-form__search-row">
          <span className="mi-form__submit">
            <button className="uk-button mi-form__submit__button" onClick={ handleSubmit } title="Search">
              Search
            </button>
          </span>
        </div>
      </form>
    );
  }
}

const Index = reduxForm({
  form: 'form',
  fields: ['countries', 'product_short_names', 'case_numbers', 'hts_numbers']
}, state => ({
  initialValues: {}
}))(IndexForm);

const mapStateToProps = (state) => {
  const {  typeaheadsByAPI } = state;
  return {
    typeaheads: typeaheadsByAPI
  }
}

const mapDispatchToProps = (dispatch, {enabledAPIs}) => {
 return {
  onIndexLoaded: () => {
      const apis = enabledAPIs;
      dispatch(selectAPIs(apis));
      dispatch(invalidateAllTypeaheads());
      dispatch(fetchTypeaheadsByAPI());
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Index);