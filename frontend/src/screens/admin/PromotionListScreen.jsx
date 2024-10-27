import React from "react";
import {
  useGetPromotionsQuery,
  useCreatePromotionMutation,
  useDeletePromotionMutation,
} from "../../slices/promotionsApiSlice";
import { LinkContainer } from "react-router-bootstrap";
import { Table, Button, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const adjustForTimezone = (date) => {
  if (!date) return "----";
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toLocaleDateString();
};

const PromotionListScreen = () => {
  const {
    data: promotions,
    isLoading,
    isError,
    refetch,
  } = useGetPromotionsQuery();
  const [createPromotion, { isLoading: loadingCreate }] =
    useCreatePromotionMutation();
  const [deletePromotion] = useDeletePromotionMutation();

  const createPromotionHandler = async () => {
    if (window.confirm("¿Está seguro que quiere crear una nueva promoción?")) {
      try {
        await createPromotion();
        refetch();
        toast.success("Promoción creada exitosamente");
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm("¿Está seguro que quiere eliminar esta promoción?")) {
      try {
        await deletePromotion(id).unwrap();
        refetch();
        toast.success("Promoción eliminada exitosamente");
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  if (isLoading) return <Loader />;
  if (isError) return <div>Error loading promotions</div>;

  return (
    <div>
      <Row className="align-items-center">
        <Col>
          <h1>Promociones</h1>
        </Col>
        <Col className="text-end">
          <Button className="btn-sm m-3" onClick={createPromotionHandler}>
            Crear promoción
          </Button>
        </Col>
      </Row>

      {loadingCreate && <Loader />}

      <Table striped bordered hover responsive className="table-sm">
        <thead>
          <tr>
            <th>NOMBRE</th>
            <th>DESCRIPCIÓN</th>
            <th>DESCUENTO (%)</th>
            <th>COMIENZA</th>
            <th>FINALIZA</th>
            <th>ACTIVA</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((promotion) => (
            <tr key={promotion._id}>
              <td>{promotion.name}</td> {/* Nombre primero */}
              <td>{promotion.description || "Sin descripción"}</td>{" "}
              {/* Descripción después */}
              <td>{promotion.discountPercentage}</td>
              <td>{adjustForTimezone(promotion.startDate)}</td>
              <td>{adjustForTimezone(promotion.endDate)}</td>
              <td>{promotion.active ? "Sí" : "No"}</td>
              <td>
                <LinkContainer to={`/admin/promotions/${promotion._id}/edit`}>
                  <Button variant="light" className="btn-sm mx-2">
                    Editar
                  </Button>
                </LinkContainer>
                <Button
                  variant="danger"
                  className="btn-sm mx-2"
                  onClick={() => deleteHandler(promotion._id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default PromotionListScreen;
/*
import React from "react";
import { useGetPromotionsQuery } from "../../slices/promotionsApiSlice";
import { Link } from "react-router-dom";
import { Table, Button } from "react-bootstrap";

const PromotionListScreen = () => {
  const { data: promotions, isLoading, isError } = useGetPromotionsQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading promotions</div>;

  return (
    <div>
      <h1>Promotions</h1>
      <Table striped bordered hover responsive className="table-sm">
        <thead>
          <tr>
            <th>ID</th>
            <th>NOMBRE</th>
            <th>Start Date</th>
            <th>Expiration Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((promotion) => (
            <tr key={promotion._id}>
              <td>{promotion._id}</td>
              <td>{promotion.name}</td>
              <td>{new Date(promotion.startDate).toLocaleDateString()}</td>
              <td>{new Date(promotion.endDate).toLocaleDateString()}</td>
              <td>
                <Link to={`/admin/promotion/${promotion._id}/edit`}>
                  <Button variant="light" className="btn-sm">
                    Edit
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default PromotionListScreen;

*/
