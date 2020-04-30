import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Vola from '../components/Deribit/Vola/index';
import { start_hist_vola, stop_hist_vola, set_hist_vola_currency, set_hist_vola_timeframe, set_hist_vola_window} from '../redux/actions/saga_http';

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth,
    token: state.auth.token,
    hist_vola_currency: state.saga_http.hist_vola_currency,
    hist_vola_window: state.saga_http.hist_vola_window,
    hist_vola_timeframe: state.saga_http.hist_vola_timeframe,
    hist_vola_data: state.saga_http.hist_vola_data
  };
}
const mapDispatchToProps = dispatch => ({
  start_hist_vola: () => dispatch(start_hist_vola()),
  stop_hist_vola: () => dispatch(stop_hist_vola()),
  set_hist_vola_currency: (currency) => dispatch(set_hist_vola_currency(currency)),
  set_hist_vola_timeframe: (timeframe) => dispatch(set_hist_vola_timeframe(timeframe)),
  set_hist_vola_window: (window) => dispatch(set_hist_vola_window(window)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps)(Vola);
