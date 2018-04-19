import React from 'react';
import { reduxForm, getValues } from 'redux-form';
import Select from 'react-select';
import { isEmpty, filter, map } from 'lodash';
import { connect } from 'react-redux';
import { fetchTypeaheadsByAPI, invalidateAllTypeaheads } from '../actions/typeaheads';
import { selectAPIs } from '../actions/api';

const SelectField = ({field, options, onChange}) => {
  return(
    <Select 
      {...field}
      className="mi-form__select-index"
      options={options}
      onBlur={(option) => field.onBlur(option.value)}
      onChange={value => {
        onChange(value)
        field.onChange(value)
      }}
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

  onCountriesChange = (event) => {
    this.props.fields.product_short_names.onChange(null);
    this.props.fields.hts_numbers.onChange(null);
    this.props.fields.case_numbers.onChange(null);
  }

  onProductsChange = (event) => {
    this.props.fields.countries.onChange(null);
    this.props.fields.hts_numbers.onChange(null);
    this.props.fields.case_numbers.onChange(null);
  }

  onCaseNumbersChange = (event) => {
    this.props.fields.product_short_names.onChange(null);
    this.props.fields.hts_numbers.onChange(null);
    this.props.fields.countries.onChange(null);
  }

  onHtsNumbersChange = (event) => {
    this.props.fields.product_short_names.onChange(null);
    this.props.fields.countries.onChange(null);
    this.props.fields.case_numbers.onChange(null);
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
      <form className="mi-form__index" onSubmit={ handleSubmit }>
        <h3> Choose a value for one of the fields and press Search: </h3>
        <div className="mi-form__search-row">
          <label className="mi-form__label-index" htmlFor="countries">Country</label>
          <SelectField field={fields.countries} options={this.state.typeaheads.countries} onChange={this.onCountriesChange} />
        </div>

        <div className="mi-form__search-row">
          <label className="mi-form__label-index" htmlFor="products">Product</label>
          <SelectField field={fields.product_short_names} options={this.state.typeaheads.products} onChange={this.onProductsChange} />
        </div>
        
        <div className="mi-form__search-row">
          <label className="mi-form__label-index" htmlFor="case_numbers">Case Number</label>
          <SelectField field={fields.case_numbers} options={this.state.typeaheads.case_numbers} onChange={this.onCaseNumbersChange} />
        </div>

        <div className="mi-form__search-row">
          <label className="mi-form__label-index" htmlFor="hts_numbers">HTS Numbers</label>
          <SelectField field={fields.hts_numbers} options={this.state.typeaheads.hts_numbers} onChange={this.onHtsNumbersChange} />
        </div>

        <div className="mi-form__search-row">
          <button className="uk-button mi-form__submit-index" onClick={ handleSubmit } title="Search">
            Search
          </button>
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