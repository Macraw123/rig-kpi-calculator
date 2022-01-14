import { Container, Button } from "react-bootstrap";

const NotFound = () => {
  return (
    <Container>
      <h2 class="display-5">404 Not Found</h2>
      <Button variant="danger" href="/">
        Go to Home
      </Button>
    </Container>
  );
};

export default NotFound;
