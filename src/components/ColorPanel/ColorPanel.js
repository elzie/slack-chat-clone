import React from 'react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setColors } from '../../actions';

import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Grid,
  Icon,
  Label,
  Segment,
} from 'semantic-ui-react';
import { SketchPicker } from 'react-color';

class ColorPanel extends React.Component {
  state = {
    modal: false,
    primary: '',
    secondary: '',
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users'),
    userColors: [],
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListener(this.state.user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListener();
  }

  removeListener = () => {
    this.state.usersRef.child(`${this.state.user.uid}/colors`).off();
  };

  addListener = (userId) => {
    let userColors = [];
    this.state.usersRef.child(`${userId}/colors`).on('child_added', (snap) => {
      userColors.unshift(snap.val());
      console.log(userColors);
      this.setState({ userColors });
    });
  };

  displayUserColors = (colors) =>
    colors.length > 0 &&
    colors.map((color, i) => (
      <React.Fragment key={i}>
        <Divider />
        <div
          className="color__container"
          onClick={() => this.props.setColors(color.primary, color.secondary)}
        >
          <div className="color__square" style={{ background: color.primary }}>
            <div
              className="color__overlay"
              style={{ background: color.secondary }}
            ></div>
          </div>
        </div>
      </React.Fragment>
    ));

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChangePrimary = (color) => this.setState({ primary: color.hex });

  handleChangeSecondary = (color) => this.setState({ secondary: color.hex });

  handleSaveColors = () => {
    if (this.state.primary && this.state.secondary) {
      this.saveColors(this.state.primary, this.state.secondary);
    }
  };
  saveColors = (primary, secondary) => {
    this.state.usersRef
      .child(`${this.state.user.uid}/colors`)
      .push()
      .update({
        primary,
        secondary,
      })
      .then(() => {
        console.log('Colors added');
        this.closeModal();
      })
      .catch((err) => console.error(err));
  };

  render() {
    const { modal, primary, secondary, userColors } = this.state;
    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />
        {this.displayUserColors(userColors)}
        {/* Colorpicker */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose App Colors</Modal.Header>
          <Modal.Content>
            <Grid columns="equal">
              <Grid.Column>
                <Segment inverted>
                  <Label content="Primary Color" />
                  <SketchPicker
                    color={primary}
                    onChange={this.handleChangePrimary}
                  />
                </Segment>
              </Grid.Column>
              <Grid.Column>
                <Segment inverted>
                  <Label content="Secondary Color" />
                  <SketchPicker
                    color={secondary}
                    onChange={this.handleChangeSecondary}
                  />
                </Segment>
              </Grid.Column>
            </Grid>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark" /> Save Colors
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

export default connect(null, { setColors })(ColorPanel);
