import React from 'react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions';

import { Menu, Icon } from 'semantic-ui-react';

class DirectMessages extends React.Component {
  state = {
    activeChannel: '',
    user: this.props.currentUser,
    users: [],
    usersRef: firebase.database().ref('users'),
    connectedRef: firebase.database().ref('.info/connected'),
    presenceRef: firebase.database().ref('presence'),
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }

    // window.addEventListener('focus', this.onFocus);
    // window.addEventListener('blur', this.onBlur);
  }
  componentWilUnmount() {
    // window.removeEventListener('focus', this.onFocus);
    // window.removeEventListener('blur', this.onBlur);
    this.removeListeners();
  }

  removeListeners = () => {
    this.state.usersRef.off();
    this.state.presenceRef.off();
    this.state.connectedRef.off();
  };
  // onFocus = () => {
  //   console.log('this tab in focus');
  // };

  onBlur = () => {
    const currentUserUid = this.state.user.uid;
    console.log('other tab in focus');
  };

  addListeners = (currentUserUid) => {
    let loadedUsers = [];
    this.state.usersRef.on('child_added', (snap) => {
      if (currentUserUid !== snap.key) {
        let user = snap.val();
        user['uid'] = snap.key;
        user['status'] = 'offline';
        loadedUsers.push(user);
        this.setState({ users: loadedUsers });
      }
    });

    // Track users online status
    this.state.connectedRef.on('value', (snap) => {
      if (snap.val() === true) {
        const ref = this.state.presenceRef.child(currentUserUid);
        ref.set(true);
        ref.onDisconnect().remove((err) => {
          if (err !== null) {
            console.log(err);
          }
        });
      }
    });

    this.state.presenceRef.on('child_added', (snap) => {
      if (currentUserUid !== snap.key) {
        // Add status to user
        this.addStatusToUser(snap.key);
      }
    });

    this.state.presenceRef.on('child_removed', (snap) => {
      if (currentUserUid !== snap.key) {
        // Add status to user
        this.addStatusToUser(snap.key, false);
      }
    });
  };

  addStatusToUser = (userId, connected = true) => {
    const updatedUsers = this.state.users.reduce((acc, user) => {
      if ((user.uid = userId)) {
        user['status'] = `${connected ? 'online' : 'offline'}`;
        // this.updateOnConnect();
        // this.updateOnAway();
        // this.updateOnDisconnect();
      }
      return acc.concat(user);
    }, []);
    this.setState({ users: updatedUsers });
  };

  isUserOnline = (user) => user.status === 'online';

  // make isUserAway function

  changeChannel = (user) => {
    const channelId = this.getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name,
    };
    this.props.setCurrentChannel(channelData);
    this.props.setPrivateChannel(true);
    this.setActiveChannel(user.uid);
    // console.log(user);
    // console.log(this.state.users);
  };

  getChannelId = (userId) => {
    const currentUserId = this.state.user.uid;
    return userId < currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };

  setActiveChannel = (userId) => {
    this.setState({ activeChannel: userId });
  };

  render() {
    const { users, activeChannel } = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> Direct Messages
          </span>{' '}
          ({users.length})
        </Menu.Item>
        {/* Users to Send Direct Messages */}
        {users.map((user) => (
          <Menu.Item
            active={user.uid === activeChannel}
            key={user.uid}
            onClick={() => this.changeChannel(user)}
            style={{ opacity: 0.7, fontStyle: 'italic' }}
          >
            <Icon
              name="circle"
              color={this.isUserOnline(user) ? 'green' : 'red'}
            />
            @ {user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}
export default connect(null, { setCurrentChannel, setPrivateChannel })(
  DirectMessages
);
