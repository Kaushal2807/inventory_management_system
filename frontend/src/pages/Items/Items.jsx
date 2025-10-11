import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { itemsAPI, categoriesAPI } from '../../services/api';

const ItemsContainer = styled.div`
  padding: 24px;
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

const FilterSelect = styled.select`
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

const StockBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => props.isLow ? '#dc3545' : '#28a745'};
  color: white;
`;

const Items = () => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterItems();
    }, [items, searchTerm, selectedCategory]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [itemsResponse, categoriesResponse] = await Promise.all([
                itemsAPI.getAll(),
                categoriesAPI.getAll()
            ]);

            setItems(itemsResponse.data || []);
            setCategories(categoriesResponse.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
            setItems([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const filterItems = () => {
        let filtered = items;

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (selectedCategory) {
            const categoryId = parseInt(selectedCategory);
            filtered = filtered.filter(item =>
                (item.categoryId || item.category_id) === categoryId
            );
        }

        setFilteredItems(filtered);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await itemsAPI.delete(id);
                toast.success('Item deleted successfully');
                fetchData();
            } catch (error) {
                console.error('Error deleting item:', error);
                toast.error('Failed to delete item');
            }
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'Unknown';
    };

    // Helper functions to handle both camelCase and snake_case properties
    const getPrice = (item, type) => {
        if (type === 'purchase') {
            return Number(item.purchasePrice || item.purchase_price || 0);
        }
        return Number(item.sellingPrice || item.selling_price || 0);
    };

    const getCategoryId = (item) => {
        return item.categoryId || item.category_id || 0;
    };

    const getMinStockLevel = (item) => {
        return item.minStockLevel || item.min_stock_level || 10;
    };

    if (loading) {
        return (
            <ItemsContainer>
                <PageHeader>
                    <PageTitle>Items</PageTitle>
                </PageHeader>
                <div>Loading...</div>
            </ItemsContainer>
        );
    }

    return (
        <ItemsContainer>
            <PageHeader>
                <PageTitle>Items ({filteredItems.length})</PageTitle>
                <PageActions>
                    <Button as={Link} to="/items/add">
                        ➕ Add New Item
                    </Button>
                </PageActions>
            </PageHeader>

            <SearchContainer>
                <SearchInput
                    type="text"
                    placeholder="Search items by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FilterSelect
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </FilterSelect>
            </SearchContainer>

            {filteredItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                    {searchTerm || selectedCategory ? 'No items match your search criteria.' : 'No items found. Add your first item!'}
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>Item Details</TableHeaderCell>
                            <TableHeaderCell>Category</TableHeaderCell>
                            <TableHeaderCell>Purchase Price</TableHeaderCell>
                            <TableHeaderCell>Selling Price</TableHeaderCell>
                            <TableHeaderCell>Quantity</TableHeaderCell>
                            <TableHeaderCell>Stock Status</TableHeaderCell>
                            <TableHeaderCell>Actions</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div>
                                        <strong>{item.name}</strong>
                                        {item.description && (
                                            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                                                {item.description}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{getCategoryName(getCategoryId(item))}</TableCell>
                                <TableCell>₹ {getPrice(item, 'purchase').toFixed(2)}</TableCell>
                                <TableCell>₹ {getPrice(item, 'selling').toFixed(2)}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>
                                    <StockBadge isLow={item.quantity < getMinStockLevel(item)}>
                                        {item.quantity < getMinStockLevel(item) ? 'Low Stock' : 'In Stock'}
                                    </StockBadge>
                                </TableCell>
                                <TableCell>
                                    <ActionButton
                                        className="edit"
                                        onClick={() => navigate(`/items/edit/${item.id}`)}
                                    >
                                        Edit
                                    </ActionButton>
                                    <ActionButton
                                        className="delete"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        Delete
                                    </ActionButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </ItemsContainer>
    );
};

export default Items;