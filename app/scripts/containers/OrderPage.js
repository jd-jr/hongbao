import {connect} from 'react-redux';
import CreateOrder from '../components/order/CreateOrder';

function mapStateToProps(state, ownProps) {
  const {query} = ownProps.location;

  return {...query};
}

export default connect(mapStateToProps)(CreateOrder);
