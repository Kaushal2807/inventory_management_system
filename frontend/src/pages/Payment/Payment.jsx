import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { itemsAPI, paymentsAPI } from '../../services/api';
import PaymentHistory from './PaymentHistory';

const PaymentContainer = styled.div`
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
`;

const PageTitle = styled.h1`
    color: #2c3e50;
    margin-bottom: 32px;
    font-size: 28px;
    font-weight: 600;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
`;

const HeaderButton = styled.button`
    padding: 12px 24px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: background-color 0.2s;
    
    &:hover {
        background: #2980b9;
    }
`;

const PaymentForm = styled.div`
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 32px;
    margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
    color: #34495e;
    margin-bottom: 24px;
    font-size: 20px;
    font-weight: 500;
    border-bottom: 2px solid #ecf0f1;
    padding-bottom: 8px;
`;

const ItemRow = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 80px;
    gap: 16px;
    align-items: center;
    padding: 16px;
    border: 1px solid #ecf0f1;
    border-radius: 8px;
    margin-bottom: 12px;
    background: #f8f9fa;
    
    &:hover {
        background: #f1f3f4;
    }
`;

const ItemHeaderRow = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 80px;
    gap: 16px;
    align-items: center;
    padding: 12px 16px;
    background: #34495e;
    color: white;
    border-radius: 8px;
    margin-bottom: 16px;
    font-weight: 600;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const Label = styled.label`
    color: #34495e;
    font-weight: 500;
    margin-bottom: 4px;
    font-size: 14px;
`;

const Select = styled.select`
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    cursor: pointer;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const Input = styled.input`
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    
    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
    
    &[type="number"] {
        text-align: right;
    }
`;

const Button = styled.button`
    padding: 8px 16px;
    background: ${props => props.variant === 'danger' ? '#dc3545' : '#3498db'};
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
    
    &:hover {
        background: ${props => props.variant === 'danger' ? '#c82333' : '#2980b9'};
    }
    
    &:disabled {
        background: #6c757d;
        cursor: not-allowed;
    }
`;

const AddButton = styled(Button)`
    background: #28a745;
    padding: 12px 24px;
    margin-bottom: 24px;
    
    &:hover {
        background: #218838;
    }
`;

const TotalSection = styled.div`
    background: #f8f9fa;
    border: 2px solid #dee2e6;
    border-radius: 12px;
    padding: 24px;
    margin-top: 24px;
`;

const TotalRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 16px;
    
    &.subtotal {
        border-bottom: 1px solid #dee2e6;
        margin-bottom: 8px;
        padding-bottom: 12px;
    }
    
    &.total {
        font-size: 20px;
        font-weight: bold;
        color: #2c3e50;
        border-top: 2px solid #34495e;
        margin-top: 12px;
        padding-top: 12px;
    }
`;

const DiscountRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin: 16px 0;
`;

const DiscountInput = styled(Input)`
    max-width: 120px;
`;

const ProcessButton = styled(Button)`
    background: #28a745;
    padding: 16px 32px;
    font-size: 18px;
    font-weight: 600;
    width: 100%;
    margin-top: 24px;
    
    &:hover {
        background: #218838;
    }
`;

