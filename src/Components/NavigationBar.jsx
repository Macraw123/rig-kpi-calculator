import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import "./Navbar.css";
import logo from "../Assets/binus.png";

const NavigationBar = (props) => {
  return (
    <Navbar collapseOnSelect expand="lg" variant="dark" bg="dark" sticky="top">
      <Container fluid>
        <Navbar.Brand href="/">
          <img
            alt=""
            src={logo}
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{" "}
          KPI Calculator
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <NavDropdown
              title="Capability Building and Execution"
              id="collasible-nav-dropdown"
              menuVariant="dark"
            >
              <NavDropdown.Item href="/questionnaire">
                Questionnaire Evaluation
              </NavDropdown.Item>
              <NavDropdown.Item href="/ontime-casemaking">
                Ontime Case Making
              </NavDropdown.Item>
              <NavDropdown.Item href="/ontime-evaluating">
                Ontime Schedule of Evaluating and Marking Validity
              </NavDropdown.Item>
              <NavDropdown.Item href="/teaching-attendance-absence">
                Teaching Attendance and Absence
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown
              title="Recognition"
              id="collapsible-nav-dropdown"
              menuVariant="dark"
            >
              <NavDropdown.Item href="/tpa">TPA/RIG</NavDropdown.Item>
              <NavDropdown.Item href="/passing-grade">
                Student Passing Grade
              </NavDropdown.Item>
              <NavDropdown.Item href="/qualification">
                Subject Qualification
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown
              title="Enabler"
              id="collapsible-nav-dropdown"
              menuVariant="dark"
            >
              <NavDropdown.Item href="/additional-class">
                Additional Class
              </NavDropdown.Item>
              <NavDropdown.Item href="/involvement">
                Involvement
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          {props.profile ? (
            <Nav>
              <Navbar.Text>Signed in as: {props.profile.Username}</Navbar.Text>
              <Button onClick={props.handleLogout}>Sign out</Button>
            </Nav>
          ) : (
            ""
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
