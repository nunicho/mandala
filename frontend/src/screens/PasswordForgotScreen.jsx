import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import FormContainer from "../components/FormContainer";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { useForgotPasswordMutation } from "../slices/usersApiSlice";

const PasswordForgotScreen = () => {
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
   e.preventDefault();
    try {
      //const { data } = await forgotPassword({ email }).unwrap();
      // toast.success(`Email enviado a ${data.email}`); // Mostrar notificación de éxito
      const data  = await forgotPassword({ email }).unwrap();
      toast.success(data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  return (
    <FormContainer>
      <h1>Recuperar Contraseña</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="email" className="my-3">
          <Form.Label> Dirección de email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Ingrese su email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Button
          type="submit"
          variant="primary"
          className="mt-2"
          disabled={isLoading}
        >
          Enviar enlace de recuperación
        </Button>
        {isLoading && <Loader />}
      </Form>
    </FormContainer>
  );
};

export default PasswordForgotScreen;
