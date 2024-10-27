import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { useGetCategoriesQuery } from "../slices/productsApiSlice"; // Ajusta la ruta si es necesario

const SearchBoxCategory = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: categories = [], isLoading, error } = useGetCategoriesQuery();

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (selectedCategory.trim()) {
      navigate(`/search/category/${selectedCategory}`);
      setSelectedCategory(""); // Reinicia el campo de selección después de enviar
    } else {
      navigate("/");
    }
  };

  return (
    <Form onSubmit={submitHandler} className="d-flex">
      <Form.Control
        as="select"
        name="category"
        value={selectedCategory}
        onChange={handleCategoryChange}
        className="mr-sm-2 ml-sm-5"
      >
        <option value="">Select Category...</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Form.Control>
      <Button type="submit" variant="outline-light" className="p-2 mx-2">
        Search
      </Button>
    </Form>
  );
};

export default SearchBoxCategory;
