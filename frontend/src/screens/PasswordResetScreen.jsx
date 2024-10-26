import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";
import FormContainer from "../components/FormContainer";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { useResetPasswordMutation } from "../slices/usersApiSlice";

const PasswordResetScreen = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");

  const submitHandler = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    try {
      const  data  = await resetPassword({ token, newPassword }).unwrap();
      toast.success(data.message); // Mostrar notificación de éxito
      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  return (
    <FormContainer>
      <h1>Restablecer Contraseña</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="newPassword" className="my-3">
          <Form.Label>Nueva Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Ingrese nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="confirmPassword" className="my-3">
          <Form.Label>Confirmar Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirme nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Button
          type="submit"
          variant="primary"
          className="mt-2"
          disabled={isLoading}
        >
          Restablecer Contraseña
        </Button>
        {isLoading && <Loader />}
      </Form>
      <Row className="py-3">
        <Col>
          <Link to="/login">Volver al inicio de sesión</Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default PasswordResetScreen;
