import React, { PropTypes } from 'react';
import { filter, isEmpty, map, reduce } from 'lodash';
import { reduxForm, getValues } from 'redux-form';
import Autosuggest from 'react-autosuggest';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

const selectOptions = [
  { value: 'countries', label: 'Country' },
  { value: 'products', label: 'Product' },
  { value: 'case_numbers', label: 'Case Number' },
  { value: 'hts_numbers', label: 'HTS Number' },
  { value: 'commodities', label: 'Commodity'}
]

const fetchTypeaheads = (selectedAPIs, typeaheads_prop, type) => {
  const apis = filter(selectedAPIs, api => api.uniqueId === "adcvd_orders");
  const api = apis[0];
  const typeaheads = map(typeaheads_prop[api.pathname].typeaheads[type], (term) => {
    return {value: term, label: term};
  });
  return typeaheads;
}

const SelectField = ({field, options, onChange}) => {
  return(
    <Select 
      {...field}
      className="mi-form__select"
      options={options}
      onBlur={(option) => field.onBlur(option.value)}
      onChange={value => {
        if(onChange)
          onChange(value);
        field.onChange(value);
      }}
    />
  )
}

class Form extends React.Component{
  constructor(props){
    super(props);
    this.state = { 
      suggestions: [],
      typeaheads: [],
      filter_type: "",
      form_label: "Choose a field to search by:" 
    }
  }

  componentDidUpdate(){
    // Only load typeaheads if we have API data and the state is empty: 
    if(!isEmpty(this.props.selectedAPIs) && isEmpty(this.state.typeaheads)){
      const typeaheads = fetchTypeaheads(this.props.selectedAPIs, this.props.typeaheads, this.props.values.type);
      if(!isEmpty(typeaheads))
        this.setState({ typeaheads: typeaheads });
    }
  }

  onSelectChange = (event) => {
    // Reload typeaheads when the Type select changes:
    const typeaheads = fetchTypeaheads(this.props.selectedAPIs, this.props.typeaheads, event.value);
    this.props.fields.q.onChange(null);
    this.setState({ typeaheads: typeaheads });
  }

  render(){
    const { fields, focused, handleSubmit } = this.props;

    return(
      <form className="mi-form" onSubmit={ handleSubmit }>
        <label className="mi-form__search-label" htmlFor="q">{this.state.form_label}</label>
        <div className="mi-form__search-row">
          <SelectField field={fields.type} options={selectOptions} onChange={this.onSelectChange} />

          <SelectField field={fields.q} options={this.state.typeaheads}/>          
        <span className="mi-form__submit">
          <button className="uk-button mi-form__submit__button" onClick={ handleSubmit } title="Search">
            <i className="mi-icon mi-icon-search" aria-label="Search" />
          </button>
        </span>
        </div>
      </form>
    );
  }
}

Form.propTypes = {
  fields: PropTypes.object.isRequired,
  focused: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired
};

Form.defaultProps = {
  focused: false
};

export default reduxForm({
  form: 'form',
  fields: ['q', 'type']
}, state => ({
  initialValues: state.query
}))(Form);
