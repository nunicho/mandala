import React from 'react'
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row";
import Col  from "react-bootstrap/Col";

const Footer = () => {

    const currentYear = new Date().getFullYear()

  return (
    <footer>
        <Container>
             <Row>
                <Col className='text-center py-3'>
                    <p>ProShop &copy; {currentYear}</p>
                </Col>
             </Row>
        </Container>
    </footer>
  )
}

export default Footer