import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { itemsAPI, categoriesAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Container = styled.div`
  padding: 24px;
  max-width: 800px;
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

const EditItem = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [itemLoading, setItemLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    fetchCategories();
    fetchItem();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchItem = async () => {
    try {
      const response = await itemsAPI.getById(id);
      const item = response.data;

      // Populate form with item data
      setValue('name', item.name);
      setValue('description', item.description || '');
      setValue('categoryId', item.category_id);
      setValue('purchasePrice', item.purchase_price);
      setValue('sellingPrice', item.selling_price);
      setValue('quantity', item.quantity);
      setValue('minStockLevel', item.min_stock_level);

      // Set current image
      if (item.image_url) {
        setCurrentImageUrl(item.image_url);
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      toast.error('Failed to fetch item');
      navigate('/items');
    } finally {
      setItemLoading(false);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append('file', imageFile);

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://inventory-management-backend-xxs3.onrender.com';
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      return result.file_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const removeCurrentImage = () => {
    setCurrentImageUrl(null);
  };

  const removeNewImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Convert data to match backend format
      const itemData = {
        name: data.name,
        description: data.description || '',
        category_id: parseInt(data.categoryId),
        purchase_price: parseFloat(data.purchasePrice),
        selling_price: parseFloat(data.sellingPrice),
        quantity: parseInt(data.quantity),
        min_stock_level: parseInt(data.minStockLevel) || 10
      };

      await itemsAPI.update(id, itemData);
      toast.success('Item updated successfully');
      navigate('/items');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  if (categoriesLoading || itemLoading) {
    return (
      <Container>
        <div>Loading...</div>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader>
        <PageTitle>Edit Item</PageTitle>
        <BackButton to="/items">← Back to Items</BackButton>
      </PageHeader>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label>Item Name *</Label>
          <Input
            type="text"
            {...register('name', { required: 'Item name is required' })}
            placeholder="Enter item name"
          />
          {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Description</Label>
          <TextArea
            {...register('description')}
            placeholder="Enter item description"
          />
        </FormGroup>

        <FormGroup>
          <Label>Category *</Label>
          <Select {...register('categoryId', { required: 'Category is required' })}>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          {errors.categoryId && <ErrorMessage>{errors.categoryId.message}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Purchase Price *</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register('purchasePrice', { required: 'Purchase price is required' })}
            placeholder="0.00"
          />
          {errors.purchasePrice && <ErrorMessage>{errors.purchasePrice.message}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Selling Price *</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register('sellingPrice', { required: 'Selling price is required' })}
            placeholder="0.00"
          />
          {errors.sellingPrice && <ErrorMessage>{errors.sellingPrice.message}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Quantity *</Label>
          <Input
            type="number"
            min="0"
            {...register('quantity', { required: 'Quantity is required' })}
            placeholder="0"
          />
          {errors.quantity && <ErrorMessage>{errors.quantity.message}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Minimum Stock Level</Label>
          <Input
            type="number"
            min="0"
            {...register('minStockLevel')}
            placeholder="10"
          />
        </FormGroup>

        <FormActions>
          <Button type="button" className="secondary" onClick={() => navigate('/items')}>
            Cancel
          </Button>
          <Button type="submit" className="primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Item'}
          </Button>
        </FormActions>
      </Form>
    </Container>
  );
};

export default EditItem;