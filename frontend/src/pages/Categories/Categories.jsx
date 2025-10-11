import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { categoriesAPI } from '../../services/api';
import { toast } from 'react-toastify';

const CategoriesContainer = styled.div`
  padding: 24px;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
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
  font-size: 28px;
`;

const PageActions = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #2980b9;
  }
`;

const TableContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: #34495e;
  color: white;
  
  tr {
    background-color: #34495e !important;
    
    &:hover {
      background-color: #34495e !important;
      cursor: default;
    }
  }
`;

const TableHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  font-weight: 600;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #eee;

  &:hover {
    background-color: #e9ecef !important;
    cursor: pointer;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  vertical-align: top;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &.edit {
    background-color: #f39c12;
    color: white;
  }

  &.delete {
    background-color: #e74c3c;
    color: white;
  }

  &:hover {
    opacity: 0.8;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;

  h3 {
    margin-bottom: 8px;
    color: #2c3e50;
  }

  p {
    margin-bottom: 20px;
    font-size: 14px;
  }
`;

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        filterCategories();
    }, [categories, searchTerm]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoriesAPI.getAll();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
            setCategories([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const filterCategories = () => {
        let filtered = categories;

        if (searchTerm) {
            filtered = filtered.filter(category =>
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredCategories(filtered);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            try {
                await categoriesAPI.delete(id);
                setCategories(categories.filter(category => category.id !== id));
                toast.success('Category deleted successfully');
            } catch (error) {
                console.error('Error deleting category:', error);
                toast.error('Failed to delete category. It may have items associated with it.');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <CategoriesContainer>
                <PageHeader>
                    <PageTitle>Categories</PageTitle>
                </PageHeader>
                <div>Loading...</div>
            </CategoriesContainer>
        );
    }

    return (
        <CategoriesContainer>
            <PageHeader>
                <PageTitle>Categories ({filteredCategories.length})</PageTitle>
                <PageActions>
                    <Button as={Link} to="/categories/add">
                        ➕ Add New Category
                    </Button>
                </PageActions>
            </PageHeader>

            <SearchContainer>
                <SearchInput
                    type="text"
                    placeholder="Search categories by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </SearchContainer>

            <TableContainer>
                {filteredCategories.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell>Name</TableHeaderCell>
                                <TableHeaderCell>Description</TableHeaderCell>
                                <TableHeaderCell>Created Date</TableHeaderCell>
                                <TableHeaderCell>Last Updated</TableHeaderCell>
                                <TableHeaderCell>Actions</TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <strong>{category.name}</strong>
                                    </TableCell>
                                    <TableCell>
                                        {category.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(category.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(category.updated_at)}
                                    </TableCell>
                                    <TableCell>
                                        <ActionButton
                                            className="edit"
                                            onClick={() => navigate(`/categories/edit/${category.id}`)}
                                        >
                                            Edit
                                        </ActionButton>
                                        <ActionButton
                                            className="delete"
                                            onClick={() => handleDelete(category.id)}
                                        >
                                            Delete
                                        </ActionButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <EmptyState>
                        <h3>No categories found</h3>
                        <p>
                            {searchTerm
                                ? 'Try adjusting your search criteria.'
                                : 'Get started by creating your first category.'
                            }
                        </p>
                        {!searchTerm && (
                            <div style={{ marginTop: '20px' }}>
                                <Button as={Link} to="/categories/add">
                                    Create Your First Category
                                </Button>
                            </div>
                        )}
                    </EmptyState>
                )}
            </TableContainer>
        </CategoriesContainer>
    );
};

export default Categories;