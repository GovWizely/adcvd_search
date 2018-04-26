import { map, isEmpty } from 'lodash';
import React from 'react';
import moment from 'moment';

const Segments = ({segments, showSegments, case_number}) => {
	if (isEmpty(segments)) return null;
  const segment_rows = map(segments, (segment) => {
  	const { decision_signed, announcement_date, days_remaining, announcement_type, record_type } = segment;
  	return (
    <tr key={ case_number + announcement_type }>
      <td className="mi-tpp-rates__annual-rates__value">{ record_type }</td>
      <td className="mi-tpp-rates__annual-rates__value">{ announcement_type }</td>
      <td className="mi-tpp-rates__annual-rates__value">{ moment(announcement_date).utc().format('MM-DD-YYYY') }</td>
      <td className="mi-tpp-rates__annual-rates__value">{ days_remaining }</td>
      <td className="mi-tpp-rates__annual-rates__value">{ decision_signed }</td>
    </tr>
  )});
	 return (
	 	<div>
	 		<p>Segments:</p>
	    <table className="mi-tpp-rates__annual-rates">
	      <tbody>
	        <tr>
	          <td className="mi-tpp-rates__annual-rates__label">Record Type</td>
	          <td className="mi-tpp-rates__annual-rates__label">Annoucement Type</td>
	          <td className="mi-tpp-rates__annual-rates__label">Annoucement Date</td>
	          <td className="mi-tpp-rates__annual-rates__label">Days Remaining</td>
	          <td className="mi-tpp-rates__annual-rates__label">Decision Signed</td>
	        </tr>
	        { segment_rows }
	      </tbody>
	    </table>
    </div>
  );
}

class ADCVDOrder extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showSegments: true };
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    this.setState({ showSegments: this.props.showSegments || false });
  }

  showComponentUpdate(nextProps, nextState) {
    return nextState.showSegments !== this.state.showSegments;
  }

  onClick(e) {
    e.preventDefault();
    this.setState({ showSegments: !this.state.showSegments });
  }

  render() {
    const {
      product_short_name, country, case_number, segments, url, product
    } = this.props;
    const { showSegments } = this.state;
    const expanderText = showSegments ? 'Collapse' : 'Expand';
    return (
      <article className="mi-tpp-rates mi-result__item">
        <header className="mi-tpp-rates__header">
          <a href={url.replace('https://beta.trade.gov', '')}>{ country + ", " + product_short_name }</a>
        </header>
        <p>{ product }</p>
        <p>{ case_number }</p>
      </article>
    );
  }
}

export const adcvd_orders = {
  ResultItem: (props, options = {}) => (
    <ADCVDOrder { ...props } showSegments={ options.showSegments } />
  )
};