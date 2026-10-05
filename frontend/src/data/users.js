const addr = (id, label, name, phone, line1, city, state, pincode, isDefault = false, line2 = '') => ({ id, label, name, phone, line1, line2, city, state, pincode, isDefault })
export const users = [
  { id: 'admin', role: 'admin', name: 'Meera Kapoor', email: 'admin@beautiq.in', phone: '9810011223', password: 'Admin@123', avatar: null, hue: 20, status: 'active', verified: true, joined: '2025-01-10', addresses: [], orders: [], wishlist: [] },
  { id: 'u1', role: 'customer', name: 'Aanya Sharma', email: 'aanya.sharma@example.com', phone: '9811234567', password: 'Beautiq@123', avatar: null, hue: 14, status: 'active', verified: true, joined: '2025-03-14', wishlist: [1, 18, 24, 37],
    addresses: [addr('a1', 'Home', 'Aanya Sharma', '9811234567', '24, Sunder Nagar', 'New Delhi', 'Delhi', '110003', true, 'Near Sunder Nursery'), addr('a2', 'Office', 'Aanya Sharma', '9811234567', 'Tower B, DLF Cyber City', 'Gurugram', 'Haryana', '122002')], orders: [] },
  { id: 'u2', role: 'customer', name: 'Rohan Mehta', email: 'rohan.mehta@example.com', phone: '9820098765', password: 'Beautiq@123', avatar: null, hue: 30, status: 'active', verified: true, joined: '2025-04-02', wishlist: [41, 46],
    addresses: [addr('a1', 'Home', 'Rohan Mehta', '9820098765', '12B, Carter Road, Bandra West', 'Mumbai', 'Maharashtra', '400050', true)], orders: [] },
  { id: 'u3', role: 'customer', name: 'Ishita Banerjee', email: 'ishita.banerjee@example.com', phone: '9830345612', password: 'Beautiq@123', avatar: null, hue: 8, status: 'active', verified: true, joined: '2025-05-21', wishlist: [3, 19, 25, 52, 9],
    addresses: [addr('a1', 'Home', 'Ishita Banerjee', '9830345612', '7/2, Lake Gardens', 'Kolkata', 'West Bengal', '700045', true)], orders: [] },
  { id: 'u4', role: 'customer', name: 'Karthik Raman', email: 'karthik.raman@example.com', phone: '9840123987', password: 'Beautiq@123', avatar: null, hue: 36, status: 'active', verified: true, joined: '2025-06-08', wishlist: [43],
    addresses: [addr('a1', 'Home', 'Karthik Raman', '9840123987', '88, Besant Nagar 3rd Avenue', 'Chennai', 'Tamil Nadu', '600090', true)], orders: [] },
  { id: 'u5', role: 'customer', name: 'Naina Kapoor', email: 'naina.kapoor@example.com', phone: '9876543210', password: 'Beautiq@123', avatar: null, hue: 22, status: 'active', verified: true, joined: '2025-07-19', wishlist: [2, 6, 33],
    addresses: [addr('a1', 'Home', 'Naina Kapoor', '9876543210', 'C-45, Greater Kailash II', 'New Delhi', 'Delhi', '110048', true)], orders: [] },
  { id: 'u6', role: 'customer', name: 'Zoya Ahmed', email: 'zoya.ahmed@example.com', phone: '9845012345', password: 'Beautiq@123', avatar: null, hue: 12, status: 'active', verified: true, joined: '2025-08-30', wishlist: [27, 35, 12],
    addresses: [addr('a1', 'Home', 'Zoya Ahmed', '9845012345', '301, Prestige Shantiniketan', 'Bengaluru', 'Karnataka', '560048', true)], orders: [] },
  { id: 'u7', role: 'customer', name: 'Vikram Singh Rathore', email: 'vikram.rathore@example.com', phone: '9928011122', password: 'Beautiq@123', avatar: null, hue: 34, status: 'active', verified: true, joined: '2025-09-12', wishlist: [45, 49],
    addresses: [addr('a1', 'Home', 'Vikram Singh Rathore', '9928011122', '14, Civil Lines', 'Jaipur', 'Rajasthan', '302006', true)], orders: [] },
  { id: 'u8', role: 'customer', name: 'Priya Nair', email: 'priya.nair@example.com', phone: '9447055512', password: 'Beautiq@123', avatar: null, hue: 18, status: 'active', verified: true, joined: '2025-10-05', wishlist: [20, 21, 30, 38],
    addresses: [addr('a1', 'Home', 'Priya Nair', '9447055512', 'Flat 5C, Marine Drive Apartments', 'Kochi', 'Kerala', '682031', true)], orders: [] },
  { id: 'u9', role: 'customer', name: 'Tanvi Deshpande', email: 'tanvi.deshpande@example.com', phone: '9922334455', password: 'Beautiq@123', avatar: null, hue: 26, status: 'blocked', verified: true, joined: '2025-11-23', wishlist: [],
    addresses: [addr('a1', 'Home', 'Tanvi Deshpande', '9922334455', '56, Koregaon Park Lane 6', 'Pune', 'Maharashtra', '411001', true)], orders: [] },
  { id: 'u10', role: 'customer', name: 'Arjun Malhotra', email: 'arjun.malhotra@example.com', phone: '9814455667', password: 'Beautiq@123', avatar: null, hue: 40, status: 'active', verified: true, joined: '2026-01-17', wishlist: [44, 50],
    addresses: [addr('a1', 'Home', 'Arjun Malhotra', '9814455667', '1203, Sector 17-C', 'Chandigarh', 'Chandigarh', '160017', true)], orders: [] }]
export const reviewerPool = ['Meghna Rao', 'Sanya Gupta', 'Diya Patel', 'Riya Chatterjee', 'Kabir Anand', 'Lakshmi Iyer', 'Farah Khan', 'Simran Kaur', 'Ananya Joshi', 'Pooja Menon', 'Aditi Verma', 'Nikhil Bhatia', 'Sneha Kulkarni', 'Harleen Gill', 'Mansi Agarwal', 'Devika Reddy', 'Aarav Khanna', 'Tara Pillai', 'Jhanvi Shah', 'Rhea Dsouza']
