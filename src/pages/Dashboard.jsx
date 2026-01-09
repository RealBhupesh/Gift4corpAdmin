import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendURL, currency } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ token }) => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all'); // today, thisMonth, lastMonth, custom, all
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    pendingPayments: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    processingOrders: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!token) return;

    try {
      const response = await axios.post(
        backendURL + '/api/order/list',
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        const allOrders = response.data.orders;
        
        // Filter orders based on selected filter
        const filteredOrders = filterOrders(allOrders);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate statistics based on filtered orders
        const todayOrders = filteredOrders.filter(order => {
          const orderDate = new Date(order.date);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        });

        const pendingPayments = filteredOrders.filter(order => !order.payment);
        const shippedOrders = filteredOrders.filter(order => order.status === 'Shipped');
        const deliveredOrders = filteredOrders.filter(order => order.status === 'Delivered');
        const processingOrders = filteredOrders.filter(order => 
          order.status !== 'Shipped' && order.status !== 'Delivered' && order.status !== 'Cancelled'
        );

        const todayRevenue = todayOrders
          .filter(order => order.payment)
          .reduce((sum, order) => sum + order.amount, 0);

        const totalRevenue = filteredOrders
          .filter(order => order.payment)
          .reduce((sum, order) => sum + order.amount, 0);

        // Count total products sold in filtered orders
        const totalProducts = filteredOrders.reduce((sum, order) => {
          return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        // Calculate top selling products
        const productStats = {};
        filteredOrders.forEach(order => {
          order.items.forEach(item => {
            const productId = item._id;
            if (!productStats[productId]) {
              productStats[productId] = {
                id: productId,
                name: item.name,
                image: item.image ? item.image[0] : null,
                category: item.category,
                quantitySold: 0,
                revenue: 0,
                orderCount: 0
              };
            }
            productStats[productId].quantitySold += item.quantity;
            productStats[productId].revenue += item.price * item.quantity;
            productStats[productId].orderCount += 1;
          });
        });

        // Sort by quantity sold and get top 10
        const topSellingProducts = Object.values(productStats)
          .sort((a, b) => b.quantitySold - a.quantitySold)
          .slice(0, 10);

        setTopProducts(topSellingProducts);

        setStats({
          totalOrders: filteredOrders.length,
          todayOrders: todayOrders.length,
          pendingPayments: pendingPayments.length,
          shippedOrders: shippedOrders.length,
          deliveredOrders: deliveredOrders.length,
          todayRevenue: todayRevenue,
          totalRevenue: totalRevenue,
          processingOrders: processingOrders.length,
          totalProducts: totalProducts,
        });

        // Get 5 most recent filtered orders
        setRecentOrders(filteredOrders.slice(0, 5));
      } else {
        toast.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (orders) => {
    const now = new Date();
    
    switch(filterType) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return orders.filter(order => {
          const orderDate = new Date(order.date);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        });
      
      case 'thisMonth':
        return orders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate.getMonth() === now.getMonth() && 
                 orderDate.getFullYear() === now.getFullYear();
        });
      
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return orders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate.getMonth() === lastMonth.getMonth() && 
                 orderDate.getFullYear() === lastMonth.getFullYear();
        });
      
      case 'custom':
        if (!selectedMonth) return orders;
        const [year, month] = selectedMonth.split('-');
        return orders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate.getMonth() === parseInt(month) - 1 && 
                 orderDate.getFullYear() === parseInt(year);
        });
      
      case 'all':
      default:
        return orders;
    }
  };

  const getFilterLabel = () => {
    switch(filterType) {
      case 'today': return 'Today';
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'custom': return selectedMonth ? new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Select Month';
      case 'all': return 'All Time';
      default: return 'Today';
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, filterType, selectedMonth]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center glass-card px-6 py-5'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto'></div>
          <p className='mt-4 text-muted'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className={`glass-card p-6 border ${color}`}>
      <div className='flex justify-between items-start'>
        <div>
          <p className='text-muted text-sm font-medium'>{title}</p>
          <p className='text-3xl font-semibold mt-2 text-[var(--text)]'>{value}</p>
          {subtitle && <p className='text-sm text-muted mt-1'>{subtitle}</p>}
        </div>
        <div className='text-4xl'>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className='pb-8 space-y-8'>
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div>
          <h2 className='page-title'>Dashboard</h2>
          <p className='text-muted text-sm'>Overview of orders, revenue, and fulfillment.</p>
        </div>
        
        {/* Filter Section */}
        <div className='glass-surface flex flex-wrap gap-3 items-center px-4 py-3'>
          <span className='text-sm font-medium text-muted'>Filter:</span>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              if (e.target.value !== 'custom') {
                setSelectedMonth('');
              }
            }}
            className='glass-input text-sm'
          >
            <option value='all'>All Time</option>
            <option value='today'>Today</option>
            <option value='thisMonth'>This Month</option>
            <option value='lastMonth'>Last Month</option>
            <option value='custom'>Custom Month</option>
          </select>
          
          {filterType === 'custom' && (
            <input
              type='month'
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              max={new Date().toISOString().slice(0, 7)}
              className='glass-input text-sm'
            />
          )}
          
          <div className='glass-pill text-sm'>
            Showing: {getFilterLabel()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          title='Total Orders'
          value={stats.totalOrders}
          icon='📦'
          color='border-[color-mix(in srgb,var(--accent)_55%,transparent)]'
          subtitle={`${stats.totalProducts} products sold`}
        />
        <StatCard
          title='Pending Payments'
          value={stats.pendingPayments}
          icon='⏳'
          color='border-[color-mix(in srgb,var(--warning)_60%,transparent)]'
        />
        <StatCard
          title='Shipped Orders'
          value={stats.shippedOrders}
          icon='🚚'
          color='border-[color-mix(in srgb,var(--success)_60%,transparent)]'
        />
        <StatCard
          title='Delivered Orders'
          value={stats.deliveredOrders}
          icon='✅'
          color='border-[color-mix(in srgb,var(--accent-2)_60%,transparent)]'
        />
      </div>

      {/* Additional Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <StatCard
          title='Processing Orders'
          value={stats.processingOrders}
          icon='⚙️'
          color='border-[color-mix(in srgb,var(--warning)_60%,transparent)]'
        />
        <StatCard
          title='Total Revenue'
          value={`${currency}${stats.totalRevenue.toFixed(2)}`}
          icon='💰'
          color='border-[color-mix(in srgb,var(--success)_60%,transparent)]'
        />
        <StatCard
          title='Products Sold'
          value={stats.totalProducts}
          icon='📊'
          color='border-[color-mix(in srgb,var(--accent)_60%,transparent)]'
        />
      </div>

      {/* Recent Orders */}
      <div className='glass-card p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='section-title'>Recent Orders</h3>
          <button
            onClick={() => navigate('/orders')}
            className='btn btn-ghost text-sm'
          >
            View All →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className='text-center py-8 text-muted'>
            <p>No orders yet</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='glass-table'>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr
                    key={index}
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className='cursor-pointer'
                  >
                    <td>
                      <span className='font-mono font-medium'>#{order._id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td>
                      <div>
                        <p className='font-medium'>{order.address.firstName} {order.address.lastName}</p>
                        <p className='text-xs text-muted'>{order.address.city}</p>
                      </div>
                    </td>
                    <td>{order.items.length}</td>
                    <td className='font-semibold'>{currency}{order.amount}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Delivered'
                            ? 'bg-[color-mix(in_srgb,var(--success)_18%,transparent)] text-[var(--success)]'
                            : order.status === 'Shipped'
                            ? 'bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--accent)]'
                            : order.status === 'Cancelled'
                            ? 'bg-[color-mix(in_srgb,var(--danger)_18%,transparent)] text-[var(--danger)]'
                            : 'bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-[var(--warning)]'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.payment
                            ? 'bg-[color-mix(in_srgb,var(--success)_18%,transparent)] text-[var(--success)]'
                            : 'bg-[color-mix(in_srgb,var(--danger)_18%,transparent)] text-[var(--danger)]'
                        }`}
                      >
                        {order.payment ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Selling Products */}
      <div className='glass-card p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='section-title'>Top Selling Products</h3>
          <button
            onClick={() => navigate('/list')}
            className='btn btn-ghost text-sm'
          >
            View All Products →
          </button>
        </div>

        {topProducts.length === 0 ? (
          <div className='text-center py-8 text-muted'>
            <p>No products sold yet</p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='glass-table'>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Units Sold</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index}>
                    <td>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-[color-mix(in_srgb,var(--warning)_20%,transparent)] text-[var(--warning)]' :
                        index === 1 ? 'bg-[color-mix(in_srgb,var(--muted)_15%,transparent)] text-[var(--muted)]' :
                        index === 2 ? 'bg-[color-mix(in_srgb,var(--danger)_15%,transparent)] text-[var(--danger)]' :
                        'bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                    </td>
                    <td>
                      <div className='flex items-center gap-3'>
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className='w-12 h-12 object-cover rounded border border-[var(--glass-stroke)]'
                          />
                        )}
                        <div>
                          <p className='font-medium text-[var(--text)]'>{product.name}</p>
                          <p className='text-xs text-muted'>ID: {product.id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className='glass-pill text-xs'>
                        {product.category || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className='flex items-center gap-2'>
                        <span className='font-bold text-lg text-[var(--accent)]'>{product.quantitySold}</span>
                        <span className='text-muted text-xs'>units</span>
                      </div>
                    </td>
                    <td className='font-medium'>{product.orderCount}</td>
                    <td className='font-semibold text-[var(--success)]'>
                      {currency}{product.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
