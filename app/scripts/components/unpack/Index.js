import React, {Component, PropTypes} from 'react';
import Modal from 'reactjs-modal';
import callApi from '../../fetch';
import BottomNav from '../BottomNav';

class Unpack extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      visible: false,
      detail: null
    };
    this.open = this.open.bind(this);
  }

  componentDidMount() {
    this.validateHongbao();
  }

  open() {
    this.context.router.push('/my');
  }

  validateHongbao() {
    const url = 'prepare/qiang';
    const {id} = this.props;
    // id 表示红包 id
    const body = {
      identifier: id
    };

    callApi({url, body}).then(
      ({json, response}) => {
        this.setState({
          visible: true,
          detail: {}
        });
      },
      (error) => {

      }
    );
  }

  renderModal() {
    const {visible} = this.state;
    let modal;
    if (visible) {
      modal = (
        <Modal
          visible={visible}
          className="hb-modal"
          bodyStyle={{height: '32rem'}}
        >
          <div className="hb-ellipse-arc-mask">
            <div className="hb-ellipse-arc-flat flex-items-middle flex-items-center">
              <div>
                <h2>我在京东钱包发起了个实物和现金红包，快来抢啊！</h2>
              </div>
            </div>
            <div className="hb-btn-circle flex-items-middle flex-items-center" onTouchTap={this.open}>开</div>
          </div>
        </Modal>
      );
    }
    return modal;
  }

  render() {
    const {detail} = this.state;
    if (!detail) {
      return null;
    }

    return (
      <div>
        {this.renderModal()}
        <article className="hb-wrap-mb">
          <section className="hb-nav-btn-group row">
            <div className="col-12 hb-nav-btn-left active">我收到的</div>
            <div className="col-12 hb-nav-btn-right">我发出的</div>
          </section>
        </article>
        <BottomNav type="receive"/>
      </div>
    );
  }
}

Unpack.contextTypes = {
  router: PropTypes.object.isRequired
};

Unpack.propTypes = {
  id: PropTypes.string,
};

export default Unpack;
