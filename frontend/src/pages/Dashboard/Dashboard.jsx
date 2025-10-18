import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { dashboardAPI, itemsAPI } from '../../services/api';

const DashboardContainer = styled.div`
  padding: 24px;
`;

const PageTitle = styled.h1`
  margin: 0 0 24px 0;
  color: #2c3e50;
  font-size: 28px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color || '#3498db'};
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${props => props.color || '#2c3e50'};
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Section = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: #f8f9fa;
`;

const TableHeaderCell = styled.th`
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #dee2e6;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #eee;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 12px;
`;

const StockBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background-color: #dc3545;
  color: white;
`;

const Dashboard = () => {
    const [stats, setStats] = useState({});
    const [lowStockItems, setLowStockItems] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Try to get dashboard stats, if not available, calculate from items
            let dashboardStats = {};
            try {
                const statsResponse = await dashboardAPI.getStats();
                dashboardStats = statsResponse.data;

                // Fetch category distribution data
                const categoryResponse = await fetch('/api/dashboard/category-distribution');
                const categories = await categoryResponse.json();
                setCategoryData(categories);
            } catch (error) {
                console.log('Dashboard stats endpoint not available, calculating from items...');
                const itemsResponse = await itemsAPI.getAll();
                const items = itemsResponse.data;

                // Calculate stats manually
                const totalValue = items.reduce((sum, item) => {
                    const price = item.sellingPrice || item.selling_price || 0;
                    return sum + (price * item.quantity);
                }, 0);

                const lowStock = items.filter(item => {
                    const minLevel = item.minStockLevel || item.min_stock_level || 10;
                    return item.quantity < minLevel;
                });

                dashboardStats = {
                    totalItems: items.length,
                    total_items: items.length,
                    totalCategories: 0, // We'll need to fetch categories separately
                    total_categories: 0,
                    lowStockItems: lowStock.length,
                    low_stock_items: lowStock.length,
                    totalValue: totalValue,
                    total_value: totalValue
                };

                setLowStockItems(lowStock);
                setCategoryData([]); // Empty category data if backend not available
            }

            setStats(dashboardStats);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            console.log('Backend not available, using empty data');
            setStats({
                totalItems: 0,
                totalCategories: 0,
                lowStockItems: 0,
                totalValue: 0,
                total_items: 0,
                total_categories: 0,
                low_stock_items: 0,
                total_value: 0
            });
            setLowStockItems([]);
            setCategoryData([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatValue = (stat, field) => {
        return stat[field] || stat[field.replace(/([A-Z])/g, '_$1').toLowerCase()] || 0;
    };

    if (loading) {
        return (
            <DashboardContainer>
                <PageTitle>Dashboard</PageTitle>
                <div>Loading...</div>
            </DashboardContainer>
        );
    }

    return (
        <DashboardContainer>
            <PageTitle>Dashboard</PageTitle>

            <StatsGrid>
                <StatCard color="#3498db">
                    <StatValue color="#3498db">
                        {getStatValue(stats, 'totalItems')}
                    </StatValue>
                    <StatLabel>Total Items</StatLabel>
                </StatCard>

                <StatCard color="#2ecc71">
                    <StatValue color="#2ecc71">
                        {getStatValue(stats, 'totalCategories')}
                    </StatValue>
                    <StatLabel>Categories</StatLabel>
                </StatCard>

                <StatCard color="#e74c3c">
                    <StatValue color="#e74c3c">
                        {getStatValue(stats, 'lowStockItems')}
                    </StatValue>
                    <StatLabel>Low Stock Items</StatLabel>
                </StatCard>

                <StatCard color="#f39c12">
                    <StatValue color="#f39c12">
                        ₹ {getStatValue(stats, 'totalValue').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </StatValue>
                    <StatLabel>Total Inventory Value</StatLabel>
                </StatCard>
            </StatsGrid>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {/* Stock Status Chart */}
                <Section>
                    <SectionTitle>📊 Stock Distribution</SectionTitle>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                        <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                            {/* Simple Donut Chart */}
                            <svg width="180" height="180" viewBox="0 0 180 180">
                                <circle
                                    cx="90"
                                    cy="90"
                                    r="70"
                                    fill="none"
                                    stroke="#e9ecef"
                                    strokeWidth="20"
                                />
                                <circle
                                    cx="90"
                                    cy="90"
                                    r="70"
                                    fill="none"
                                    stroke="#28a745"
                                    strokeWidth="20"
                                    strokeDasharray={`${(Math.max(0, getStatValue(stats, 'totalItems') - getStatValue(stats, 'lowStockItems')) / Math.max(1, getStatValue(stats, 'totalItems'))) * 440} 440`}
                                    strokeDashoffset="0"
                                    transform="rotate(-90 90 90)"
                                />
                                <circle
                                    cx="90"
                                    cy="90"
                                    r="70"
                                    fill="none"
                                    stroke="#dc3545"
                                    strokeWidth="20"
                                    strokeDasharray={`${(getStatValue(stats, 'lowStockItems') / Math.max(1, getStatValue(stats, 'totalItems'))) * 440} 440`}
                                    strokeDashoffset={`-${(Math.max(0, getStatValue(stats, 'totalItems') - getStatValue(stats, 'lowStockItems')) / Math.max(1, getStatValue(stats, 'totalItems'))) * 440}`}
                                    transform="rotate(-90 90 90)"
                                />
                            </svg>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                                    {Math.round((Math.max(0, getStatValue(stats, 'totalItems') - getStatValue(stats, 'lowStockItems')) / Math.max(1, getStatValue(stats, 'totalItems'))) * 100)}%
                                </div>
                                <div style={{ fontSize: '12px', color: '#6c757d' }}>Well Stocked</div>
                            </div>
                        </div>
                        <div style={{ marginLeft: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ width: '12px', height: '12px', backgroundColor: '#28a745', borderRadius: '50%', marginRight: '8px' }}></div>
                                <span style={{ fontSize: '14px' }}>Well Stocked ({Math.max(0, getStatValue(stats, 'totalItems') - getStatValue(stats, 'lowStockItems'))})</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: '12px', height: '12px', backgroundColor: '#dc3545', borderRadius: '50%', marginRight: '8px' }}></div>
                                <span style={{ fontSize: '14px' }}>Low Stock ({getStatValue(stats, 'lowStockItems')})</span>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Value Distribution */}
                <Section>
                    <SectionTitle>💰 Inventory Value</SectionTitle>
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f39c12', marginBottom: '16px' }}>
                            ₹{getStatValue(stats, 'totalValue').toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <div style={{ fontSize: '16px', color: '#6c757d', marginBottom: '20px' }}>Total Inventory Worth</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '20px' }}>
                            <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3498db' }}>
                                    ₹{(getStatValue(stats, 'totalValue') / Math.max(1, getStatValue(stats, 'totalItems'))).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6c757d' }}>Avg Value/Item</div>
                            </div>
                            <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2ecc71' }}>
                                    {getStatValue(stats, 'totalCategories')}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6c757d' }}>Categories</div>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Items vs Categories Chart */}
                <Section>
                    <SectionTitle>📊 Items vs Categories</SectionTitle>
                    <div style={{ padding: '20px 0' }}>
                        {categoryData.length > 0 ? (
                            <div>
                                {/* Chart Title */}
                                {/* <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '16px', color: '#6c757d', marginBottom: '10px' }}>
                                        Distribution of {getStatValue(stats, 'totalItems')} items across {getStatValue(stats, 'totalCategories')} categories
                                    </div>
                                </div> */}

                                {/* Bar Chart */}
                                <div style={{ marginBottom: '20px' }}>
                                    {categoryData.map((category, index) => {
                                        const maxItems = Math.max(...categoryData.map(c => c.item_count));
                                        const percentage = maxItems > 0 ? (category.item_count / maxItems) * 100 : 0;
                                        const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'];
                                        const color = colors[index % colors.length];

                                        return (
                                            <div key={category.category_name} style={{ marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>
                                                        {category.category_name}
                                                    </span>
                                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: color }}>
                                                        {category.item_count} items
                                                    </span>
                                                </div>
                                                <div style={{
                                                    width: '100%',
                                                    height: '20px',
                                                    backgroundColor: '#f8f9fa',
                                                    borderRadius: '10px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${percentage}%`,
                                                        height: '100%',
                                                        backgroundColor: color,
                                                        borderRadius: '10px',
                                                        transition: 'width 0.6s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-end',
                                                        paddingRight: '8px'
                                                    }}>
                                                        {percentage > 20 && (
                                                            <span style={{
                                                                fontSize: '12px',
                                                                color: 'white',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {Math.round((category.item_count / getStatValue(stats, 'totalItems')) * 100)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {percentage <= 20 && (
                                                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                                                        {Math.round((category.item_count / getStatValue(stats, 'totalItems')) * 100)}%
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                                <div style={{ fontSize: '16px' }}>No category data available</div>
                                <div style={{ fontSize: '14px', marginTop: '8px' }}>Add some categories and items to see the distribution</div>
                            </div>
                        )}
                    </div>
                </Section>

                {/* Status Summary */}
                <Section>
                    <SectionTitle>📈 System Status</SectionTitle>
                    <div style={{ padding: '20px 0' }}>
                        {getStatValue(stats, 'lowStockItems') === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#155724', marginBottom: '8px' }}>All Good!</div>
                                <div style={{ fontSize: '14px', color: '#155724' }}>All items are well stocked</div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8d7da', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>⚠️</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#721c24', marginBottom: '8px' }}>Action Needed</div>
                                <div style={{ fontSize: '14px', color: '#721c24' }}>
                                    {getStatValue(stats, 'lowStockItems')} item{getStatValue(stats, 'lowStockItems') > 1 ? 's' : ''} need{getStatValue(stats, 'lowStockItems') === 1 ? 's' : ''} restocking
                                </div>
                            </div>
                        )}
                    </div>
                </Section>
            </div >
        </DashboardContainer >
    );
};

export default Dashboard;