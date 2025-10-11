import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { categoriesAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Container = styled.div`
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  margin: 0;
  color: #2c3e50;
`;

const BackButton = styled(Link)`
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;

  &:hover {
    background-color: #5a6268;
  }
`;

const Form = styled.form`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #2c3e50;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &.primary {
    background-color: #3498db;
    color: white;
  }

  &.secondary {
    background-color: #6c757d;
    color: white;
  }

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
  display: block;
`;

const EditCategory = () => {
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await categoriesAPI.getById(id);
      const category = response.data;

      setValue('name', category.name);
      setValue('description', category.description || '');
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to fetch category');
      navigate('/categories');
    } finally {
      setCategoryLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const categoryData = {
        name: data.name,
        description: data.description || ''
      };

      await categoriesAPI.update(id, categoryData);
      toast.success('Category updated successfully');
      navigate('/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  if (categoryLoading) {
    return (
      <Container>
        <div>Loading...</div>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader>
        <PageTitle>Edit Category</PageTitle>
        <BackButton to="/categories">← Back to Categories</BackButton>
      </PageHeader>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label>Category Name *</Label>
          <Input
            type="text"
            {...register('name', { required: 'Category name is required' })}
            placeholder="Enter category name"
          />
          {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Description</Label>
          <TextArea
            {...register('description')}
            placeholder="Enter category description"
          />
        </FormGroup>

        <FormActions>
          <Button type="button" className="secondary" onClick={() => navigate('/categories')}>
            Cancel
          </Button>
          <Button type="submit" className="primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Category'}
          </Button>
        </FormActions>
      </Form>
    </Container>
  );
};

export default EditCategory;