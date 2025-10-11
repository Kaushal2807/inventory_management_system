import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { paymentsAPI } from '../../services/api';

const PaymentHistoryContainer = styled.div`
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

const Card = styled.div`
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 24px;
    margin-bottom: 24px;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
`;

const Th = styled.th`
    background-color: #34495e;
    color: white;
    padding: 16px 12px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #2c3e50;
    
    &:first-child {
        border-top-left-radius: 8px;
    }
    
    &:last-child {
        border-top-right-radius: 8px;
    }
`;

const Td = styled.td`
    padding: 16px 12px;
    border-bottom: 1px solid #ecf0f1;
    transition: background-color 0.2s;
`;

const Tr = styled.tr`
    &:hover {
        background-color: #f8f9fa;
    }
    
    &:last-child td {
        border-bottom: none;
    }
`;

const LoadingText = styled.div`
    text-align: center;
    padding: 40px;
    color: #6c757d;
    font-size: 16px;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 60px;
    color: #6c757d;
    font-size: 18px;
`;

const Button = styled.button`
    padding: 8px 16px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
    
    &:hover {
        background: #2980b9;
    }
`;

const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #ecf0f1;
    padding-bottom: 16px;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6c757d;
    
    &:hover {
        color: #dc3545;
    }
`;

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadPayments();

        // Test network connectivity
        fetch('http://localhost:8000/payments/')
            .then(response => response.json())
            .then(data => console.log('Direct fetch test:', data))
            .catch(error => console.error('Direct fetch error:', error));
    }, []);

    const loadPayments = async () => {
        try {
            setLoading(true);
            console.log('Loading payments...');
            const response = await paymentsAPI.getAll();
            console.log('Payment response:', response);
            console.log('Payment data:', response.data);

            // The response.data should contain the payments array
            const paymentsData = Array.isArray(response.data) ? response.data : [];
            setPayments(paymentsData);
        } catch (error) {
            console.error('Error loading payments:', error);
            console.error('Error details:', error.response?.data);
            // Set empty array on error to show empty state
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (paymentId) => {
        try {
            const response = await paymentsAPI.getById(paymentId);
            setSelectedPayment(response.data);
            setShowModal(true);
        } catch (error) {
            console.error('Error loading payment details:', error);
            alert('Failed to load payment details');
        }
    };

    const formatDate = (dateString) => {
        // Backend now stores IST time, so just format it directly
        const date = new Date(dateString);

        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toFixed(2)}`;
    };

    return (
        <PaymentHistoryContainer>
            <PageTitle>📜 Payment History</PageTitle>

            <Card>
                {loading ? (
                    <LoadingText>Loading payment history...</LoadingText>
                ) : payments.length === 0 ? (
                    <EmptyState>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                        <div>No payment records found</div>
                        <div style={{ fontSize: '14px', marginTop: '8px', color: '#9ca3af' }}>
                            Payment records will appear here once you start processing payments
                        </div>
                    </EmptyState>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <Th>Payment ID</Th>
                                <Th>Customer Name</Th>
                                <Th>Date</Th>
                                <Th>Total Amount</Th>
                                <Th>Items</Th>
                                <Th>Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <Tr key={payment.id}>
                                    <Td>#{payment.id}</Td>
                                    <Td style={{ fontWeight: 'bold' }}>{payment.customer_name}</Td>
                                    <Td>{formatDate(payment.payment_date)}</Td>
                                    <Td style={{ fontWeight: 'bold', color: '#28a745' }}>
                                        {formatCurrency(payment.total_amount)}
                                    </Td>
                                    <Td>{payment.items_count} item(s)</Td>
                                    <Td>
                                        <Button onClick={() => handleViewDetails(payment.id)}>
                                            View Details
                                        </Button>
                                    </Td>
                                </Tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card>

            {/* Payment Details Modal */}
            {showModal && selectedPayment && (
                <Modal onClick={() => setShowModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <h3>Payment Details - #{selectedPayment.id}</h3>
                            <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
                        </ModalHeader>

                        <div style={{ marginBottom: '20px' }}>
                            <p><strong>Customer:</strong> {selectedPayment.customer_name}</p>
                            <p><strong>Date:</strong> {formatDate(selectedPayment.payment_date)}</p>
                            <p><strong>Discount:</strong> {formatCurrency(selectedPayment.discount)}</p>
                        </div>

                        <h4>Items Purchased:</h4>
                        <Table style={{ marginTop: '12px' }}>
                            <thead>
                                <tr>
                                    <Th>Item</Th>
                                    <Th>Quantity</Th>
                                    <Th>Unit Price</Th>
                                    <Th>Total</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedPayment.payment_items?.map((item) => (
                                    <Tr key={item.id}>
                                        <Td>{item.item_name}</Td>
                                        <Td>{item.quantity}</Td>
                                        <Td>{formatCurrency(item.unit_price)}</Td>
                                        <Td style={{ fontWeight: 'bold' }}>
                                            {formatCurrency(item.total_price)}
                                        </Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </Table>

                        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '2px solid #ecf0f1' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Subtotal:</span>
                                <span>{formatCurrency(selectedPayment.subtotal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Discount:</span>
                                <span>-{formatCurrency(selectedPayment.discount)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                                <span>Total:</span>
                                <span>{formatCurrency(selectedPayment.total_amount)}</span>
                            </div>
                        </div>
                    </ModalContent>
                </Modal>
            )}
        </PaymentHistoryContainer>
    );
};

export default PaymentHistory;
