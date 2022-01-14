import { useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Button, Container, Alert, Spinner, Navbar } from "react-bootstrap";

// Login Form
const Login = (props) => {
  const usernameRef = useRef();
  const passwordRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    props.login(usernameRef.current.value, passwordRef.current.value);
  };

  return (
    <Container
      className="w-50 p-3 d-flex justify-content-center flex-column"
      fluid
    >
      {props.isError ? (
        <Alert variant="danger">
          <Alert.Heading>Oh snap! You got an error</Alert.Heading>
          <p>
            Invalid initial or password! Please change your initial or password!
          </p>
        </Alert>
      ) : null}
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Login</Card.Title>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                className="form-control"
                id="username"
                ref={usernameRef}
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                ref={passwordRef}
              />
            </div>
            {props.isLoading ? (
              <Button variant="primary" disabled>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              </Button>
            ) : (
              <Button variant="primary" type="submit">
                Login
              </Button>
            )}
          </form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
