import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Table, Button, Row, Col } from "react-bootstrap";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { toast } from "react-toastify";
import {
  useGetProductsQuery,
} from "../../slices/productsApiSlice";
import {
  useAddProductPromotionMutation,
  useRemoveProductPromotionMutation,
  useGetPromotionDetailQuery,
} from "../../slices/promotionsApiSlice";

const PromotionProductsScreen = () => {
  const { id: promotionId } = useParams();
  const { pageNumber = 1 } = useParams(); // Asegúrate de que `pageNumber` esté presente

  const {
    data: productsData,
    isLoading,
    error,
  } = useGetProductsQuery({ pageNumber });
  const {
    isLoading: isLoadingPromotion,
    error: errorPromotion,
  } = useGetPromotionDetailQuery(promotionId);

  const [products, setProducts] = useState(productsData?.products || []);
  const [addProductPromotion] = useAddProductPromotionMutation();
  const [removeProductPromotion] = useRemoveProductPromotionMutation();

  useEffect(() => {
    // Actualizar el estado de los productos cuando los datos cambian
    setProducts(productsData?.products || []);
  }, [productsData]);

  useEffect(() => {
    // Actualizar el estado de los productos después de una mutación
    // Nota: Aquí también podrías refetch los datos si es necesario
    if (productsData) {
      setProducts(productsData.products);
    }
  }, [productsData, addProductPromotion, removeProductPromotion]);

  const toggleProductPromotionHandler = async (product) => {
    try {
      if (product.promotions.includes(promotionId)) {
        // Eliminar producto de la promoción
        await removeProductPromotion({
          promotionId,
          productId: product._id,
        }).unwrap();
        toast.success("Producto quitado de la promoción");

        // Actualizar el estado local
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p._id === product._id
              ? {
                  ...p,
                  promotions: p.promotions.filter(
                    (promo) => promo !== promotionId
                  ),
                }
              : p
          )
        );
      } else {
        // Agregar producto a la promoción
        await addProductPromotion({
          promotionId,
          productId: product._id,
        }).unwrap();
        toast.success("Producto agregado a la promoción");

        // Actualizar el estado local
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p._id === product._id
              ? { ...p, promotions: [...p.promotions, promotionId] }
              : p
          )
        );
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Productos en Promoción</h1>
        </Col>
        <Col className="text-end">
          <Link
            to={`/admin/promotions/${promotionId}/edit`}
            className="btn btn-light my-3"
          >
            Regresar
          </Link>
        </Col>
      </Row>
      {isLoading || isLoadingPromotion ? (
        <Loader />
      ) : error || errorPromotion ? (
        <Message variant="danger">
          {error?.data?.message ||
            error.error ||
            errorPromotion?.data?.message ||
            errorPromotion.error}
        </Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>NOMBRE</th>
              <th>STOCK</th>
              <th>PROMOCIÓN</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {products?.length > 0 ? (
              products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>{product.countInStock}</td>
                  <td>
                    {product.promotions.includes(promotionId) ? "Sí" : "No"}
                  </td>
                  <td>
                    <Button
                      variant={
                        product.promotions.includes(promotionId)
                          ? "danger"
                          : "success"
                      }
                      className="btn-sm"
                      onClick={() => toggleProductPromotionHandler(product)}
                    >
                      {product.promotions.includes(promotionId)
                        ? "Quitar"
                        : "Agregar"}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No hay productos disponibles</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default PromotionProductsScreen;
/*


import React from "react";
import { Link, useParams } from "react-router-dom";
import { Table, Button, Row, Col } from "react-bootstrap";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { toast } from "react-toastify";
import {
  useGetProductsQuery,
  useUpdateProductMutation,
} from "../../slices/productsApiSlice";
import { useGetPromotionDetailQuery } from "../../slices/promotionsApiSlice";

const PromotionProductsScreen = () => {
  const { id: promotionId } = useParams();
  const { pageNumber = 1 } = useParams(); // Asegúrate de que `pageNumber` esté presente

  // Consulta para obtener productos
  const {
    data: productsData,
    isLoading,
    error,
  } = useGetProductsQuery({ pageNumber });
  const {
    data: promotion,
    isLoading: isLoadingPromotion,
    error: errorPromotion,
  } = useGetPromotionDetailQuery(promotionId);

  const [updateProduct] = useUpdateProductMutation();

  // Debugging logs
  console.log("Products Data:", productsData);
  console.log("Promotion:", promotion);
  console.log("Error:", error);
  console.log("ErrorPromotion:", errorPromotion);

  const toggleProductPromotionHandler = async (product) => {
    try {
      await updateProduct({
        ...product,
        promotion: product.promotion === promotionId ? null : promotionId,
      }).unwrap();
      toast.success(
        `Producto ${
          product.promotion === promotionId ? "quitado de" : "agregado a"
        } la promoción`
      );
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Productos en Promoción</h1>
        </Col>
        <Col className="text-end">
          <Link
            to={`/admin/promotions/${promotionId}/edit`}
            className="btn btn-light my-3"
          >
            Regresar
          </Link>
        </Col>
      </Row>
      {isLoading || isLoadingPromotion ? (
        <Loader />
      ) : error || errorPromotion ? (
        <Message variant="danger">
          {error?.data?.message ||
            error.error ||
            errorPromotion?.data?.message ||
            errorPromotion.error}
        </Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>NOMBRE</th>
              <th>STOCK</th>
              <th>PROMOCIÓN</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {productsData?.products?.length > 0 ? (
              productsData.products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>{product.countInStock}</td>
                  <td>{product.promotion === promotionId ? "Sí" : "No"}</td>
                  <td>
                    <Button
                      variant={
                        product.promotion === promotionId ? "danger" : "success"
                      }
                      className="btn-sm"
                      onClick={() => toggleProductPromotionHandler(product)}
                    >
                      {product.promotion === promotionId ? "Quitar" : "Agregar"}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No hay productos disponibles</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default PromotionProductsScreen;

*/