const Payment = () => {
    const [items, setItems] = useState([]);
    const [paymentItems, setPaymentItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [extraDiscount, setExtraDiscount] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [currentView, setCurrentView] = useState('payment'); // 'payment' or 'history'

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setLoading(true);
            const response = await itemsAPI.getAll();
            setItems(response.data);
        } catch (error) {
            console.error('Error loading items:', error);
        } finally {
            setLoading(false);
        }
    };

    const addPaymentItem = () => {
        const newItem = {
            id: Date.now(),
            itemId: '',
            quantity: 1,
            itemData: null
        };
        setPaymentItems([...paymentItems, newItem]);
    };

    const removePaymentItem = (id) => {
        setPaymentItems(paymentItems.filter(item => item.id !== id));
    };

    const updatePaymentItem = (id, field, value) => {
        setPaymentItems(paymentItems.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };

                // If item is selected, get item data
                if (field === 'itemId' && value) {
                    const selectedItem = items.find(i => i.id === parseInt(value));
                    if (selectedItem) {
                        updatedItem.itemData = selectedItem;
                    }
                }

                return updatedItem;
            }
            return item;
        }));
    };

    const calculateSubtotal = () => {
        return paymentItems.reduce((total, item) => {
            const sellPrice = item.itemData?.selling_price || 0;
            return total + (item.quantity * sellPrice);
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal - extraDiscount;
    };

    const handleProcessPayment = async () => {
        if (paymentItems.length === 0) {
            toast.error('Please add at least one item to process payment');
            return;
        }

        if (!customerName.trim()) {
            toast.error('Please enter customer name');
            return;
        }

        const invalidItems = paymentItems.filter(item => !item.itemId || item.quantity <= 0);
        if (invalidItems.length > 0) {
            toast.error('Please ensure all items have valid selection and quantity');
            return;
        }

        try {
            // Prepare payment data for API
            const paymentData = {
                customer_name: customerName.trim(),
                items: paymentItems.map(item => ({
                    item_id: parseInt(item.itemId),
                    quantity: item.quantity
                })),
                discount: extraDiscount
            };

            console.log('Sending payment data:', paymentData);

            // Send to backend
            const response = await paymentsAPI.create(paymentData);

            toast.success(`Payment processed successfully! Payment ID: ${response.data.id}`);

            // Reset form
            setPaymentItems([]);
            setExtraDiscount(0);
            setCustomerName('');

            // Reload items to get updated stock
            loadItems();

        } catch (error) {
            console.error('Payment processing error:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to process payment. Please try again.';
            toast.error(`Error: ${errorMessage}`);
        }
    };

    if (loading) {
        return (
            <PaymentContainer>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading items...</div>
                </div>
            </PaymentContainer>
        );
    }

    return (
        <PaymentContainer>
            <PageHeader>
                <PageTitle>Payment Processing</PageTitle>
                <HeaderButton onClick={() => setCurrentView(currentView === 'payment' ? 'history' : 'payment')}>
                    {currentView === 'payment' ? '📜 Payment History' : 'Back to Payment'}
                </HeaderButton>
            </PageHeader>

            {currentView === 'history' ? (
                <PaymentHistory />
            ) : (
                <>
                    <PaymentForm>
                        <SectionTitle> 💬 Customer Information</SectionTitle>
                        <FormGroup style={{ marginBottom: '24px' }}>
                            <Label>Customer Name *</Label>
                            <Input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Enter customer name..."
                                required
                            />
                        </FormGroup>

                        <SectionTitle>🛒 Item Selection</SectionTitle>

                        {items.filter(item => item.quantity > 0 && item.selling_price > 0).length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px',
                                color: '#6c757d',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                border: '1px solid #dee2e6'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                                <div style={{ fontSize: '18px', marginBottom: '8px' }}>No items available for sale</div>
                                <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                                    Items must have stock quantity &gt; 0 and selling price &gt; 0 to be available for sale.
                                    <br />
                                    Please add stock or update item prices in the Items section.
                                </div>
                            </div>
                        ) : (
                            <>
                                <AddButton onClick={addPaymentItem}>
                                    + Add Item
                                </AddButton>

                                {paymentItems.length > 0 && (
                                    <>
                                        <ItemHeaderRow>
                                            <div>Item</div>
                                            <div>Quantity</div>
                                            <div>Unit Price</div>
                                            <div>Total</div>
                                            <div>Action</div>
                                        </ItemHeaderRow>

                                        {paymentItems.map((paymentItem) => (
                                            <ItemRow key={paymentItem.id}>
                                                <FormGroup>
                                                    <Select
                                                        value={paymentItem.itemId}
                                                        onChange={(e) => updatePaymentItem(paymentItem.id, 'itemId', e.target.value)}
                                                    >
                                                        <option value="">Select an item...</option>
                                                        {items
                                                            .filter(item => item.quantity > 0 && item.selling_price > 0)
                                                            .map(item => (
                                                                <option key={item.id} value={item.id}>
                                                                    {item.name} (Stock: {item.quantity}) - ₹{item.selling_price}
                                                                </option>
                                                            ))}
                                                    </Select>
                                                </FormGroup>

                                                <FormGroup>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max={paymentItem.itemData?.quantity || 999}
                                                        value={paymentItem.quantity}
                                                        onChange={(e) => updatePaymentItem(paymentItem.id, 'quantity', parseInt(e.target.value) || 1)}
                                                    />
                                                </FormGroup>

                                                <FormGroup>
                                                    <div style={{ padding: '12px', background: '#e9ecef', borderRadius: '6px', fontSize: '14px' }}>
                                                        ₹{paymentItem.itemData?.selling_price?.toFixed(2) || '0.00'}
                                                    </div>
                                                </FormGroup>

                                                <FormGroup>
                                                    <div style={{ padding: '12px', background: '#d4edda', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold' }}>
                                                        ₹{(paymentItem.quantity * (paymentItem.itemData?.selling_price || 0)).toFixed(2)}
                                                    </div>
                                                </FormGroup>

                                                <Button
                                                    variant="danger"
                                                    onClick={() => removePaymentItem(paymentItem.id)}
                                                >
                                                    ✕
                                                </Button>
                                            </ItemRow>
                                        ))}
                                    </>
                                )}

                                {paymentItems.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                                        No items added yet. Click "Add Item" to start building your invoice.
                                    </div>
                                )}
                            </>
                        )}
                    </PaymentForm>

                    {paymentItems.length > 0 && (
                        <TotalSection>
                            <SectionTitle>💰 Payment Summary</SectionTitle>

                            <TotalRow className="subtotal">
                                <span>Subtotal:</span>
                                <span>₹{calculateSubtotal().toFixed(2)}</span>
                            </TotalRow>

                            <DiscountRow>
                                <Label>Extra Discount:</Label>
                                <DiscountInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={calculateSubtotal()}
                                    value={extraDiscount}
                                    onChange={(e) => setExtraDiscount(parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                />
                                <span>₹{extraDiscount.toFixed(2)}</span>
                            </DiscountRow>

                            <TotalRow className="total">
                                <span>Total Amount:</span>
                                <span>₹{calculateTotal().toFixed(2)}</span>
                            </TotalRow>

                            <ProcessButton onClick={handleProcessPayment}>
                                🎯 Process Payment
                            </ProcessButton>
                        </TotalSection>
                    )}
                </>
            )}
        </PaymentContainer>
    );
};

export default Payment;