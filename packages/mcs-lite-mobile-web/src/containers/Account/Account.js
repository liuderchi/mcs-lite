import React from 'react';
import styled from 'styled-components';
import { Button, Heading } from 'mcs-lite-ui';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { actions } from '../../modules/auth';
import Logo from '../../components/Logo';

const FlatButton = styled(Button)`
  border: initial;
  border-radius: initial;
  height: 56px;
  border-top: 1px solid white;
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
`;

const Body = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const StyledLog = styled(Logo)`
  margin-bottom: 32px;
`;

const Footer = styled.footer`
  width: 100%;
`;

const Account = ({ username, signout }) =>
  <Container>
    <Body>
      <StyledLog />
      <Heading level={4}>{username}</Heading>
      <Heading level={4}>你好</Heading>
    </Body>
    <Footer>
      <Link to="/devices">
        <FlatButton block>我的裝置</FlatButton>
      </Link>
      <Link>
        <FlatButton block>更改密碼</FlatButton>
      </Link>
      <FlatButton block onClick={signout}>登出</FlatButton>
    </Footer>
  </Container>;

export default connect(
  ({ auth }) => ({ username: auth.username }),
  { signout: actions.signout },
)(Account);
