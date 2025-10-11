import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { stockMovementsAPI, itemsAPI } from '../../services/api';

const Container = styled.div`
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
`;

const Header = styled.div`
    display: flex;
    justify-content: between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 15px;
`;

const Title = styled.h1`
    color: #333;
    margin: 0;
    font-size: 2rem;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
`;

const Button = styled.button`
    background: ${props => props.variant === 'primary' ? '#007bff' :
        props.variant === 'success' ? '#28a745' :
            props.variant === 'danger' ? '#dc3545' : '#6c757d'};
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;

    &:hover {
        opacity: 0.9;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const TabContainer = styled.div`
    margin-bottom: 20px;
`;

const TabButtons = styled.div`
    display: flex;
    border-bottom: 1px solid #ddd;
    margin-bottom: 20px;
`;

const TabButton = styled.button`
    background: none;
    border: none;
    padding: 12px 20px;
    cursor: pointer;
    font-size: 16px;
    color: ${props => props.active ? '#007bff' : '#666'};
    border-bottom: ${props => props.active ? '2px solid #007bff' : '2px solid transparent'};
    transition: all 0.2s;

    &:hover {
        color: #007bff;
    }
`;

const Card = styled.div`
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 20px;
    margin-bottom: 20px;
`;

const FormGroup = styled.div`
    margin-bottom: 15px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #333;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const Select = styled.select`
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    min-height: 80px;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Th = styled.th`
    background: #34495e;
    color: white;
    padding: 16px;
    text-align: left;
    font-weight: 600;
    border-bottom: 1px solid #dee2e6;
`;

const Td = styled.td`
    padding: 16px;
    border-bottom: 1px solid #dee2e6;
    color: #333;
    vertical-align: top;
`;

const Badge = styled.span`
    background: ${props => props.type === 'in' ? '#28a745' : '#dc3545'};
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
`;

const LoadingText = styled.div`
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 16px;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 40px;
    color: #666;
`;

