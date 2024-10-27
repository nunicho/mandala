import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import FormContainer from "../../components/FormContainer";
import { toast } from "react-toastify";
import {
  useGetPromotionDetailQuery,
  useUpdatePromotionMutation,
  useTogglePromotionMutation,
} from "../../slices/promotionsApiSlice";

const PromotionEditScreen = () => {
  const { id: promotionId } = useParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState(""); // Estado para descripción
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [duration, setDuration] = useState(7); // Estado para duración
  const [active, setActive] = useState(false);

  const {
    data: promotion,
    isLoading,
    refetch,
    error,
  } = useGetPromotionDetailQuery(promotionId);

  const [updatePromotion, { isLoading: loadingUpdate }] =
    useUpdatePromotionMutation();
  const [togglePromotionStatus, { isLoading: loadingToggle }] =
    useTogglePromotionMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (promotion) {
      setName(promotion.name);
      setDescription(promotion.description || ""); // Configura descripción si existe
      setDiscountPercentage(promotion.discountPercentage);
      setDuration(promotion.duration || 7); // Configura duración si existe
      setActive(promotion.active);
    }
  }, [promotion]);

  const handleNameChange = (e) => setName(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value); // Manejador para descripción
  const handleDiscountPercentageChange = (e) =>
    setDiscountPercentage(e.target.value);
  const handleDurationChange = (e) => setDuration(Number(e.target.value)); // Manejador para duración

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updatePromotion({
        promotionId,
        name,
        description, // Agregamos description aquí
        discountPercentage,
        duration, // Agregamos duration aquí
      }).unwrap();
      toast.success("Promoción actualizada");
      refetch();
      navigate("/admin/promotions");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const toggleStatusHandler = async () => {
    try {
      await togglePromotionStatus({ promotionId, active: !active }).unwrap();
      setActive(!active);
      toast.success(
        `Promoción ${!active ? "activada" : "desactivada"} exitosamente`
      );
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link to="/admin/promotions" className="btn btn-light my-3">
        Regresar
      </Link>
      <FormContainer>
        <h1>Editar promoción</h1>
        {loadingUpdate && <Loader />}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error.data.message}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId="name" className="my-2">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresar nombre"
                value={name}
                onChange={handleNameChange}
              />
            </Form.Group>
            <Form.Group controlId="description" className="my-2">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresar descripción"
                value={description}
                onChange={handleDescriptionChange}
              />
            </Form.Group>
            <Form.Group controlId="discountPercentage" className="my-2">
              <Form.Label>Descuento (%)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingresar descuento"
                value={discountPercentage}
                onChange={handleDiscountPercentageChange}
              />
            </Form.Group>
            <Form.Group controlId="duration" className="my-2">
              <Form.Label>Duración (días)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingresar duración en días"
                value={duration}
                onChange={handleDurationChange}
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="my-2">
              Actualizar
            </Button>
            <Button
              type="button"
              variant={active ? "danger" : "success"}
              className="my-2"
              onClick={toggleStatusHandler}
              disabled={loadingToggle}
            >
              {active ? "Desactivar" : "Activar"}
            </Button>
            <Button
              type="button"
              variant="info"
              className="my-2"
              onClick={() =>
                navigate(`/admin/promotions/${promotionId}/products`)
              }
            >
              Productos
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default PromotionEditScreen;