const StockMovements = () => {
    const [activeTab, setActiveTab] = useState('summary');
    const [stockSummary, setStockSummary] = useState([]);
    const [stockMovements, setStockMovements] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        item_id: '',
        movement_type: 'in',
        quantity: '',
        reason: '',
        reference_number: ''
    });

    useEffect(() => {
        if (activeTab === 'summary') {
            fetchStockSummary();
        } else if (activeTab === 'movements') {
            fetchStockMovements();
        }
        fetchItems();
    }, [activeTab]);

    const fetchStockSummary = async () => {
        setLoading(true);
        try {
            const response = await stockMovementsAPI.getSummary();
            setStockSummary(response.data.items);
        } catch (error) {
            toast.error('Failed to fetch stock summary');
            console.error('Error fetching stock summary:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStockMovements = async () => {
        setLoading(true);
        try {
            const response = await stockMovementsAPI.getAll();
            setStockMovements(response.data);
        } catch (error) {
            toast.error('Failed to fetch stock movements');
            console.error('Error fetching stock movements:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async () => {
        try {
            const response = await itemsAPI.getAll();
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.item_id || !formData.quantity) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await stockMovementsAPI.create({
                ...formData,
                quantity: parseInt(formData.quantity)
            });

            toast.success(`Stock ${formData.movement_type === 'in' ? 'added' : 'removed'} successfully`);
            setFormData({
                item_id: '',
                movement_type: 'in',
                quantity: '',
                reason: '',
                reference_number: ''
            });
            setShowForm(false);

            // Refresh data
            if (activeTab === 'summary') {
                fetchStockSummary();
            } else {
                fetchStockMovements();
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create stock movement');
            console.error('Error creating stock movement:', error);
        }
    };

    const getItemName = (itemId) => {
        const item = items.find(item => item.id === itemId);
        return item ? item.name : 'Unknown Item';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <Container>
            <Header>
                <Title>Stock In/Out Management</Title>
                <ButtonGroup>
                    <Button
                        variant="primary"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancel' : 'Record Movement'}
                    </Button>
                </ButtonGroup>
            </Header>

            {showForm && (
                <Card>
                    <h3 style={{ marginTop: 0 }}>Record Stock Movement</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                            <FormGroup>
                                <Label>Item *</Label>
                                <Select
                                    name="item_id"
                                    value={formData.item_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select an item</option>
                                    {items.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} (Current: {item.quantity})
                                        </option>
                                    ))}
                                </Select>
                            </FormGroup>

                            <FormGroup>
                                <Label>Movement Type *</Label>
                                <Select
                                    name="movement_type"
                                    value={formData.movement_type}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="in">Stock In</option>
                                    <option value="out">Stock Out</option>
                                </Select>
                            </FormGroup>

                            <FormGroup>
                                <Label>Quantity *</Label>
                                <Input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    min="1"
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Reference Number</Label>
                                <Input
                                    type="text"
                                    name="reference_number"
                                    value={formData.reference_number}
                                    onChange={handleInputChange}
                                    placeholder="PO#, Invoice#, etc."
                                />
                            </FormGroup>
                        </div>

                        <FormGroup>
                            <Label>Reason</Label>
                            <TextArea
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                placeholder="Reason for stock movement"
                            />
                        </FormGroup>

                        <ButtonGroup>
                            <Button type="submit" variant="primary">
                                Record Movement
                            </Button>
                            <Button type="button" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                        </ButtonGroup>
                    </form>
                </Card>
            )}

            <TabContainer>
                <TabButtons>
                    <TabButton
                        active={activeTab === 'summary'}
                        onClick={() => setActiveTab('summary')}
                    >
                        Stock Summary
                    </TabButton>
                    <TabButton
                        active={activeTab === 'movements'}
                        onClick={() => setActiveTab('movements')}
                    >
                        Movement History
                    </TabButton>
                </TabButtons>
            </TabContainer>

            {loading ? (
                <LoadingText>Loading...</LoadingText>
            ) : (
                <>
                    {activeTab === 'summary' && (
                        <Card>
                            {/* <h3 style={{ marginTop: 0 }}>Stock Summary</h3> */}
                            {stockSummary.length === 0 ? (
                                <EmptyState>No stock data available</EmptyState>
                            ) : (
                                <Table>
                                    <thead>
                                        <tr>
                                            <Th>Item Name</Th>
                                            <Th>Category</Th>
                                            <Th>Total Stock In</Th>
                                            <Th>Total Stock Out</Th>
                                            <Th>Current Stock</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockSummary.map(item => (
                                            <tr key={item.item_id}>
                                                <Td><strong>{item.item_name}</strong></Td>
                                                <Td>{item.category_name}</Td>
                                                <Td style={{ color: '#28a745', fontWeight: 'bold' }}>
                                                    +{item.stock_in}
                                                </Td>
                                                <Td style={{ color: '#dc3545', fontWeight: 'bold' }}>
                                                    -{item.stock_out}
                                                </Td>
                                                <Td style={{ fontWeight: 'bold' }}>
                                                    {item.current_quantity}
                                                </Td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card>
                    )}

                    {activeTab === 'movements' && (
                        <Card>
                            {/* <h3 style={{ marginTop: 0 }}>Movement History</h3> */}
                            {stockMovements.length === 0 ? (
                                <EmptyState>No stock movements recorded</EmptyState>
                            ) : (
                                <Table>
                                    <thead>
                                        <tr>
                                            <Th>Date</Th>
                                            <Th>Item</Th>
                                            <Th>Type</Th>
                                            <Th>Quantity</Th>
                                            <Th>Reference</Th>
                                            <Th>Reason</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockMovements.map(movement => (
                                            <tr key={movement.id}>
                                                <Td>{formatDate(movement.created_at)}</Td>
                                                <Td><strong>{getItemName(movement.item_id)}</strong></Td>
                                                <Td>
                                                    <Badge type={movement.movement_type}>
                                                        {movement.movement_type}
                                                    </Badge>
                                                </Td>
                                                <Td style={{
                                                    color: movement.movement_type === 'in' ? '#28a745' : '#dc3545',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                                                </Td>
                                                <Td>{movement.reference_number || '-'}</Td>
                                                <Td>{movement.reason || '-'}</Td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card>
                    )}
                </>
            )}
        </Container>
    );
};

export default StockMovements;